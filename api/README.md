# Graphql Server for Demo UI App

## Quickstart

1. In a terminal/shell, go to this folder in your clone
1. Install any required dependencies using `pip3`. A requirements.txt file is coming. For now look at `demo.py` to figure out the dependencies.
1. Use the `cfg-sample.json` as an example, create a config file for the server. In a simple UI, you probably only need one endpoint.
1. Run `uvicorn demo:app`
1. Point your browser to http://localhost:8000/ for the GraphQL playground
