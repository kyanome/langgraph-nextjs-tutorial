"use client";
import { useRef, useState } from "react";
import { ExamplePrompts } from "./_components/ExamplePrompts";
import { MessageForm } from "./_components/MessageForm";
import { PDFDocument } from "./_types/graphTypes";
import { ChatMessage } from "./_components/ChatMessage";
import InitialMessage from "./_components/InitialMessage";

export default function Home() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{
      role: "user" | "assistant";
      content: string;
      sources?: PDFDocument[];
    }>
  >([{ role: "assistant", content: "Hello, how are you?" }]);

  const handleSubmit = (message: string, files: File[]) => {
    console.log(message, files);
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

      <ExamplePrompts onPromptSelect={setInput} />
      <MessageForm onSubmit={handleSubmit} />
    </div>
  );
}
