import "./App.css";

import React from "react";
import { Widget } from "./Widget.js";
import Grid from "@material-ui/core/Grid";

function App(args) {
  return (
    <div className={{ flexGrow: 1 }} style={{ maxWidth: "100%" }}>
      <Grid
        container
        spacing={5}
        direction="row"
        alignContent="flex-start"
        alignItems="center"
        justifyContent="flex-start"
      >
        {args.spec.widgets.map((spec) => (
          <Widget key={"widget_" + spec.id} wspec={spec} />
        ))}
      </Grid>
    </div>
  );
}

export { App };
