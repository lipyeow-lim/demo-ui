from ariadne import (
    QueryType,
    gql,
    make_executable_schema,
    snake_case_fallback_resolvers,
)
from ariadne.asgi import GraphQL
from starlette.middleware.cors import CORSMiddleware
from databricks import sql
import asyncio
import datetime
import json
from jinja2 import Template


def open_connections(cfg):
    conn_list = {}
    for ws in cfg["endpoints"]:
        if ws["type"] == "databricks-sql":
            conn_list[ws["name"]] = sql.connect(**ws["conn"])
        else:
            assert False, f"Unsupported endpoint type {ws['type']}"
    return conn_list


def close_connections(conn_list):
    for (name, conn) in conn_list.items():
        conn.close()


# not recursive for now
def jsonify(row):
    rec = {}
    for (k, v) in row.asDict().items():
        if type(v) == datetime.datetime:
            rec[k] = v.isoformat()
        elif type(v) == datetime.date:
            rec[k] = v.isoformat()
        else:
            rec[k] = v
    return rec


def flatten(t):
    return [item for sublist in t for item in sublist]


async def query_one(name, conn, sqlstr):
    # print("Querying " + name + "...")
    with conn.cursor() as cur:
        cur.execute(sqlstr)
        res = cur.fetchall()
    return [jsonify(r) for r in res]


# args is a dict that contains the mapping of variables in the templates to actual values
# eg. template = "hello there, {{name}}!", args = {"name": "John Smith"}
# TODO: some sql validation
def gen_sql_str(sql_template_str, args):
    t = Template(sql_template_str)
    sql_str = t.render(args)
    return sql_str


# non-coro version
def execute_query(conn, sqlstr):
    with conn.cursor() as cur:
        cur.execute(sqlstr)
        res = cur.fetchall()
    return [jsonify(r) for r in res]


async def concurrent_query_all(conn_list, sqlstr):
    coros = []
    for (name, conn) in conn_list.items():
        coros.append(query_one(name, conn, sqlstr))
    result = await asyncio.gather(*coros)
    return flatten(result)


def extract_column_defs(json_row):
    assert type(json_row) == dict
    cols = []
    for f in json_row.keys():
        cols.append({"title": f, "field": f})
    return cols


with open("cfg.json", "r") as fp:
    cfg = json.load(fp)

type_defs = gql(
    """
  type ColumnDef {
    title: String!
    field: String!
  }
  type Table {
    data: String!
    colstr: String!
    columns: [ ColumnDef! ]
  }
  type Query {
    getData(endpoint: String!, query: String!, args: String) : Table
  }
"""
)

# Create type instance for Query type defined in our schema...
query = QueryType()

# TODO: use a pool of persistent connections to avoid open/close in each call
@query.field("getData")
async def resolve_getData(_, info, endpoint, query, args):
    conn_list = open_connections(cfg)
    assert endpoint in conn_list, f"Endpoint {endpoint} not in conn_list"
    conn = conn_list[endpoint]
    # use jinja templating to appyl args to query template
    template_args = json.loads(args)
    sqlstr = gen_sql_str(query, template_args)
    results = execute_query(conn, sqlstr)
    # results = await concurrent_query_all(conn_list, query)
    close_connections(conn_list)
    print(f"PARAMS:\nendpoint = {endpoint},\nargs = {args},\nquery=\n{query}")
    print(f"SQL str:\n{sqlstr}")
    col_defs = []
    if len(results) > 0:
        col_defs = extract_column_defs(results[0])

    r = {
        "data": json.dumps(results, indent=2),
        "colstr": json.dumps(col_defs),
        "columns": col_defs,
    }
    return r


schema = make_executable_schema(type_defs, query, snake_case_fallback_resolvers)
app = CORSMiddleware(
    GraphQL(schema, debug=True),
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
