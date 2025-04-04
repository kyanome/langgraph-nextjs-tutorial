"use client";
import { useEffect, useRef, useState } from "react";
import { MessageForm } from "./_components/MessageForm";
import { PDFDocument, RetrieveDocumentsNodeUpdates } from "./_types/graphTypes";
import { ChatMessage } from "./_components/ChatMessage";
import InitialMessage from "./_components/InitialMessage";
import { client } from "./_lib/langgraph-client";

export default function Home() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    Array<{
      role: "user" | "assistant";
      content: string;
      sources?: PDFDocument[];
    }>
  >([]);
  const abortControllerRef = useRef<AbortController | null>(null); // Track the AbortController
  const lastRetrievedDocsRef = useRef<PDFDocument[]>([]);

  useEffect(() => {
    const initThread = async () => {
      if (threadId) return;

      try {
        const thread = await client.createThread();

        setThreadId(thread.thread_id);
      } catch (error) {
        console.error("Error creating thread:", error);
      }
    };
    initThread();
  }, []);

  const handleSubmit = async (message: string, files: File[]) => {
    /* if (!threadId || isLoading) return; */

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setMessages((prev) => [
      ...prev,
      { role: "user", content: message, sources: undefined }, // Clear sources for new user message
      { role: "assistant", content: "", sources: undefined }, // Clear sources for new assistant message
    ]);
    setIsLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    lastRetrievedDocsRef.current = []; // Clear the last retrieved documents */

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          threadId,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunkStr = decoder.decode(value);
        const lines = chunkStr.split("\n").filter(Boolean);

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const sseString = line.slice("data: ".length);
          let sseEvent: any;

          try {
            sseEvent = JSON.parse(sseString);
          } catch (error) {
            console.error("Error parsing SSE event:", error);
            continue;
          }

          const { event, data } = sseEvent;

          if (event === "messages/partial") {
            if (Array.isArray(data)) {
              const lastObj = data[data.length - 1];
              if (lastObj?.type === "ai") {
                const partialContent = lastObj.content ?? "";
                if (
                  typeof partialContent === "string" &&
                  !partialContent.startsWith("{")
                ) {
                  setMessages((prev) => {
                    const newArr = [...prev];
                    if (
                      newArr.length > 0 &&
                      newArr[newArr.length - 1].role === "assistant"
                    ) {
                      newArr[newArr.length - 1].content = partialContent;
                      newArr[newArr.length - 1].sources =
                        lastRetrievedDocsRef.current;
                    }

                    return newArr;
                  });
                }
              }
            }
          } else if (event === "updates" && data) {
            if (
              data &&
              typeof data === "object" &&
              "retrieveDocuments" in data &&
              data.retrieveDocuments &&
              Array.isArray(data.retrieveDocuments.documents)
            ) {
              const retrievedDocs = (data as RetrieveDocumentsNodeUpdates)
                .retrieveDocuments.documents as PDFDocument[];

              // Handle documents here
              lastRetrievedDocsRef.current = retrievedDocs;
              console.log("Retrieved documents:", retrievedDocs);
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message === "AbortError") {
        console.log("Fetch aborted");
      } else {
        console.error("Error fetching:", error);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-4 md:p-24 max-w-5xl mx-auto w-full gap-4">
      {messages.length === 0 ? (
        <InitialMessage />
      ) : (
        <div className="w-full space-y-4 mb-20">
          {messages.map((message, i) => (
            <ChatMessage key={i} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
      <MessageForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
