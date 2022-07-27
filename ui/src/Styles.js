import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
      width: "25ch",
    },
    flexgrow: 1,
    backgroundColor: theme.palette.background.paper,
    //backgroundColor: "#FCF3CF",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  customOne: {
    padding: "3rem 15rem",
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    fontFamily: "Open Sans",
  },
  tabs: {
    padding: "0rem",
    color: "#404040",
    //backgroundColor: "#bbbbbb",
    //backgroundColor: "#D4E6F1",
    //backgroundColor: "#A9CCE3",
    //backgroundColor: "#A9DFBF",
    backgroundColor: "#FCF3CF",
    fontFamily: "Open Sans",
    fontSize: "1rem",
  },
}));

export { useStyles };
