"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";
import { speakWord, speakSentence } from "@/lib/speech";

function SpeakButton({ text, label, isSentence }: { text: string; label?: string; isSentence?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => isSentence ? speakSentence(text) : speakWord(text)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a2a6c]/10 text-[#1a2a6c] dark:bg-white/10 dark:text-white hover:bg-[#1a2a6c]/20 transition-colors text-xs font-medium"
      title={`Listen: ${text}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
      {label || "Listen"}
    </button>
  );
}

interface QuizQuestion {
  type: "vocab" | "conjugation";
  emoji?: string;
  hint: string;
  answer: string;
  spanish?: string;
  verb?: string;
  tense?: string;
  pronoun?: string;
}

type Phase = "intro" | "playing" | "feedback" | "summary";

interface VocabQuizProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (xp: number) => void;
}

export function VocabQuiz({ isOpen, onClose, onComplete }: VocabQuizProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [difficulty, setDifficulty] = useState("easy");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<unknown>(null);

  const currentQ = questions[currentIdx];
  const progress = questions.length > 0 ? ((currentIdx + (phase === "feedback" ? 1 : 0)) / questions.length) * 100 : 0;

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setPhase("intro");
      setScore(0);
      setCorrect(0);
      setCurrentIdx(0);
      setQuestions([]);
      setAnswer("");
    }
  }, [isOpen]);

  // Focus input
  useEffect(() => {
    if (phase === "playing") inputRef.current?.focus();
  }, [phase, currentIdx]);

  const startQuiz = useCallback(async () => {
    setLoading(true);
    setQuizError(null);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty }),
      });
      const data = await res.json();
      if (data.error) {
        setQuizError(data.error);
      } else if (data.questions?.length) {
        setQuestions(data.questions);
        setPhase("playing");
      } else {
        setQuizError("No questions generated. Try again.");
      }
    } catch {
      setQuizError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [difficulty]);

  function checkAnswer() {
    if (!answer.trim() || !currentQ) return;
    const userAnswer = answer.trim().toLowerCase();
    const correctAnswer = currentQ.answer.toLowerCase();
    const match = userAnswer === correctAnswer;
    setIsCorrect(match);
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
    if (currentIdx + 1 >= questions.length) {
      setPhase("summary");
      onComplete?.(Math.max(score, 0) + 20); // bonus 20 XP for completing quiz
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

  // Speech recognition for pronunciation
  function startListening() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new SpeechRecognition() as any;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setAnswer(transcript);
      setIsListening(false);
      // Auto-check after speech
      setTimeout(() => {
        const userAnswer = transcript.trim().toLowerCase();
        const correctAnswer = currentQ?.answer.toLowerCase() || "";
        const match = userAnswer === correctAnswer;
        setIsCorrect(match);
        if (match) {
          setScore((s) => s + 15); // bonus for pronunciation
          setCorrect((c) => c + 1);
          playCorrectSound();
        } else {
          setScore((s) => s - 5);
          playWrongSound();
        }
        setPhase("feedback");
      }, 300);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-[slideUp_0.3s_ease-out]">
        {/* Progress bar */}
        {phase !== "intro" && phase !== "summary" && (
          <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-[#1a2a6c] to-[#00b894] transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-[#1a2a6c] dark:text-white">
            {phase === "summary" ? "Quiz Complete!" : "Vocab Quiz"}
          </h2>
          <div className="flex items-center gap-3">
            {phase !== "intro" && (
              <span className="text-sm font-bold text-[#00b894]">{score} pts</span>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* INTRO */}
        {phase === "intro" && (
          <div className="p-8 text-center space-y-6">
            <div className="text-6xl">🎯</div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Ready to test your vocabulary?</h3>
              <p className="text-sm text-zinc-500 mt-2">10 questions — type or speak your answer!</p>
              <p className="text-xs text-[#00b894] mt-1">+10 pts written, +15 pts spoken, -5 pts wrong</p>
            </div>
            <div className="flex justify-center gap-2">
              {["easy", "medium", "hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    difficulty === d
                      ? "bg-[#1a2a6c] text-white shadow-lg"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                  }`}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
            {quizError && (
              <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-xs text-center">
                {quizError}
              </div>
            )}
            <button
              onClick={startQuiz}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1a2a6c] to-[#00b894] text-white font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating quiz...
                </span>
              ) : (
                "Start Quiz"
              )}
            </button>
          </div>
        )}

        {/* PLAYING */}
        {phase === "playing" && currentQ && (
          <div className="p-8 text-center space-y-5">
            <p className="text-xs text-zinc-400 font-medium">
              Question {currentIdx + 1} / {questions.length}
              {currentQ.type === "conjugation" && " • Conjugation"}
            </p>

            {currentQ.type === "vocab" ? (
              <>
                <div className="text-7xl py-2">{currentQ.emoji || "❓"}</div>
                <p className="text-base text-zinc-700 dark:text-zinc-300 font-medium">{currentQ.hint}</p>
                <div className="flex justify-center">
                  <SpeakButton text={currentQ.hint} label="Listen to hint" isSentence />
                </div>
                {currentQ.spanish && (
                  <p className="text-xs text-zinc-400">Pista: {currentQ.spanish}</p>
                )}
              </>
            ) : (
              <>
                <div className="py-2">
                  <span className="inline-block px-4 py-2 rounded-xl bg-[#1a2a6c] text-white text-lg font-bold">
                    {currentQ.verb}
                  </span>
                  <div className="flex justify-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-[#00b894]/20 text-[#00b894] font-medium">
                      {currentQ.tense}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 font-medium">
                      {currentQ.pronoun}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{currentQ.hint}</p>
                <div className="flex justify-center">
                  <SpeakButton text={currentQ.hint} label="Listen to hint" isSentence />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer..."
                className="flex-1 px-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-center text-lg font-medium outline-none focus:border-[#00b894] transition-colors"
              />
              <button
                onClick={startListening}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-[#1a2a6c] text-white hover:bg-[#2d3a8c]"
                }`}
                title="Speak your answer (+15 pts)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
              </button>
            </div>

            <button
              onClick={checkAnswer}
              disabled={!answer.trim()}
              className="w-full py-3 rounded-xl bg-[#00b894] text-white font-bold text-sm hover:bg-[#00a383] disabled:opacity-40 transition-colors"
            >
              Check Answer
            </button>
          </div>
        )}

        {/* FEEDBACK */}
        {phase === "feedback" && currentQ && (
          <div className="p-8 text-center space-y-5">
            <div className={`text-6xl ${isCorrect ? "animate-bounce" : "animate-[shake_0.5s_ease-in-out]"}`}>
              {isCorrect ? "🎉" : "😅"}
            </div>
            <div>
              <p className={`text-xl font-bold ${isCorrect ? "text-[#00b894]" : "text-red-500"}`}>
                {isCorrect ? "Correct!" : "Not quite..."}
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                {isCorrect
                  ? `+${answer !== currentQ.answer ? "15" : "10"} points!`
                  : `-5 points`}
              </p>
            </div>

            {/* Listen to correct answer */}
            <div className="flex justify-center">
              <SpeakButton text={currentQ.answer} label={`Listen: "${currentQ.answer}"`} />
            </div>

            {!isCorrect && (
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
                <p className="text-xs text-zinc-400 mb-1">Correct answer:</p>
                <p className="text-lg font-bold text-[#1a2a6c] dark:text-white">{currentQ.answer}</p>
                {currentQ.spanish && (
                  <p className="text-xs text-zinc-400 mt-1">({currentQ.spanish})</p>
                )}
              </div>
            )}

            <button
              onClick={nextQuestion}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1a2a6c] to-[#00b894] text-white font-bold text-sm hover:shadow-lg transition-all"
            >
              {currentIdx + 1 >= questions.length ? "See Results" : "Next Question →"}
            </button>
          </div>
        )}

        {/* SUMMARY */}
        {phase === "summary" && (
          <div className="p-8 text-center space-y-5">
            {correct / questions.length >= 0.7 && (
              <div className="text-5xl animate-bounce">🏆</div>
            )}
            <div className={`text-6xl ${correct / questions.length >= 0.7 ? "" : "mt-2"}`}>
              {correct / questions.length >= 0.9
                ? "🌟"
                : correct / questions.length >= 0.7
                  ? "💪"
                  : correct / questions.length >= 0.5
                    ? "📚"
                    : "💡"}
            </div>

            <div>
              <p className="text-3xl font-bold text-[#1a2a6c] dark:text-white">{score} pts</p>
              <p className="text-sm text-zinc-500 mt-1">
                {correct} / {questions.length} correct ({Math.round((correct / questions.length) * 100)}%)
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#00b894]">{correct}</p>
                <p className="text-xs text-zinc-400">Correct</p>
              </div>
              <div className="w-px bg-zinc-200 dark:bg-zinc-700" />
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{questions.length - correct}</p>
                <p className="text-xs text-zinc-400">Wrong</p>
              </div>
            </div>

            <p className="text-sm text-zinc-500">
              {correct / questions.length >= 0.9
                ? "Outstanding! You're mastering English!"
                : correct / questions.length >= 0.7
                  ? "Great job! Keep practicing!"
                  : correct / questions.length >= 0.5
                    ? "Good effort! Review the words you missed."
                    : "Keep studying! Practice makes perfect!"}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPhase("intro");
                  setScore(0);
                  setCorrect(0);
                  setCurrentIdx(0);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#1a2a6c] to-[#00b894] text-white font-bold text-sm"
              >
                Play Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
