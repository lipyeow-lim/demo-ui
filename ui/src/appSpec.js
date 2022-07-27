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
              id  : "f1",
              widgets: [
                {
                type: "text_input",
                label: "Enter node id or name",
                id: "ti1"
                },
                {
                type: "menu",
                label: "QType",
                id: "m1",
                values: [{id: 1, value:"A", display: "A"}, 
                        {id: 2, value:"AAAA", display: "AAAA"}]
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
                { title: "Sub Type", field: "sub_type", defaultSort: "desc" },
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
                headerStyle: { backgroundColor: "#FDEBD0"},
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
      id  : "q1",
      backend: "native",
      endpoint: "r0",
      query: "select * from dns where (?='' or query like ?) AND (?='' or qtype_name = ?) limit 40;",
      args: [{from: "ti1"}, {from: "ti1"}, {from: "m1"}, {from: "m1"}]
    },
    {
      type: "query",
      id: "qPub",
      backend: "urlfetch",
      endpoint: "r0",
      query: "https://lipyeow.github.io/info/data/pubs.json",
      fetch_on_init: true,
      args: [],
    },
  ],
};

export { app_spec };
