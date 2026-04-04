"use client";

import { useState } from "react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuiz: () => void;
  onListening: () => void;
  onSearch: (word: string) => void;
  onLogout: () => void;
  level: { name: string; emoji: string };
  todayXp: number;
  streak: number;
  version: string;
}

export function WelcomeModal({
  isOpen, onClose, onQuiz, onListening, onSearch, onLogout,
  level, todayXp, streak, version,
}: WelcomeModalProps) {
  const [searchWord, setSearchWord] = useState("");

  if (!isOpen) return null;

  function handleSearch() {
    if (!searchWord.trim()) return;
    onSearch(searchWord.trim().toLowerCase());
    setSearchWord("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-[fadeIn_0.15s_ease-out] p-3"
      onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto animate-[slideUp_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gradient-to-br from-[#1a2a6c] via-[#2d3a8c] to-[#1a2a6c] px-5 pt-6 pb-5 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#00b894] rounded-full opacity-10 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#6c5ce7] rounded-full opacity-10 translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex items-center justify-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#00b894] shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/avatar-tutor.png" alt="Ms. Emma" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-white">ROHU</h1>
              <p className="text-[#00b894] font-semibold text-xs">Learn English</p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="text-xs bg-white/10 rounded-full px-2.5 py-1 text-white font-bold">
              {level.emoji} {level.name}
            </span>
            <span className="text-xs bg-white/10 rounded-full px-2.5 py-1 text-white font-bold">
              {todayXp} XP
            </span>
            {streak > 0 && (
              <span className="text-xs bg-orange-500/20 rounded-full px-2.5 py-1 text-orange-300 font-bold">
                🔥 {streak}
              </span>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="p-4 space-y-3">
          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={onClose}
              className="flex flex-col items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-3.5 hover:bg-[#00b894]/10 transition-colors active:scale-95">
              <span className="text-2xl">💬</span>
              <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Chat</span>
            </button>
            <button type="button" onClick={onQuiz}
              className="flex flex-col items-center gap-1.5 bg-gradient-to-br from-[#00b894]/10 to-[#00b894]/5 dark:from-[#00b894]/20 dark:to-transparent rounded-xl px-3 py-3.5 hover:from-[#00b894]/20 transition-colors active:scale-95 ring-1 ring-[#00b894]/20">
              <span className="text-2xl">🎯</span>
              <span className="text-[11px] font-bold text-[#00b894]">Vocab Quiz</span>
            </button>
            <button type="button" onClick={onListening}
              className="flex flex-col items-center gap-1.5 bg-gradient-to-br from-[#6c5ce7]/10 to-[#6c5ce7]/5 dark:from-[#6c5ce7]/20 dark:to-transparent rounded-xl px-3 py-3.5 hover:from-[#6c5ce7]/20 transition-colors active:scale-95 ring-1 ring-[#6c5ce7]/20">
              <span className="text-2xl">🎧</span>
              <span className="text-[11px] font-bold text-[#6c5ce7]">Listening</span>
            </button>
            <button type="button" onClick={onClose}
              className="flex flex-col items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-3.5 hover:bg-blue-50 transition-colors active:scale-95">
              <span className="text-2xl">📝</span>
              <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Conjugation</span>
            </button>
          </div>

          {/* Search word */}
          <div className="flex gap-2">
            <input type="text" value={searchWord} onChange={(e) => setSearchWord(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="🔍 Search any word..."
              className="flex-1 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm outline-none focus:border-[#00b894] focus:ring-1 focus:ring-[#00b894]" />
            <button type="button" onClick={handleSearch} disabled={!searchWord.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#1a2a6c] text-white text-sm font-bold disabled:opacity-40">
              📖
            </button>
          </div>

          {/* Start chatting */}
          <button type="button" onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1a2a6c] to-[#00b894] text-white font-bold text-sm hover:shadow-lg transition-all active:scale-[0.98]">
            Start Chatting with Ms. Emma!
          </button>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <button type="button" onClick={onLogout} className="text-[10px] text-zinc-400 hover:text-zinc-600">
              Cerrar sesión
            </button>
            <span className="text-[9px] text-zinc-300">{version}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
