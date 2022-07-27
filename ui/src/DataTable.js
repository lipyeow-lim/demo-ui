import React from "react";
import { forwardRef } from "react";
import MaterialTable from "material-table";
import AddBox from "@material-ui/icons/AddBox";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";
import { cloneDeep } from "lodash";
import { appState } from "./state.js";
import { useRecoilState, useRecoilValue } from "recoil";

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

// extract a table column spec from array of recs
function extractColumnSpec(data) {
  if (data === null || data.length === 0) return [];
  return Object.keys(data[0]).map((x) => {
    return { title: x, field: x };
  });
}

function DataTable(args) {
  const objState = useRecoilValue(appState[args.id]);
  const [queryState, setQueryState] = useRecoilState(
    appState[objState.dataref]
  );

  /*
  const runUrlFetchQuery = (qid) => {
    //console.log("Run Url Fetch Query: " + qid);
    const url = queryState.query;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        //console.log("runUrlFetchQuery : " + data);
        let copyState = cloneDeep(queryState);
        copyState.data = cloneDeep(data);
        copyState.cols = extractColumnSpec(data);
        setQueryState(copyState);
      });
  };
*/
  // initialize the data that depends on initial fetch query
  React.useEffect(() => {
    if (queryState.backend === "urlfetch" && queryState.fetch_on_init) {
      //console.log("Run Url Fetch Query: " + objState.dataref);
      const url = queryState.query;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          //console.log("runUrlFetchQuery : " + data);
          let copyState = cloneDeep(queryState);
          copyState.data = cloneDeep(data);
          copyState.cols = extractColumnSpec(data);
          setQueryState(copyState);
        });
    }
    // do the fetch
  }, []);

  // material table actually writes to the columns array passed in!
  // colspecs provide in table always overwrites derive specs from query
  let columns = [];
  if (objState.colspecs.length > 0) {
    // convert link type to render
    columns = objState.colspecs.map((cs) => {
      const spec = cloneDeep(cs);
      if (spec.hasOwnProperty("link")) {
        const prefix = spec.link.hasOwnProperty("prefix")
          ? spec.link.prefix
          : "";
        spec.render = (rowData) => (
          <a href={prefix + rowData[spec.field]} download>
            {spec.link.text.length === 0 ? rowData[spec.field] : spec.link.text}
          </a>
        );
      }
      return spec;
    });
  } else {
    columns = cloneDeep(queryState.cols);
  }
  /*
  console.log(objState);
  console.log("DataTable id=" + args.id) 
  console.log("DataTable dataref=" + objState.dataref) 
  console.log("DataTable data=" + queryState.data) 
  console.log("DataTable queryState =" + queryState) 
  */
  return (
    <MaterialTable
      icons={tableIcons}
      title={
        <div
          key={args.id + "-title"}
          dangerouslySetInnerHTML={{ __html: args.label }}
        />
      }
      data={cloneDeep(queryState.data)}
      columns={columns}
      options={objState.options}
    />
  );
}
//    <div style={{ maxWidth: "100%" }}>
//    </div>

export { DataTable };
