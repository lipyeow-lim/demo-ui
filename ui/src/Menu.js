import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
//import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { appState } from "./state.js";
import { cloneDeep } from "lodash";
import { useStyles } from "./Styles.js";

import { useRecoilState } from "recoil";

function Menu(args) {
  const classes = useStyles();
  const [objState, setObjState] = useRecoilState(appState[args.id]);

  return (
    <FormControl
      key={args.id + "FormContorl-"}
      variant="filled"
      className={classes.formControl}
    >
      <InputLabel id={args.id + "simple-select-filled-label"}>
        {args.label}
      </InputLabel>
      <Select
        labelId="demo-simple-select-filled-label"
        id={args.id + "qtypedropdown"}
        value={objState.value}
        onChange={(event) => {
          let copyState = cloneDeep(objState);
          copyState.value = event.target.value;
          setObjState(copyState);
        }}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {args.values.map((v) => {
          return (
            <MenuItem key={v.id} value={v.value}>
              {v.display}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

export { Menu };
