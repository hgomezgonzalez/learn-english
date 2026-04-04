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
  const [mobilePanel, setMobilePanel] = useState<"none" | "tools" | "definition">("none");

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
    setMobilePanel("definition");
    progress.addXp(2, "word");
  }, [progress]);

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

        <button
          type="button"
          onClick={() => setQuizOpen(true)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00b894] to-[#00a383] text-white font-bold text-sm hover:shadow-lg hover:shadow-[#00b894]/30 transition-all flex items-center justify-center gap-2"
        >
          <span className="text-lg">🎯</span>
          Vocab Quiz
        </button>

        <div className="w-full">
          <WordSearch onSearch={handleWordClick} />
        </div>

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

        <div className="w-full">
          <SuggestedPhrases
            messages={messages}
            onSelect={sendMessage}
            disabled={isStreaming}
          />
        </div>

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

      {/* ===== CENTER — CHAT ===== */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-3 py-2 bg-[#1a2a6c] border-b border-white/10">
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
          <div className="flex items-center gap-1.5">
            {progress.streak > 0 && (
              <span className="text-xs text-white">🔥{progress.streak}</span>
            )}
            <span className="text-[10px] bg-white/10 rounded-full px-2 py-0.5 text-white font-bold">
              {progress.level.emoji} {progress.todayXp}XP
            </span>
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

          {/* ===== MOBILE TOOLBAR ===== */}
          <div className="lg:hidden flex items-center gap-1.5 px-3 py-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setQuizOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#00b894] text-white text-[11px] font-bold"
            >
              🎯 Quiz
            </button>
            <button
              type="button"
              onClick={() => setMobilePanel(mobilePanel === "tools" ? "none" : "tools")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${
                mobilePanel === "tools"
                  ? "bg-[#1a2a6c] text-white"
                  : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
              }`}
            >
              📊 Progress
            </button>
            <button
              type="button"
              onClick={() => setMobilePanel(mobilePanel === "definition" ? "none" : "definition")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${
                mobilePanel === "definition"
                  ? "bg-[#1a2a6c] text-white"
                  : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
              }`}
            >
              📖 {selectedWord || "Dictionary"}
            </button>
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/auth", { method: "DELETE" });
                window.location.href = "/login";
              }}
              className="ml-auto px-2 py-1.5 rounded-full text-[11px] text-zinc-400"
            >
              Salir
            </button>
          </div>

          {/* ===== MOBILE PANELS (slide up) ===== */}
          {mobilePanel !== "none" && (
            <div className="lg:hidden max-h-[50vh] overflow-y-auto border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 animate-[slideUp_0.2s_ease-out]">
              {mobilePanel === "tools" && (
                <div className="p-4 space-y-4">
                  {/* Search */}
                  <WordSearch onSearch={(w) => { handleWordClick(w); setMobilePanel("definition"); }} />

                  {/* Score */}
                  <div className="rounded-xl bg-[#1a2a6c] p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{progress.level.emoji}</span>
                        <div>
                          <p className="text-xs font-bold">{progress.level.name}</p>
                          <p className="text-[10px] text-white/40">{progress.totalXp} XP total</p>
                        </div>
                      </div>
                      {progress.streak > 0 && (
                        <span className="text-sm bg-orange-500/20 rounded-full px-2 py-0.5">🔥{progress.streak}</span>
                      )}
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00b894] rounded-full" style={{ width: `${Math.min(progress.levelProgress, 100)}%` }} />
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                      <div><p className="text-sm font-bold">{progress.todayXp}</p><p className="text-[9px] text-white/40">XP</p></div>
                      <div><p className="text-sm font-bold">{progress.todayMessages}</p><p className="text-[9px] text-white/40">Msgs</p></div>
                      <div><p className="text-sm font-bold">{progress.todayQuizzes}</p><p className="text-[9px] text-white/40">Quiz</p></div>
                      <div><p className="text-sm font-bold">{progress.todayWords}</p><p className="text-[9px] text-white/40">Words</p></div>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <SuggestedPhrases
                    messages={messages}
                    onSelect={(phrase) => { sendMessage(phrase); setMobilePanel("none"); }}
                    disabled={isStreaming}
                  />
                </div>
              )}

              {mobilePanel === "definition" && (
                <div className="h-[50vh]">
                  <WordPanel
                    selectedWord={selectedWord}
                    onClose={() => {
                      setSelectedWord(null);
                      setWordConjugation(null);
                      setMobilePanel("none");
                    }}
                    onConjugation={handleConjugation}
                  />
                </div>
              )}
            </div>
          )}

          <InputBar
            onSend={sendMessage}
            onMicClick={toggleListening}
            disabled={isStreaming}
            isListening={isListening}
          />
        </div>
      </main>

      {/* ===== RIGHT SIDEBAR — Word Definition (desktop only) ===== */}
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
