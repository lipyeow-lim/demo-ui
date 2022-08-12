import { app_spec } from "./appSpec";
import { atom, selector } from "recoil";
import { colors } from "@material-ui/core";
import { get } from "lodash";

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
        cumulative: wspec.cumulative,
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
        const src_state = get(appState[derived.from]);
        const g = derived.derivation(src_state.data);
        return { graph: g };
      }
    }
    );
    appState[derived.id] = obj;
  };
  // Add a special null widget state
  appState["null"] = atom({
    key: "null",
    default: { desc: "this is a null state used as work around for no-op" }
  });
  //console.log("appState:");
  //console.log(appState);
  return appState;
}

const appState = genAppState(app_spec.widgets);

export { appState };
