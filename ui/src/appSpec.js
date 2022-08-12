function node_color(node_type) {
  let color = "lightblue";
  switch (node_type) {
    case "user-aad":
    case "user-okta":
      color = "dimgray";
      break;
    case "ipAddress":
      color = "orange";
      break;
    case "app":
      color = "dodgerblue";
      break;
    default:
      break;
  }
  return color;
}
// for derived states/selector that extract graphs
// Note that the GraphVis library does not tolerate duplicates
// in the ids of the nodes and there are cases where the same 
// sub_id has two different sub_types in the data
/* ASSUMPTION: the data is an array of json recs { 
  time_bkt, 
  sub_type,
  sub_id,
  sub_name,
  pred,
  pred_status,
  obj_type,
  obj_id,
  obj_name,
  first_seen,
  last_seen,
  cnt
}
*/
function extract_graph_remap(data) {
  let graph = { nodes: [], edges: [] };
  if (data.length === 0) {
    return graph;
  }
  let node_mapping = {};
  let node_counter = 0;
  const empty_g = { nodes: new Set(), edges: new Set() };
  const tmp_g = data.reduce((g, x) => {
    const sub_key = x.sub_type + ":" + x.sub_id + ":" + x.sub_name;
    if (!node_mapping.hasOwnProperty(sub_key)) {
      node_mapping[sub_key] = node_counter;
      node_counter = node_counter + 1;
    };
    const obj_key = x.obj_type + ":" + x.obj_id + ":" + x.obj_name;
    if (!node_mapping.hasOwnProperty(obj_key)) {
      node_mapping[obj_key] = node_counter;
      node_counter = node_counter + 1;
    };
    const n1 = {
      id: node_mapping[sub_key],
      label: "", title: x.sub_type + ":" + x.sub_name,
      color: node_color(x.sub_type),
      src_id: x.sub_id,
      //firstseen: x.firstseen,
      //lastseen: x.lastseen
    };
    const n2 = {
      id: node_mapping[obj_key],
      label: "", title: x.obj_type + ":" + x.obj_name,
      color: node_color(x.obj_type),
      src_id: x.obj_id,
      //firstseen: x.firstseen,
      //lastseen: x.lastseen
    };
    const e = { from: node_mapping[sub_key], to: node_mapping[obj_key], title: x.pred + ":" + x.pred_status };
    g.nodes.add(JSON.stringify(n1));
    g.nodes.add(JSON.stringify(n2));
    g.edges.add(JSON.stringify(e));
    return g;
  }, empty_g);
  graph.nodes = Array.from(tmp_g.nodes).map((n_str, idx) => {
    let n = JSON.parse(n_str);
    return n;
  });
  graph.edges = Array.from(tmp_g.edges).map((e_str, idx) => {
    let e = JSON.parse(e_str);
    e["id"] = idx;
    return e;
  });
  return graph;
};

