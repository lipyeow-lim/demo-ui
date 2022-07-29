// text:
//  - widths are in grid xs units
//  - justify is passed to grid container justifyContent prop
const app_spec = {
  widgets: [
    {
      type: "tabcontainer",
      id: "tabcontainer01",
      style: {
        backgroundColor: "#FCF3CF",
        indicatorColor: "#DC7633",
      },
      tabs: [
        {
          label: " Context Graph Analytics",
          id: "tc01-0",
          idx: 0,
          widgets: [
            {
              type: "form",
              id: "f1",
              widgets: [
                {
                  type: "text_input",
                  label: "Enter node id or name",
                  id: "ti1"
                },
                {
                  type: "menu",
                  label: "Timeframe",
                  id: "m1",
                  values: [
                    { id: 1, value: "2022-07-20T00:00:00.000+0000", display: "2022-07-20" },
                    { id: 2, value: "2022-07-21T00:00:00.000+0000", display: "2022-07-21" },
                  ]
                },
                {
                  type: "button",
                  label: "Get edges",
                  id: "b1",
                  trigger: "q1"
                },
              ],
            },
            {
              type: "table",
              id: "tEdges",
              label: "<b>Edges</b>",
              dataref: "q1",
              colspecs: [
                { title: "Time Bkt", field: "time_bkt", defaultSort: "desc" },
                { title: "Sub Type", field: "sub_type" },
                { title: "Sub ID", field: "sub_id" },
                { title: "Sub Name", field: "sub_name", },
                { title: "Pred", field: "pred" },
                { title: "Pred Status", field: "pred_status" },
                { title: "Obj Type", field: "obj_type", },
                { title: "Obj ID", field: "obj_id", },
                { title: "Obj Name", field: "obj_name", },
                { title: "Count", field: "cnt", },
                { title: "Firstseen", field: "first_seen", },
                { title: "Lastseen", field: "last_seen", },
              ],
              options: {
                search: true,
                paging: true,
                filtering: false,
                exportButton: true,
                maxBodyHeight: "70vh",
                padding: "dense",
                headerStyle: { backgroundColor: "#FDEBD0" },
              },
            },
            {
              type: "graphvis",
              id: "gv01",
              dataref: "d1q1",
              label: "<b>Graph</b>",
              options: {
                layout: {
                  hierarchical: false
                },
                edges: {
                  color: "#000000"
                },
                height: "500px"
              },
            },
          ],
        },
        {
          label: "Help",
          id: "tc01-1",
          idx: 1,
          widgets: [
            {
              type: "text",
              id: "txt_educator",
              width: 12,
              justify: "flex-start",
              value: `
      <i>Contact Lipyeow for help</i>

      <h2>Background</h2>
      `,
            },
          ],
        },
      ],
    },
    {
      type: "query",
      id: "q1",
      backend: "native",
      endpoint: "demo-field-eng",
      query: `
WITH sub_matches AS (
  select
    *
  from
    lipyeow_ctx.v_edges
  where
    time_bkt = '{{day_ts}}'
    and ( sub_id = '{{node_filter}}'
    or sub_name = '{{node_filter}}')
), 
sub_same_as AS (
  SELECT
    NULL as time_bkt,
    s1.sub_type,
    s1.sub_id,
    s1.sub_name,
    s1.pred,
    s1.pred_status,
    s1.obj_type,
    s1.obj_id,
    s1.obj_name,
    NULL as first_seen,
    NULL as last_seen,
    NULL as cnt
  FROM
    sub_matches AS e1
    JOIN lipyeow_ctx.same_as AS s1 ON e1.sub_id = s1.sub_id 
),
obj_matches AS (
  select
    *
  from
    lipyeow_ctx.v_edges
  where
    time_bkt = '{{day_ts}}'
    and (obj_id = '{{node_filter}}'
    or obj_name = '{{node_filter}}')
),
obj_same_as AS (
  SELECT
    NULL as time_bkt,
    s3.sub_type,
    s3.sub_id,
    s3.sub_name,
    s3.pred,
    s3.pred_status,
    s3.obj_type,
    s3.obj_id,
    s3.obj_name,
    NULL as first_seen,
    NULL as last_seen,
    NULL as cnt
  FROM
    obj_matches AS e3
    JOIN lipyeow_ctx.same_as AS s3 ON e3.obj_id = s3.sub_id
)
SELECT
  *
FROM
  sub_matches
UNION
SELECT
  e2.*
FROM
  sub_same_as AS s2
  JOIN lipyeow_ctx.v_edges AS e2 ON s2.obj_id = e2.sub_id
            and e2.time_bkt = '{{day_ts}}'
UNION
SELECT
  *
FROM
  obj_matches
UNION
SELECT
  e4.*
FROM
  obj_same_as AS s4
  JOIN lipyeow_ctx.v_edges AS e4 ON s4.obj_id = e4.obj_id
            and e4.time_bkt = '{{day_ts}}'
UNION
SELECT
  *
FROM
  sub_same_as
UNION
SELECT
  *
FROM
  obj_same_as
LIMIT 100
`,
      args: [{ from: "ti1", sub: "node_filter" }, { from: "m1", sub: "day_ts" }],
    },
    {
      type: "derived",
      id: "d1q1",
      from: "q1",
      derivation: "extract_graph"
    }
  ],
};

export { app_spec };
