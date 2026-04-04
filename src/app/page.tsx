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
import type { VerbConjugation } from "@/types";
import { initVoices } from "@/lib/speech";
import { useProgress } from "@/hooks/useProgress";

export default function Home() {
  const { messages, isStreaming, avatarState, error, sendMessage } = useChat();
  const progress = useProgress();
  const lastAssistantRef = useRef<string>("");
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordConjugation, setWordConjugation] = useState<VerbConjugation | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);

  // Pre-load speech voices on mount
  useEffect(() => {
    initVoices();
  }, []);

  const handleTranscript = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  const { isListening, isSpeaking, speak, toggleListening } = useVoice({
    onTranscript: handleTranscript,
  });

  // Auto-speak assistant messages when streaming ends + track XP
  useEffect(() => {
    if (isStreaming) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === "assistant" && lastMsg.content && lastMsg.content !== lastAssistantRef.current) {
      lastAssistantRef.current = lastMsg.content;
      speak(lastMsg.content);
      progress.addXp(5, "message"); // +5 XP per conversation exchange
    }
  }, [isStreaming, messages, speak, progress]);

  const effectiveAvatarState = isSpeaking ? "speaking" : avatarState;

  const handleConjugation = useCallback((data: VerbConjugation | null) => {
    setWordConjugation(data);
  }, []);

  const handleWordClick = useCallback((word: string) => {
    setSelectedWord(word);
    progress.addXp(2, "word"); // +2 XP per word looked up
  }, [progress]);

  return (
    <div className="flex h-screen bg-[#1a2a6c]">
      {/* Left panel - Avatar + Search + Score + Suggestions */}
      <aside className="hidden lg:flex flex-col items-center w-72 bg-gradient-to-b from-[#1a2a6c] to-[#2d3a8c] p-5 pt-4 gap-5 overflow-y-auto">
        {/* ROHU Branding */}
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

        {/* Vocab Quiz button */}
        <button
          type="button"
          onClick={() => setQuizOpen(true)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00b894] to-[#00a383] text-white font-bold text-sm hover:shadow-lg hover:shadow-[#00b894]/30 transition-all flex items-center justify-center gap-2"
        >
          <span className="text-lg">🎯</span>
          Vocab Quiz
        </button>

        {/* Word Search */}
        <div className="w-full">
          <WordSearch onSearch={setSelectedWord} />
        </div>

        {/* Score */}
        <ScoreBoard
          totalXp={progress.totalXp}
          todayXp={progress.todayXp}
          streak={progress.streak}
          level={progress.level}
          nextLevel={progress.nextLevel}
          levelProgress={progress.levelProgress}
          todayMessages={progress.todayMessages}
          todayQuizzes={progress.todayQuizzes}
          todayWords={progress.todayWords}
        />

        {/* Suggested Phrases */}
        <div className="w-full">
          <SuggestedPhrases
            messages={messages}
            onSelect={sendMessage}
            disabled={isStreaming}
          />
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={async () => {
            await fetch("/api/auth", { method: "DELETE" });
            window.location.href = "/login";
          }}
          className="w-full mt-auto py-2 text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          Cerrar sesión
        </button>
      </aside>

      {/* Center - Chat */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#1a2a6c] border-b border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#00b894] flex-shrink-0">
              <img src="/avatar-tutor.png" alt="Tutor" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Ms. Emma</h1>
              <p className="text-xs text-[#00b894]">AI English Tutor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {progress.streak > 0 && (
              <span className="text-sm">🔥{progress.streak}</span>
            )}
            <div className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1">
              <span className="text-xs">{progress.level.emoji}</span>
              <span className="text-xs font-bold text-white">{progress.todayXp} XP</span>
            </div>
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 overflow-hidden rounded-tl-2xl lg:rounded-tl-none">
          <ChatWindow messages={messages} onWordClick={handleWordClick} />

          {/* Error banner */}
          {error && (
            <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Conjugation panel */}
          <ConjugationPanel data={wordConjugation} />

          {/* Input */}
          <InputBar
            onSend={sendMessage}
            onMicClick={toggleListening}
            disabled={isStreaming}
            isListening={isListening}
          />
        </div>
      </main>

      {/* Right panel - Word Definition */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-zinc-900 border-l border-[#1a2a6c]/10">
        <WordPanel
          selectedWord={selectedWord}
          onClose={() => {
            setSelectedWord(null);
            setWordConjugation(null);
          }}
          onConjugation={handleConjugation}
        />
      </aside>

      {/* Quiz Modal */}
      <VocabQuiz isOpen={quizOpen} onClose={() => setQuizOpen(false)} onComplete={(xp) => progress.addXp(xp, "quiz")} />
    </div>
  );
}
