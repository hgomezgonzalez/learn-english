"use client";

import { useState } from "react";

interface WordSearchProps {
  onSearch: (word: string) => void;
}

export function WordSearch({ onSearch }: WordSearchProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const word = query.trim().toLowerCase();
    if (!word) return;
    onSearch(word);
    setQuery("");
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <p className="text-xs font-semibold text-[#7ec8b8] uppercase tracking-wide mb-2">
        Search a word
      </p>
      <div className="flex gap-1.5">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. beautiful"
          className="flex-1 min-w-0 px-3 py-2 text-xs rounded-lg border border-[#1a2a6c]/20 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-[#00b894] focus:ring-1 focus:ring-[#00b894]"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="flex-shrink-0 px-3 py-2 rounded-lg bg-[#00b894] text-white text-xs font-medium hover:bg-[#00a383] disabled:opacity-40 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>
    </form>
  );
}
