"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/types";
import { MessageBubble } from "./MessageBubble";

interface ChatWindowProps {
  messages: Message[];
  onWordClick?: (word: string) => void;
}

export function ChatWindow({ messages, onWordClick }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center text-zinc-400 dark:text-zinc-500 gap-2">
          <p className="text-lg font-medium">Hello! Ready to practice English?</p>
          <p className="text-sm">Type a message or tap the mic to start talking.</p>
          <p className="text-xs mt-2 text-zinc-300 dark:text-zinc-600">Click any word in my responses to see its definition</p>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} onWordClick={onWordClick} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
