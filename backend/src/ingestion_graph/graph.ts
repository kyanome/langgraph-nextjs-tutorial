import { RunnableConfig } from "@langchain/core/runnables";
import fs from "fs/promises";
import { IndexStateAnnotation, IndexStateType } from "./state";
import {
  ensureIndexConfiguration,
  IndexConfigurationAnnotation,
} from "./configuration";
import { reduceDocs } from "../shared/state";
import { END, START, StateGraph } from "@langchain/langgraph";
import { makeRetriever } from "../shared/retrieval";

async function ingestDocs(state: IndexStateType, config: RunnableConfig) {
  if (!config) {
    throw new Error("Config is required");
  }
  const configuration = ensureIndexConfiguration(config);
  let docs = state.docs;

  if (!docs || docs.length === 0) {
    if (configuration.useSampleDocs) {
      const fileContent = await fs.readFile(configuration.docsFile, "utf-8");
      const serializedDocs = JSON.parse(fileContent);
      docs = reduceDocs([], serializedDocs);
    } else {
      throw new Error("No sample documents to index.");
    }
  } else {
    docs = reduceDocs([], docs);
  }

  const retriever = await makeRetriever(config);
  await retriever.addDocuments(docs);

  return { docs: "delete" };
}

// Define the graph
const builder = new StateGraph(
  IndexStateAnnotation,
  IndexConfigurationAnnotation
)
  .addNode("ingestDocs", ingestDocs)
  .addEdge(START, "ingestDocs")
  .addEdge("ingestDocs", END);

// Compile into a graph object that you can invoke and deploy.
export const graph = builder
  .compile()
  .withConfig({ runName: "IngestionGraph" });
