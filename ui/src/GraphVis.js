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
  const [textInputState, setTextInputState] = useRecoilState(appState["ti1"]);

  const version = useMemo(uuidv4, [queryState.graph]);
  // TODO: sanity check on queryState.cols
  const graph = {
    nodes: [
      { id: "1", label: "Node 1", title: "node 1 tootip text" },
      { id: 2, label: "Node 2", title: "node 2 tootip text" },
      { id: 3, label: "Node 3", title: "node 3 tootip text" },
      { id: 4, label: "Node 4", title: "node 4 tootip text" },
      { id: 5, label: "Node 5", title: "node 5 tootip text" }
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 2, to: 5 }
    ]
  };
  //console.log(queryState);
  const events = {
    select: function ({ nodes, edges }) {
      console.log("Selected nodes:");
      console.log(JSON.stringify(nodes));
      console.log("Selected edges:");
      console.log(JSON.stringify(edges));
      if(nodes.length===1){
        const node_obj = queryState.graph.nodes.filter((x)=>x.id===nodes[0])[0];
        const src_id = node_obj.src_id;
        console.log(node_obj);
        let copyState = cloneDeep(textInputState);
        copyState.value = src_id;
        setTextInputState(copyState);
      }
    }
  };
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
