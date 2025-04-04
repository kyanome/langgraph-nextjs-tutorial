import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { reduceDocs } from "../shared/state";

export const AgentStateAnnotation = Annotation.Root({
  query: Annotation<string>(),
  route: Annotation<string>(),
  ...MessagesAnnotation.spec,
  documents: Annotation<
    Document[],
    Document[] | { [key: string]: any }[] | string[] | string | "delete"
  >({
    default: () => [],
    // @ts-ignore
    reducer: reduceDocs,
  }),
});
