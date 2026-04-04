"use client";

import { useState, useEffect } from "react";
import type { Message } from "@/types";

const STARTER_PHRASES = [
  "Hello, how are you today?",
  "Can you help me practice?",
  "What does this word mean?",
  "How do I say... in English?",
  "Can you correct my grammar?",
];

interface SuggestedPhrasesProps {
  messages: Message[];
  onSelect: (phrase: string) => void;
  disabled: boolean;
}

export function SuggestedPhrases({ messages, onSelect, disabled }: SuggestedPhrasesProps) {
  const [phrases, setPhrases] = useState<string[]>(STARTER_PHRASES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (messages.length === 0) {
      setPhrases(STARTER_PHRASES);
      return;
    }

    // Fetch contextual suggestions after each assistant message
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role !== "assistant" || !lastMsg.content) return;

    setLoading(true);

    const recentContext = messages
      .slice(-4)
      .map((m) => `${m.role}: ${m.content.slice(0, 100)}`)
      .join("\n");

    fetch("/api/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context: recentContext }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.phrases?.length) setPhrases(data.phrases);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [messages]);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-[#7ec8b8] uppercase tracking-wide">
        Try saying...
      </p>
      {loading && (
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <div className="w-3 h-3 border border-[#00b894] border-t-transparent rounded-full animate-spin" />
          <span className="text-white/50">Updating...</span>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        {phrases.map((phrase, i) => (
          <button
            key={`${phrase}-${i}`}
            type="button"
            onClick={() => onSelect(phrase)}
            disabled={disabled}
            className="text-left text-xs px-3 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-[#00b894]/20 hover:text-[#00b894] transition-colors disabled:opacity-50 border border-white/10"
          >
            &ldquo;{phrase}&rdquo;
          </button>
        ))}
      </div>
    </div>
  );
}
