import { Document } from "@langchain/core/documents";
import { Annotation } from "@langchain/langgraph";
import { reduceDocs } from "../shared/state";

export const IndexStateAnnotation = Annotation.Root({
  docs: Annotation<
    Document[],
    Document[] | { [key: string]: any }[] | string[] | string | "delete"
  >({
    default: () => [],
    reducer: reduceDocs,
  }),
});

export type IndexStateType = typeof IndexStateAnnotation.State;
