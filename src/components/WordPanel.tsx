"use client";

import { useState, useEffect, useCallback } from "react";
import type { VerbConjugation } from "@/types";
import { speakWord, speakSentence } from "@/lib/speech";
import { ConjugationPanel } from "./ConjugationPanel";

function AudioBtn({ text, isSentence }: { text: string; isSentence?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => isSentence ? speakSentence(text) : speakWord(text)}
      className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#1a2a6c]/10 text-[#1a2a6c] dark:bg-white/10 dark:text-white hover:bg-[#1a2a6c]/20 transition-colors flex-shrink-0"
      title={`Listen: ${text.slice(0, 30)}...`}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    </button>
  );
}

interface WordDefinition {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  spanish: string;
  example: string;
  emoji: string;
  conjugation: VerbConjugation | null;
}

export function WordPanel({
  selectedWord,
  onClose,
  onConjugation,
}: {
  selectedWord: string | null;
  onClose: () => void;
  onConjugation: (data: VerbConjugation | null) => void;
}) {
  const [definition, setDefinition] = useState<WordDefinition | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedWord) return;

    setLoading(true);
    setDefinition(null);

    fetch("/api/define", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: selectedWord }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setDefinition(data);
        onConjugation(data.conjugation || null);
      })
      .catch(() => {
        setDefinition(null);
        onConjugation(null);
      })
      .finally(() => setLoading(false));
  }, [selectedWord, onConjugation]);

  if (!selectedWord) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-zinc-300 dark:text-zinc-600 p-6 gap-3">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
        <p className="text-sm font-medium">Word Dictionary</p>
        <p className="text-xs">Click any word in the chat to see its definition</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Definition</h3>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-400">Looking up &ldquo;{selectedWord}&rdquo;...</p>
          </div>
        )}

        {!loading && definition && (
          <div className="space-y-4">
            {/* Emoji visual */}
            <div className="w-full h-28 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
              <span className="text-6xl">{definition.emoji || "📖"}</span>
            </div>

            {/* Word + Pronunciation */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {definition.word}
                </h2>
                <button
                  type="button"
                  onClick={() => speakWord(definition.word)}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
                  aria-label="Pronounce word"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => speakWord(definition.word)}
                  className="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer transition-colors"
                >
                  {definition.phonetic} 🔊
                </button>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  definition.partOfSpeech === "verb"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                }`}>
                  {definition.partOfSpeech}
                </span>
              </div>
            </div>

            {/* Definition */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Definition
                </p>
                <AudioBtn text={definition.definition} isSentence />
              </div>
              <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                {definition.definition}
              </p>
            </div>

            {/* Spanish */}
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                En Español
              </p>
              <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">
                {definition.spanish}
              </p>
            </div>

            {/* Example */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Example
                </p>
                <AudioBtn text={definition.example} isSentence />
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 italic leading-relaxed border-l-2 border-blue-400 pl-3">
                &ldquo;{definition.example}&rdquo;
              </p>
            </div>

            {/* Inline conjugation */}
            {definition.conjugation && (
              <div className="mt-2 -mx-4">
                <ConjugationPanel data={definition.conjugation} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
