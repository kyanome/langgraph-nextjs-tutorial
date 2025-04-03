import { Annotation } from "@langchain/langgraph";
import {
  BaseConfigurationAnnotation,
  ensureBaseConfiguration,
} from "../shared/configuration";
import { RunnableConfig } from "@langchain/core/runnables";

const DEFAULT_DOCS_FILE = "./src/sample_docs.json";

export const IndexConfigurationAnnotation = Annotation.Root({
  ...BaseConfigurationAnnotation.spec,
  docsFile: Annotation<string>,
  useSampleDocs: Annotation<boolean>,
});

export function ensureIndexConfiguration(
  config: RunnableConfig
): typeof IndexConfigurationAnnotation.State {
  const configurable = (config?.configurable || {}) as Partial<
    typeof IndexConfigurationAnnotation.State
  >;
  const baseConfig = ensureBaseConfiguration(config);

  return {
    ...baseConfig,
    docsFile: configurable.docsFile || DEFAULT_DOCS_FILE,
    useSampleDocs: configurable.useSampleDocs || false,
  };
}
