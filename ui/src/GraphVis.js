import { appState } from "./state.js";
import { cloneDeep } from "lodash";
import React, { useMemo } from "react";

import { useRecoilState, useRecoilValue } from "recoil";

import Graph from "react-graph-vis";
import { v4 as uuidv4 } from 'uuid';

import 'vis-network/styles/vis-network.css';

function GraphVis(args) {
  const [objState, setObjState] = useRecoilState(appState[args.id]);
  const queryState = useRecoilValue(appState[objState.dataref]);
  // React does not allow calling useRecoilState within a loop,
  // hence, the updateStates must be constructed manually
  let updateStates = {};
  updateStates[args.affected_widgets[0]] = useRecoilState(appState[args.affected_widgets[0]]);
  let events = {};
  for (const action of args.actions) {
    switch (action.event) {
      case "onSelect":
        events["select"] = function ({ nodes, edges }) {
          if (nodes.length === 1) {
            const node_obj = queryState.graph.nodes.filter((x) => x.id === nodes[0])[0];
            const src_id = node_obj.src_id;
            console.log(node_obj);
            action.widgets.map((widget_id) => {
              // check if widget_id in updateStates
              const [widgetState, setWidgetState] = updateStates[widget_id];
              let copyState = cloneDeep(widgetState);
              copyState.value = src_id;
              setWidgetState(copyState);
              return null;
            });
          }
        };
        break;
      default:
        console.log("unsupport action.event : " + action.event);
    }
  }
  //console.log("events:");
  //console.log(events);
  const version = useMemo(uuidv4, [queryState.graph]);
  // TODO: sanity check on queryState.cols
  //console.log(queryState);
  return (
    <Graph
      key={version}
      graph={queryState.graph}
      options={args.options}
      events={events}
      getNetwork={network => {
        //  if you want access to vis.js network api you can set the state in a parent component using this property
      }}
    />
  );
}

export { GraphVis };
