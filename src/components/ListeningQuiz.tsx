"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";
import { speakWord } from "@/lib/speech";

interface QuizWord {
  word: string;
  emoji: string;
  spanish: string;
  example: string;
}

type Phase = "intro" | "playing" | "feedback" | "summary";

interface ListeningQuizProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (xp: number) => void;
}

export function ListeningQuiz({ isOpen, onClose, onComplete }: ListeningQuizProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [difficulty, setDifficulty] = useState("easy");
  const [words, setWords] = useState<QuizWord[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentWord = words[currentIdx];
  const progress = words.length > 0 ? ((currentIdx + (phase === "feedback" ? 1 : 0)) / words.length) * 100 : 0;

  useEffect(() => {
    if (isOpen) {
      setPhase("intro");
      setScore(0);
      setCorrect(0);
      setCurrentIdx(0);
      setWords([]);
      setAnswer("");
      setRevealed(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (phase === "playing") {
      inputRef.current?.focus();
      // Auto-pronounce the word when question appears
      if (currentWord) {
        setTimeout(() => speakWord(currentWord.word), 500);
      }
    }
  }, [phase, currentIdx, currentWord]);

  const startQuiz = useCallback(async () => {
    setLoading(true);
    setQuizError(null);
    try {
      const res = await fetch("/api/listening-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty, usedWords }),
      });
      const data = await res.json();
      if (data.error) {
        setQuizError(data.error);
      } else if (data.words?.length) {
        setWords(data.words);
        const newWords = data.words.map((w: QuizWord) => w.word);
        setUsedWords((prev) => [...prev, ...newWords]);
        setPhase("playing");
      } else {
        setQuizError("No words generated. Try again.");
      }
    } catch {
      setQuizError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [difficulty]);

  function checkAnswer() {
    if (!answer.trim() || !currentWord) return;
    const userAnswer = answer.trim().toLowerCase();
    const correctAnswer = currentWord.word.toLowerCase();
    const match = userAnswer === correctAnswer;
    setIsCorrect(match);
    setRevealed(true);
    if (match) {
      setScore((s) => s + 10);
      setCorrect((c) => c + 1);
      playCorrectSound();
    } else {
      setScore((s) => s - 5);
      playWrongSound();
    }
    setPhase("feedback");
  }

  function nextQuestion() {
    setAnswer("");
    setRevealed(false);
    if (currentIdx + 1 >= words.length) {
      setPhase("summary");
      onComplete?.(Math.max(score, 0) + 20);
    } else {
      setCurrentIdx((i) => i + 1);
      setPhase("playing");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      if (phase === "playing") checkAnswer();
      else if (phase === "feedback") nextQuestion();
    }
  }

  function repeatWord() {
    if (currentWord) speakWord(currentWord.word);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white dark:bg-zinc-900 sm:rounded-2xl rounded-t-2xl shadow-2xl w-full sm:max-w-lg sm:mx-4 max-h-[95vh] overflow-y-auto animate-[slideUp_0.3s_ease-out]">
        {/* Progress bar */}
        {phase !== "intro" && phase !== "summary" && (
          <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800">
            <div className="h-full bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-[#6c5ce7] dark:text-[#a29bfe]">
            {phase === "summary" ? "Quiz Complete!" : "🎧 Listening Quiz"}
          </h2>
          <div className="flex items-center gap-3">
            {phase !== "intro" && (
              <span className="text-sm font-bold text-[#00b894]">{score} pts</span>
            )}
            <button onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* INTRO */}
        {phase === "intro" && (
          <div className="p-5 sm:p-8 text-center space-y-6">
            <div className="text-4xl sm:text-6xl">🎧</div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Listen & Write</h3>
              <p className="text-sm text-zinc-500 mt-2">Listen to the word and type what you hear!</p>
              <p className="text-xs text-[#6c5ce7] mt-1">+10 pts correct, -5 pts wrong. You can replay 🔊</p>
            </div>
            <div className="flex justify-center gap-2">
              {["easy", "medium", "hard"].map((d) => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    difficulty === d
                      ? "bg-[#6c5ce7] text-white shadow-lg"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                  }`}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
            {quizError && (
              <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-xs text-center">
                {quizError}
              </div>
            )}
            <button onClick={startQuiz} disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </span>
              ) : "Start Listening Quiz"}
            </button>
          </div>
        )}

        {/* PLAYING */}
        {phase === "playing" && currentWord && (
          <div className="p-5 sm:p-8 text-center space-y-5">
            <p className="text-xs text-zinc-400 font-medium">
              Word {currentIdx + 1} / {words.length}
            </p>

            {/* Emoji */}
            <div className="text-5xl sm:text-7xl py-2">{currentWord.emoji}</div>

            {/* Big play button */}
            <button type="button" onClick={repeatWord}
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            </button>
            <p className="text-xs text-zinc-400">Tap to hear again</p>

            {/* Input */}
            <input ref={inputRef} value={answer} onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown} placeholder="Type what you hear..."
              className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-center text-lg font-medium outline-none focus:border-[#6c5ce7] transition-colors" />

            <button onClick={checkAnswer} disabled={!answer.trim()}
              className="w-full py-3 rounded-xl bg-[#6c5ce7] text-white font-bold text-sm hover:bg-[#5a4bd1] disabled:opacity-40 transition-colors">
              Check Answer
            </button>
          </div>
        )}

        {/* FEEDBACK */}
        {phase === "feedback" && currentWord && (
          <div className="p-5 sm:p-8 text-center space-y-5">
            <div className={`text-6xl ${isCorrect ? "animate-bounce" : "animate-[shake_0.5s_ease-in-out]"}`}>
              {isCorrect ? "🎉" : "😅"}
            </div>

            <div>
              <p className={`text-xl font-bold ${isCorrect ? "text-[#00b894]" : "text-red-500"}`}>
                {isCorrect ? "Correct!" : "Not quite..."}
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                {isCorrect ? "+10 points!" : "-5 points"}
              </p>
            </div>

            {/* Word revealed */}
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl">{currentWord.emoji}</span>
                <div className="text-left">
                  <p className="text-xl font-bold text-[#1a2a6c] dark:text-white">{currentWord.word}</p>
                  <p className="text-xs text-zinc-400">({currentWord.spanish})</p>
                </div>
                <button type="button" onClick={() => speakWord(currentWord.word)}
                  className="w-10 h-10 rounded-full bg-[#6c5ce7] text-white flex items-center justify-center hover:bg-[#5a4bd1]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-zinc-500 italic">&ldquo;{currentWord.example}&rdquo;</p>
            </div>

            {!isCorrect && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                <p className="text-xs text-zinc-400">You typed:</p>
                <p className="text-sm font-medium text-red-500 line-through">{answer}</p>
              </div>
            )}

            <button onClick={nextQuestion}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white font-bold text-sm hover:shadow-lg transition-all">
              {currentIdx + 1 >= words.length ? "See Results" : "Next Word →"}
            </button>
          </div>
        )}

        {/* SUMMARY */}
        {phase === "summary" && (
          <div className="p-5 sm:p-8 text-center space-y-5">
            <div className="text-5xl">
              {correct / words.length >= 0.9 ? "🏆" : correct / words.length >= 0.7 ? "💪" : correct / words.length >= 0.5 ? "📚" : "💡"}
            </div>

            <div>
              <p className="text-3xl font-bold text-[#6c5ce7]">{score} pts</p>
              <p className="text-sm text-zinc-500 mt-1">
                {correct} / {words.length} correct ({Math.round((correct / words.length) * 100)}%)
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#00b894]">{correct}</p>
                <p className="text-xs text-zinc-400">Correct</p>
              </div>
              <div className="w-px bg-zinc-200 dark:bg-zinc-700" />
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{words.length - correct}</p>
                <p className="text-xs text-zinc-400">Wrong</p>
              </div>
            </div>

            <p className="text-sm text-zinc-500">
              {correct / words.length >= 0.9 ? "Amazing ears! You're a listening pro!" :
               correct / words.length >= 0.7 ? "Great listening skills! Keep it up!" :
               correct / words.length >= 0.5 ? "Good effort! Practice listening more." :
               "Keep practicing! Your ears will get sharper!"}
            </p>

            <div className="flex gap-2">
              <button onClick={() => { setPhase("intro"); setScore(0); setCorrect(0); setCurrentIdx(0); }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white font-bold text-sm">
                Play Again
              </button>
              <button onClick={onClose}
                className="flex-1 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold text-sm">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
