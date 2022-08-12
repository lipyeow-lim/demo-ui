import Grid from "@material-ui/core/Grid";
//import Paper from "@material-ui/core/Paper";
import { TabContainer } from "./TabContainer.js";
import { DataTable } from "./DataTable.js";
import { QueryForm } from "./QueryForm.js";
import { TextInput } from "./TextInput.js";
import { Menu } from "./Menu.js";
import { MyButton } from "./MyButton.js";
import { GraphVis } from "./GraphVis.js";
//import { useStyles } from "./Styles.js";

// Grid will use 12 units has maxwidth
function Widget(args) {
  //const classes = useStyles();
  switch (args.wspec.type) {
    case "tabcontainer":
      return (
        <Grid item xs={12}>
          <TabContainer
            key={args.wspec.id}
            id={args.wspec.id}
            style={args.wspec.style}
            tabs={args.wspec.tabs}
          />
        </Grid>
      );
    case "table":
      return (
        <Grid item xs={12}>
          <DataTable
            key={args.wspec.id}
            id={args.wspec.id}
            label={args.wspec.label}
            affected_widgets={args.wspec.affected_widgets}
            actions={args.wspec.actions}
          />
        </Grid>
      );
    case "form":
      return (
        <Grid item xs={12}>
          <QueryForm key={args.wspec.id} widgets={args.wspec.widgets} />
        </Grid>
      );
    case "text_input":
      return (
        <TextInput
          key={args.wspec.id}
          id={args.wspec.id}
          label={args.wspec.label}
        />
      );
    case "menu":
      return (
        <Menu
          id={args.wspec.id}
          label={args.wspec.label}
          values={args.wspec.values}
        />
      );
    case "button":
      return (
        <MyButton
          key={args.wspec.id}
          id={args.wspec.id}
          label={args.wspec.label}
        />
      );
    case "image":
      return (
        <Grid item xs="12"
          sm={args.wspec.width}
        >
          <center>
            <img
              alt="portrait"
              border="1"
              height={args.wspec.imageheight}
              style={{
                margintop: "4em",
                marginleft: "2em",
              }}
              src={args.wspec.value}
            />
          </center>
        </Grid>
      );
    case "text":
      return (
        <Grid
          item
          xs="12"
          sm={args.wspec.hasOwnProperty("width") ? args.wspec.width : 12}
        >
          <div
            key={args.wspec.id}
            align="left"
            maxWidth="100%"
            style={{
              marginTop: "10px",
              marginLeft: "10px",
            }}
            dangerouslySetInnerHTML={{ __html: args.wspec.value }}
          />
        </Grid>
      );
    case "graphvis":
      return (
        <Grid item xs="12">
          <div style={args.wspec.style}>
            <GraphVis
              key={args.wspec.id}
              id={args.wspec.id}
              label={args.wspec.label}
              actions={args.wspec.actions}
              options={args.wspec.options}
              affected_widgets={args.wspec.affected_widgets}
            />
          </div>
        </Grid>
      );
    default:
      return null;
  }
}

export { Widget };
