"use client";

import type { Message } from "@/types";
import { speakSentence } from "@/lib/speech";

interface MessageBubbleProps {
  message: Message;
  onWordClick?: (word: string) => void;
}

function ClickableText({ text, onWordClick }: { text: string; onWordClick?: (word: string) => void }) {
  if (!onWordClick) return <>{text}</>;

  const words = text.split(/(\s+)/);
  return (
    <>
      {words.map((word, i) => {
        const cleanWord = word.replace(/[^a-zA-Z']/g, "");
        if (!cleanWord || /^\s+$/.test(word)) {
          return <span key={i}>{word}</span>;
        }
        return (
          <span
            key={i}
            className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 rounded px-0.5 transition-colors"
            onClick={() => onWordClick(cleanWord.toLowerCase())}
          >
            {word}
          </span>
        );
      })}
    </>
  );
}

export function MessageBubble({ message, onWordClick }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="flex flex-col gap-1 max-w-[85%]">
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-blue-600 text-white rounded-br-sm"
              : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-bl-sm"
          }`}
        >
          {isUser ? (
            message.content
          ) : (
            <ClickableText text={message.content} onWordClick={onWordClick} />
          )}
          {!message.content && !isUser && (
            <span className="inline-block w-2 h-4 bg-zinc-400 animate-pulse rounded-sm" />
          )}
        </div>
        {/* Replay audio button */}
        {message.content && (
          <button
            type="button"
            onClick={() => speakSentence(message.content)}
            className={`self-${isUser ? "end" : "start"} flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] transition-colors ${
              isUser
                ? "text-blue-300 hover:text-blue-100"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            Replay
          </button>
        )}
      </div>
    </div>
  );
}
