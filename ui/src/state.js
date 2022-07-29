import { app_spec } from "./appSpec";
import { atom, selector } from "recoil";

function accumulateStateEntry(state, wspec) {
  switch (wspec.type) {
    case "table":
      state[wspec.id] = {
        dataref: wspec.dataref,
        cols: [],
        colspecs: wspec.colspecs,
        options: wspec.options,
      };
      break;
    case "query":
      state[wspec.id] = {
        data: [],
        cols: [],
        backend: wspec.backend,
        endpoint: wspec.endpoint,
        query: wspec.query,
        fetch_on_init: wspec.fetch_on_init ? true : false,
        args: wspec.args,
      };
      if (wspec.backend === "constant") {
        state[wspec.id].data = wspec.query.data;
        state[wspec.id].cols = wspec.query.cols;
      }
      break;
    case "text_input":
    case "menu":
      state[wspec.id] = { value: "" };
      break;
    case "button":
      state[wspec.id] = { value: "", trigger: wspec.trigger };
      break;
    case "image":
    case "text":
      state[wspec.id] = { value: wspec.value };
      break;
    case "form":
      genStateStruct(state, wspec.widgets);
      break;
    case "tabcontainer":
      state[wspec.id] = { value: 0 };
      wspec.tabs.map((tab) => genStateStruct(state, tab.widgets));
      break;
    case "graphvis":
      state[wspec.id] = {
        dataref: wspec.dataref,
        graph: { nodes: [], edges: [] }
      };
      break;
    default:
      break;
  }
  return state;
}

function genStateStruct(cur_state, widgets) {
  const stateStruct = widgets.reduce(accumulateStateEntry, cur_state);
  return stateStruct;
}
// for derived states/selector that extract graphs
function extract_graph(data) {
  let graph = { nodes: [], edges: [] };
  if (data.length === 0) {
    return graph;
  }
  let node_mapping = {};
  let node_counter = 0;
  const empty_g = { nodes: new Set(), edges: new Set() };
  const tmp_g = data.reduce((g, x) => {
    if(! node_mapping.hasOwnProperty(x.sub_id)){
      node_mapping[x.sub_id] = node_counter;
      node_counter = node_counter + 1;
    };
    if(! node_mapping.hasOwnProperty(x.obj_id)){
      node_mapping[x.obj_id] = node_counter;
      node_counter = node_counter + 1;
    };
    const n1 = { id: node_mapping[x.sub_id], label: "", title: x.sub_type + ":" + x.sub_name, src_id: x.sub_id };
    const n2 = { id: node_mapping[x.obj_id], label: "", title: x.obj_type + ":" + x.obj_name, src_id: x.obj_id };
    const e = { from: node_mapping[x.sub_id], to: node_mapping[x.obj_id], title: x.pred + ":" + x.pred_status };
    g.nodes.add(JSON.stringify(n1));
    g.nodes.add(JSON.stringify(n2));
    g.edges.add(JSON.stringify(e));
    return g;
  }, empty_g);
  graph.nodes = Array.from(tmp_g.nodes).map((n_str) => {
    return JSON.parse(n_str);
  });
  graph.edges = Array.from(tmp_g.edges).map((e_str, idx) => {
    let e = JSON.parse(e_str);
    e["id"] = idx;
    return e
  });
  return graph;
};

function genAppState(widgets) {
  const stateStruct = genStateStruct({}, widgets);
  let appState = {};
  //console.log("stateStruct:");
  //console.log(stateStruct);
  Object.entries(stateStruct).map((keyval) => {
    let obj = atom({
      key: keyval[0], // unique ID (with respect to other atoms/selectors)
      default: keyval[1], // default value (aka initial value)
    });
    appState[keyval[0]] = obj;
    return obj;
  });
  // add the derived queries as recoil selectors
  const derived_list = widgets.filter((x) => x.type === "derived");
  for (const derived of derived_list) {
    let obj = selector({
      key: derived.id,
      get: ({ get }) => {
        if (derived.derivation === "extract_graph") {
          const src_state = get(appState[derived.from]);
          const g = extract_graph(src_state.data);
          return { graph: g };
        } else {
          return { graph: {}};
        }
      }
    }
    );
    appState[derived.id] = obj;
  }
  //console.log("appState:");
  //console.log(appState);
  return appState;
}

const appState = genAppState(app_spec.widgets);

export { appState };
