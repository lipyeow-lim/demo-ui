import { Widget } from "./Widget.js";
import { useStyles } from "./Styles.js";

function QueryForm(args) {
  const classes = useStyles();
  return (
    <form className={classes.root} noValidate autoComplete="off">
      {args.widgets.map((spec) => (
        <Widget key={"QueryForm-" + spec} wspec={spec} widgets={args.widget} />
      ))}
    </form>
  );
}

export { QueryForm };