// text:
//  - widths are in grid xs units
//  - justify is passed to grid container justifyContent prop
const app_spec = {
  widgets: [
    {
      type: "text",
      id: "txt_banner",
      width: 12,
      justify: "flex-start",
      value: `
      <div style="height: 10px;"><h2> &nbsp
      <img src="https://github.com/lipyeow-lim/demo-ui/raw/main/ui/public/databricks_logo.jpeg"
            style="height:20px;"/> &nbsp Databricks Solution Accelerator Demo UI 
      </h2></div>`,
    },
    {
      type: "tabcontainer",
      id: "tabcontainer01",
      style: {
        // slate gray
        backgroundColor: "#afcfcf",
        indicatorColor: "DarkSlateGray",
        // orange
        //backgroundColor: "#ffd4cc",
        //indicatorColor: "#ff6347",
        // blue
        //backgroundColor: "LightSkyBlue",
        //indicatorColor: "#098bdc",
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
                  label: "Add edges",
                  id: "b1",
                  trigger: "q1"
                },

              ],
            },
            {
              type: "graphvis",
              id: "gv01",
              dataref: "d1q1",
              label: "<b>Graph</b>",
              style: { width: "1000px", height: "400px" },
              // state for affected widgets must be manually handled in GraphVis.js
              affected_widgets: ["ti1",],
              actions: [{
                event: "onSelect",
                type: "setValue",
                widgets: ["ti1",],
              },],
              options: {
                layout: {
                  improvedLayout: true,
                  hierarchical: false
                },
                edges: {
                  color: "#000000"
                },
                height: "500px"
              },
            },
            {
              type: "table",
              id: "tEdges",
              label: "<b>Edges</b>",
              dataref: "q1",
              affected_widgets: ["ti2_src", "ti3_first", "ti4_last", "ti5_sub", "ti6_pred", "ti7_obj"],
              actions: [
                {
                  event: "clickOnZoomIcon",
                  update_widgets: [
                    { src: "src", widget: "ti2_src" },
                    { src: "first_seen", widget: "ti3_first" },
                    { src: "last_seen", widget: "ti4_last" },
                    { src: "sub_id", widget: "ti5_sub" },
                    { src: "pred", widget: "ti6_pred" },
                    { src: "obj_id", widget: "ti7_obj" }]
                }
              ],
              colspecs: [
                { title: "Data Source", field: "src" },
                { title: "Sub Type", field: "sub_type" },
                { title: "Sub ID", field: "sub_id" },
                { title: "Sub Name", field: "sub_name", },
                { title: "Pred", field: "pred" },
                { title: "Pred Status", field: "pred_status" },
                { title: "Obj Type", field: "obj_type", },
                { title: "Obj ID", field: "obj_id", },
                { title: "Obj Name", field: "obj_name", },
                { title: "Count", field: "cnt", },
                { title: "Firstseen", field: "first_seen", defaultSort: "desc" },
                { title: "Lastseen", field: "last_seen", },
              ],
              options: {
                search: true,
                paging: true,
                filtering: false,
                exportButton: true,
                maxBodyHeight: "70vh",
                padding: "dense",
                // blue
                //headerStyle: { backgroundColor: "#ceebfd" },
                // orange
                //headerStyle: { backgroundColor: "#ffe9e6" },
                // SlateGray
                headerStyle: { backgroundColor: "#dfecec" },
              },
            },
            {
              type: "text",
              id: "detail_banner",
              width: 12,
              justify: "flex-start",
              value: `
      <h2>Get the raw details for selected node:</h2>
      `,
            },
            {
              type: "form",
              id: "f2",
              widgets: [
                {
                  type: "text_input",
                  label: "data source",
                  id: "ti2_src"
                },
                {
                  type: "text_input",
                  label: "firstseen_ts",
                  id: "ti3_first"
                },
                {
                  type: "text_input",
                  label: "lastseen_ts",
                  id: "ti4_last"
                },
                {
                  type: "text_input",
                  label: "sub_id",
                  id: "ti5_sub"
                },
                {
                  type: "text_input",
                  label: "pred",
                  id: "ti6_pred"
                },
                {
                  type: "text_input",
                  label: "obj_id",
                  id: "ti7_obj"
                },
                {
                  type: "button",
                  label: "Get Raw Details",
                  id: "b2",
                  trigger: "q2"
                },
              ],
            },
            {
              type: "table",
              id: "tRawDetails",
              label: "<b>Raw Logs</b>",
              dataref: "q2",
              affected_widgets: ["null", "null", "null", "null", "null", "null"],
              actions: [],
              colspecs: [
                { title: "Ingest Timestamp", field: "ingest_ts" },
                { title: "Event Timestamp", field: "event_ts" },
                { title: "Raw JSON", field: "raw", json: true },
              ],
              options: {
                search: true,
                paging: true,
                filtering: false,
                exportButton: true,
                maxBodyHeight: "70vh",
                padding: "dense",
                // blue
                //headerStyle: { backgroundColor: "#ceebfd" },
                // orange
                //headerStyle: { backgroundColor: "#ffe9e6" },
                // SlateGray
                headerStyle: { backgroundColor: "#dfecec" },
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
              id: "txt_help",
              width: 12,
              justify: "flex-start",
              value: `
      <i>Contact Lipyeow for help</i>
      <h2>Tips</h2>
      <p><i>Use browser refresh to reset the graph.</i></p>
      
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
      cumulative: true,
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
    s1.src,
    s1.time_bkt,
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
    s3.src,
    s3.time_bkt,
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
      derivation: extract_graph_remap
    },
    {
      type: "query",
      id: "q2",
      backend: "native",
      endpoint: "demo-field-eng",
      cumulative: false,
      query: `
      SELECT b.ingest_ts, b.event_ts, b.raw
      FROM lipyeow_ctx.aad_bronze AS b 
      WHERE b.event_ts BETWEEN '{{firstseen_ts}}' AND '{{lastseen_ts}}' 
      AND b.raw:id IN (
        SELECT s.src_rid
        FROM lipyeow_ctx.{{data_source}}_edges_silver AS s 
          JOIN lipyeow_ctx.{{data_source}}_edges_gold AS g 
          ON s.sub_id=g.sub_id 
            AND s.obj_id = g.obj_id 
            AND s.pred = g.pred
            AND date_trunc('DAY', s.event_ts) = g.time_bkt
        WHERE g.sub_id = '{{sub_id}}' 
          AND g.obj_id='{{obj_id}}'
          AND g.pred = '{{pred}}'
          AND s.event_ts BETWEEN '{{firstseen_ts}}' AND '{{lastseen_ts}}' 
      )
      LIMIT 100
`,
      args: [
        { from: "ti2_src", sub: "data_source" },
        { from: "ti3_first", sub: "firstseen_ts" },
        { from: "ti4_last", sub: "lastseen_ts" },
        { from: "ti5_sub", sub: "sub_id" },
        { from: "ti6_pred", sub: "pred" },
        { from: "ti7_obj", sub: "obj_id" }
      ],
    },
  ],
};

export { app_spec };
