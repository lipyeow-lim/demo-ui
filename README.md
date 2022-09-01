# demo-ui

Demo-UI is a simple config-driven UI builder for building simple websites and/or UIs for demo purposes.

It was inspired by low-code UI building tools and was initially developed as an exercise for learning Javascript+React+Recoil. I re-purposed the code to build my static personal website (see [Lipyeow's website](https://lipyeow.github.io/info/)) relying on github for deployment and hosting (no API server is required).

In this version, I re-purpose the code to build UIs on top of a Databricks backend. The UIs will support fairly standard interactions like filling out a form with text input widgets or dropdown menus and clicking a button to run a query to populate a data table.

Demo-UI consists of two components:

1. A graphQL API server that receives queries from the React app frontend, sends those queries to Databricks for processing, and relays the results from Databricks back to the frontend.
2. A React app frontend that uses [Recoil](https://recoiljs.org/) for state management. The react app is completely controlled by a json application specification in the `appSpec.js` file.

## Supported Widgets

1. Tab Container (material-ui) 
1. Data Table (material-table)
1. Query Form (material-ui)
1. Text Input (material-ui)
1. Dropdown Menu (material-ui)
1. Button (material-ui)
1. Text (material-ui)
1. GraphVis ([react-graph-vis](https://www.npmjs.com/package/react-graph-vis))

## Quickstart

1. Clone this repo to your laptop
1. Open a terminal, go to the `api` folder and Follow the instructions in the readme to start the GraphQL server on your laptop
1. Open another terminal, go to the `ui` folder and Follow the instructions in the readme to start the react app server on your laptop

