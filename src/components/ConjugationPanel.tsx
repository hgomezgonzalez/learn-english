"use client";

import { useState } from "react";
import type { VerbConjugation } from "@/types";
import { speakWord } from "@/lib/speech";

const PRONOUNS = ["I", "you", "he/she/it", "we", "they"];

const TENSE_COLORS = [
  "from-[#1a2a6c] to-[#2d3a8c]",
  "from-[#00b894] to-[#00a383]",
  "from-[#6c5ce7] to-[#5a4bd1]",
  "from-[#e17055] to-[#d45d43]",
  "from-[#0984e3] to-[#0770c2]",
];

export function ConjugationPanel({ data }: { data: VerbConjugation | null }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!data) return null;

  return (
    <div className="border-t-2 border-[#00b894]/30 bg-gradient-to-r from-[#f8f9ff] to-[#f0f4ff] dark:from-zinc-800 dark:to-zinc-850">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#1a2a6c] flex items-center justify-center text-white text-sm font-bold">
            V
          </span>
          <div className="text-left">
            <span className="text-sm font-bold text-[#1a2a6c] dark:text-white">
              to {data.verb}
            </span>
            <span className="text-xs text-zinc-400 ml-2">conjugation</span>
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 flex gap-3 overflow-x-auto">
          {data.tenses.map((t, idx) => (
            <div
              key={t.tense}
              className={`flex-shrink-0 w-44 rounded-xl bg-gradient-to-br ${TENSE_COLORS[idx % TENSE_COLORS.length]} p-3 text-white shadow-md`}
            >
              <p className="text-xs font-bold uppercase tracking-wide opacity-80 mb-2">
                {t.tense}
              </p>
              <div className="space-y-1.5">
                {PRONOUNS.map((pronoun) => {
                  const conjugated = t.conjugations[pronoun] ?? "—";
                  const phrase = `${pronoun} ${conjugated}`;
                  return (
                    <div key={pronoun} className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-medium opacity-60 w-12 flex-shrink-0">
                        {pronoun}
                      </span>
                      <span className="text-xs font-semibold bg-white/15 rounded-md px-2 py-0.5 text-right flex-1">
                        {conjugated}
                      </span>
                      <button
                        type="button"
                        onClick={() => speakWord(phrase)}
                        className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 transition-colors"
                        title={`Listen: ${phrase}`}
                      >
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
