import { appState } from "./state.js";
import { cloneDeep } from "lodash";
import TextField from "@material-ui/core/TextField";

import { useRecoilState } from "recoil";

function TextInput(args) {
  console.log(args.id + " - appState:");
  console.log(appState);
  const [objState, setObjState] = useRecoilState(appState[args.id]);

  const id = "TextField-" + args.id;
  return (
    <TextField
      key={id}
      id={id}
      label={args.label}
      onChange={(event) => {
        let copyState = cloneDeep(objState);
        copyState.value = event.target.value;
        setObjState(copyState);
      }}
      variant="outlined"
    />
  );
}

export { TextInput };
