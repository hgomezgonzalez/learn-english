"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface InputBarProps {
  onSend: (text: string) => void;
  onMicClick: () => void;
  disabled: boolean;
  isListening: boolean;
}

export function InputBar({ onSend, onMicClick, disabled, isListening }: InputBarProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = 150; // ~6 lines
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
  }, []);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  useEffect(() => {
    autoResize();
  }, [text, autoResize]);

  function handleSubmit() {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4">
      <button
        type="button"
        onClick={onMicClick}
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          isListening
            ? "bg-red-500 text-white animate-pulse"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
        }`}
        aria-label={isListening ? "Stop listening" : "Start voice input"}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message in English... (Shift+Enter for new line)"
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 overflow-y-auto"
        style={{ maxHeight: "150px" }}
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled || !text.trim()}
        className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1a2a6c] text-white flex items-center justify-center hover:bg-[#2d3a8c] disabled:opacity-40 disabled:hover:bg-[#1a2a6c] transition-colors"
        aria-label="Send message"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}
