from ariadne import QueryType, gql, make_executable_schema, snake_case_fallback_resolvers
from ariadne.asgi import GraphQL
from databricks import sql
import asyncio
import datetime
import json

def open_connections(cfg):
    conn_list = {}
    for ws in cfg["workspaces"]:
        conn_list[ws["name"]] = sql.connect(**ws["conn"])
    return conn_list

def close_connections(conn_list):
    for (name, conn) in conn_list.items():
        conn.close()

def jsonify(row):
    rec = {}
    for (k,v) in row.asDict().items():
        if type(v)==datetime.datetime:
            rec[k] = v.isoformat()
        else:
            rec[k] = v
    return rec

def flatten(t):
    return [item for sublist in t for item in sublist]

async def query_one(name, conn, sqlstr):
    #print("Querying " + name + "...")
    with conn.cursor() as cur:
        cur.execute(sqlstr)
        res = cur.fetchall()
    return [ json.dumps(jsonify(r), indent=2) for r in res ]

async def concurrent_query_all(conn_list,sqlstr):
    coros = []
    for (name, conn) in conn_list.items():
        coros.append(query_one(name, conn, sqlstr))
    result = await asyncio.gather(*coros)
    return flatten(result)
 
with open("cfg.json", "r") as fp:
    cfg = json.load(fp)

type_defs = gql("""
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
""")

# Create type instance for Query type defined in our schema...
query = QueryType()

@query.field("getData")
async def resolve_getData(_, info, endpoint, query, args):
    results = "getData results"
    #conn_list = open_connections(cfg)
    #results = await concurrent_query_all(conn_list, query)
    #close_connections(conn_list)
    print(f"{endpoint}, {query}, {args}")

    r = { "data": "ok", "colstr": "ditto", "columns": [{"title": "hello", "field": "there" }] }
    return r

schema = make_executable_schema(type_defs, query, snake_case_fallback_resolvers)
app = GraphQL(schema, debug=True)
