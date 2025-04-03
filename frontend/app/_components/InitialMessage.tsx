import React from "react";

const InitialMessage = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <p className="font-medium text-muted-foreground max-w-md mx-auto">
          This ai chatbot is an example template to accompany the book:{" "}
          <a
            href="https://www.oreilly.com/library/view/learning-langchain/9781098167271/"
            className="underline hover:text-foreground"
          >
            Learning LangChain (O'Reilly): Building AI and LLM applications with
            LangChain and LangGraph
          </a>
        </p>
      </div>
    </div>
  );
};

export default InitialMessage;
