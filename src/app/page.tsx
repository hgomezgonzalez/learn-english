"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { useVoice } from "@/hooks/useVoice";
import { Avatar } from "@/components/Avatar";
import { ChatWindow } from "@/components/ChatWindow";
import { InputBar } from "@/components/InputBar";
import { ConjugationPanel } from "@/components/ConjugationPanel";
import { WordPanel } from "@/components/WordPanel";
import { SuggestedPhrases } from "@/components/SuggestedPhrases";
import { WordSearch } from "@/components/WordSearch";
import { ScoreBoard } from "@/components/ScoreBoard";
import { VocabQuiz } from "@/components/VocabQuiz";
import { ListeningQuiz } from "@/components/ListeningQuiz";
import type { VerbConjugation } from "@/types";
import { initVoices } from "@/lib/speech";
import { useProgress } from "@/hooks/useProgress";

const BUILD_VERSION = process.env.BUILD_VERSION || "dev";

export default function Home() {
  const { messages, isStreaming, avatarState, error, sendMessage } = useChat();
  const progress = useProgress();
  const lastAssistantRef = useRef<string>("");
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordConjugation, setWordConjugation] = useState<VerbConjugation | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [listeningQuizOpen, setListeningQuizOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [wordModalOpen, setWordModalOpen] = useState(false);

  useEffect(() => {
    initVoices();
  }, []);

  const handleTranscript = useCallback(
    (text: string) => sendMessage(text),
    [sendMessage]
  );

  const { isListening, isSpeaking, speak, toggleListening } = useVoice({
    onTranscript: handleTranscript,
  });

  useEffect(() => {
    if (isStreaming) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === "assistant" && lastMsg.content && lastMsg.content !== lastAssistantRef.current) {
      lastAssistantRef.current = lastMsg.content;
      speak(lastMsg.content);
      progress.addXp(5, "message");
    }
  }, [isStreaming, messages, speak, progress]);

  const effectiveAvatarState = isSpeaking ? "speaking" : avatarState;

  const handleConjugation = useCallback((data: VerbConjugation | null) => {
    setWordConjugation(data);
  }, []);

  const handleWordClick = useCallback((word: string) => {
    setSelectedWord(word);
    setWordModalOpen(true);
    setMenuOpen(false);
    progress.addXp(2, "word");
  }, [progress]);

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-[#1a2a6c]">
      {/* ===== LEFT SIDEBAR (desktop only) ===== */}
      <aside className="hidden lg:flex flex-col items-center w-72 bg-gradient-to-b from-[#1a2a6c] to-[#2d3a8c] p-5 pt-4 gap-5 overflow-y-auto">
        <div className="flex items-center gap-2 w-full mb-1">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-wide">ROHU</p>
            <p className="text-[10px] text-[#00b894] font-semibold -mt-0.5">Learn English</p>
          </div>
        </div>

        <Avatar state={effectiveAvatarState} />

        <div className="w-full flex gap-2">
          <button type="button" onClick={() => setQuizOpen(true)}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#00b894] to-[#00a383] text-white font-bold text-xs hover:shadow-lg transition-all flex items-center justify-center gap-1">
            🎯 Quiz
          </button>
          <button type="button" onClick={() => setListeningQuizOpen(true)}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white font-bold text-xs hover:shadow-lg transition-all flex items-center justify-center gap-1">
            🎧 Listening
          </button>
        </div>

        <div className="w-full"><WordSearch onSearch={handleWordClick} /></div>

        <ScoreBoard totalXp={progress.totalXp} todayXp={progress.todayXp} streak={progress.streak}
          level={progress.level} nextLevel={progress.nextLevel} levelProgress={progress.levelProgress}
          todayMessages={progress.todayMessages} todayQuizzes={progress.todayQuizzes} todayWords={progress.todayWords} />

        <div className="w-full">
          <SuggestedPhrases messages={messages} onSelect={sendMessage} disabled={isStreaming} />
        </div>

        <button type="button" onClick={logout} className="w-full mt-auto py-2 text-xs text-white/30 hover:text-white/60 transition-colors">
          Cerrar sesión
        </button>
        <p className="text-[9px] text-white/20 text-center">{BUILD_VERSION}</p>
      </aside>

      {/* ===== CENTER — CHAT ===== */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-3 py-2.5 bg-[#1a2a6c] border-b border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#00b894] flex-shrink-0">
              <img src="/avatar-tutor.png" alt="Tutor" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">ROHU</p>
              <p className="text-[10px] text-[#00b894]">Learn English</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {progress.streak > 0 && <span className="text-xs text-white">🔥{progress.streak}</span>}
            <span className="text-[10px] bg-white/10 rounded-full px-2 py-0.5 text-white font-bold">
              {progress.level.emoji} {progress.todayXp}XP
            </span>
            {/* Hamburger button */}
            <button type="button" onClick={() => setMenuOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 overflow-hidden rounded-tl-2xl lg:rounded-tl-none">
          <ChatWindow messages={messages} onWordClick={handleWordClick} />

          {error && (
            <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <ConjugationPanel data={wordConjugation} />

          <InputBar onSend={sendMessage} onMicClick={toggleListening} disabled={isStreaming} isListening={isListening} />
        </div>
      </main>

      {/* ===== RIGHT SIDEBAR — Word Definition (desktop only) ===== */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-zinc-900 border-l border-[#1a2a6c]/10">
        <WordPanel selectedWord={selectedWord}
          onClose={() => { setSelectedWord(null); setWordConjugation(null); }}
          onConjugation={handleConjugation} />
      </aside>

      {/* ===== MOBILE: Hamburger Drawer ===== */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="flex-1 bg-black/50 animate-[fadeIn_0.2s_ease-out]" onClick={() => setMenuOpen(false)} />
          {/* Drawer */}
          <div className="w-[80vw] max-w-xs bg-gradient-to-b from-[#1a2a6c] to-[#2d3a8c] flex flex-col overflow-y-auto animate-[slideLeft_0.25s_ease-out] p-4 gap-3">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#00b894]">
                  <img src="/avatar-tutor.png" alt="Tutor" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Ms. Emma</p>
                  <p className="text-[10px] text-[#00b894]">Online</p>
                </div>
              </div>
              <button type="button" onClick={() => setMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Games */}
            <p className="text-[10px] font-semibold text-[#7ec8b8] uppercase tracking-widest">Games</p>
            <button type="button" onClick={() => { setQuizOpen(true); setMenuOpen(false); }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00b894] to-[#00a383] text-white font-bold text-sm flex items-center gap-3 px-4">
              <span className="text-2xl">🎯</span>
              <div className="text-left"><p className="text-sm">Vocab Quiz</p><p className="text-[10px] text-white/60">Words & conjugation</p></div>
            </button>
            <button type="button" onClick={() => { setListeningQuizOpen(true); setMenuOpen(false); }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white font-bold text-sm flex items-center gap-3 px-4">
              <span className="text-2xl">🎧</span>
              <div className="text-left"><p className="text-sm">Listening Quiz</p><p className="text-[10px] text-white/60">Listen & write</p></div>
            </button>

            {/* Tools */}
            <p className="text-[10px] font-semibold text-[#7ec8b8] uppercase tracking-widest mt-1">Tools</p>
            <WordSearch onSearch={(w) => { handleWordClick(w); setMenuOpen(false); }} />

            {/* Progress */}
            <p className="text-[10px] font-semibold text-[#7ec8b8] uppercase tracking-widest mt-1">Progress</p>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{progress.level.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-white">{progress.level.name}</p>
                    <p className="text-[10px] text-white/40">{progress.totalXp} XP total</p>
                  </div>
                </div>
                {progress.streak > 0 && (
                  <span className="text-sm bg-orange-500/20 rounded-full px-2 py-0.5 text-orange-300">🔥{progress.streak}</span>
                )}
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#00b894] rounded-full transition-all" style={{ width: `${Math.min(progress.levelProgress, 100)}%` }} />
              </div>
              <div className="grid grid-cols-4 gap-1 text-center">
                <div><p className="text-sm font-bold text-white">{progress.todayXp}</p><p className="text-[8px] text-white/40">XP</p></div>
                <div><p className="text-sm font-bold text-white">{progress.todayMessages}</p><p className="text-[8px] text-white/40">Msgs</p></div>
                <div><p className="text-sm font-bold text-white">{progress.todayQuizzes}</p><p className="text-[8px] text-white/40">Quiz</p></div>
                <div><p className="text-sm font-bold text-white">{progress.todayWords}</p><p className="text-[8px] text-white/40">Words</p></div>
              </div>
            </div>

            {/* Suggestions */}
            <p className="text-[10px] font-semibold text-[#7ec8b8] uppercase tracking-widest mt-1">Try saying...</p>
            <SuggestedPhrases messages={messages} onSelect={(phrase) => { sendMessage(phrase); setMenuOpen(false); }} disabled={isStreaming} />

            {/* Footer */}
            <div className="mt-auto pt-3 border-t border-white/10 space-y-1">
              <button type="button" onClick={logout} className="w-full py-2.5 rounded-lg bg-white/5 text-xs text-white/50 hover:text-white/80 transition-colors">
                Cerrar sesión
              </button>
              <p className="text-[8px] text-white/20 text-center">{BUILD_VERSION}</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== MOBILE: Word Definition Modal ===== */}
      {wordModalOpen && selectedWord && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/50 animate-[fadeIn_0.15s_ease-out]"
          onClick={() => { setWordModalOpen(false); setSelectedWord(null); setWordConjugation(null); }}>
          <div className="w-full max-h-[85vh] bg-white dark:bg-zinc-900 rounded-t-2xl overflow-hidden animate-[slideUp_0.25s_ease-out]"
            onClick={(e) => e.stopPropagation()}>
            {/* Drag handle */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            </div>
            <div className="h-[80vh]">
              <WordPanel selectedWord={selectedWord}
                onClose={() => { setWordModalOpen(false); setSelectedWord(null); setWordConjugation(null); }}
                onConjugation={handleConjugation} />
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modals */}
      <VocabQuiz isOpen={quizOpen} onClose={() => setQuizOpen(false)} onComplete={(xp) => progress.addXp(xp, "quiz")} />
      <ListeningQuiz isOpen={listeningQuizOpen} onClose={() => setListeningQuizOpen(false)} onComplete={(xp) => progress.addXp(xp, "quiz")} />
    </div>
  );
}
