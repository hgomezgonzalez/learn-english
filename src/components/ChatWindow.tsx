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
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-0">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center text-zinc-400 dark:text-zinc-500 gap-1.5 px-4">
          <p className="text-base sm:text-lg font-medium">Hello! Ready to practice?</p>
          <p className="text-xs sm:text-sm">Type a message or tap the mic 🎤</p>
          <p className="text-[10px] sm:text-xs mt-1 text-zinc-300 dark:text-zinc-600">Tap any word to see its definition</p>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} onWordClick={onWordClick} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
