"use client";

import { useState, useCallback, useEffect } from "react";

interface DailyProgress {
  date: string; // YYYY-MM-DD
  xp: number;
  messages: number;
  quizzes: number;
  wordsLearned: number;
}

interface ProgressData {
  totalXp: number;
  streak: number;
  lastActiveDate: string;
  history: DailyProgress[];
}

const LEVELS = [
  { name: "Beginner", minXp: 0, emoji: "🌱" },
  { name: "Elementary", minXp: 50, emoji: "📗" },
  { name: "Pre-Intermediate", minXp: 150, emoji: "📘" },
  { name: "Intermediate", minXp: 350, emoji: "⭐" },
  { name: "Upper-Intermediate", minXp: 600, emoji: "🔥" },
  { name: "Advanced", minXp: 1000, emoji: "💎" },
  { name: "Master", minXp: 2000, emoji: "👑" },
];

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getLevel(xp: number) {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXp) level = l;
  }
  return level;
}

function getNextLevel(xp: number) {
  for (const l of LEVELS) {
    if (xp < l.minXp) return l;
  }
  return null;
}

function loadProgress(): ProgressData {
  if (typeof window === "undefined") {
    return { totalXp: 0, streak: 0, lastActiveDate: "", history: [] };
  }
  try {
    const raw = localStorage.getItem("rohu-progress");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { totalXp: 0, streak: 0, lastActiveDate: "", history: [] };
}

function saveProgress(data: ProgressData) {
  try {
    localStorage.setItem("rohu-progress", JSON.stringify(data));
  } catch {}
}

function calculateStreak(data: ProgressData, today: string): number {
  const lastDate = data.lastActiveDate;
  if (!lastDate) return 1;

  const last = new Date(lastDate);
  const now = new Date(today);
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return data.streak; // same day
  if (diffDays === 1) return data.streak + 1; // consecutive
  return 1; // streak broken
}

const EMPTY: ProgressData = { totalXp: 0, streak: 0, lastActiveDate: "", history: [] };

export function useProgress() {
  const [progress, setProgress] = useState<ProgressData>(EMPTY);

  // Load from localStorage only on client
  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const addXp = useCallback((amount: number, type: "message" | "quiz" | "word") => {
    setProgress((prev) => {
      const today = getToday();
      const streak = calculateStreak(prev, today);

      let todayProgress = prev.history.find((h) => h.date === today);
      const restHistory = prev.history.filter((h) => h.date !== today);

      if (!todayProgress) {
        todayProgress = { date: today, xp: 0, messages: 0, quizzes: 0, wordsLearned: 0 };
      }

      todayProgress.xp += amount;
      if (type === "message") todayProgress.messages += 1;
      if (type === "quiz") todayProgress.quizzes += 1;
      if (type === "word") todayProgress.wordsLearned += 1;

      const newData: ProgressData = {
        totalXp: prev.totalXp + amount,
        streak,
        lastActiveDate: today,
        history: [...restHistory, todayProgress].slice(-30), // keep 30 days
      };

      saveProgress(newData);
      return newData;
    });
  }, []);

  const today = getToday();
  const todayProgress = progress.history.find((h) => h.date === today);
  const todayXp = todayProgress?.xp || 0;
  const level = getLevel(progress.totalXp);
  const nextLevel = getNextLevel(progress.totalXp);
  const levelProgress = nextLevel
    ? ((progress.totalXp - level.minXp) / (nextLevel.minXp - level.minXp)) * 100
    : 100;

  return {
    totalXp: progress.totalXp,
    todayXp,
    streak: progress.streak || (progress.lastActiveDate === today ? 1 : 0),
    level,
    nextLevel,
    levelProgress,
    todayMessages: todayProgress?.messages || 0,
    todayQuizzes: todayProgress?.quizzes || 0,
    todayWords: todayProgress?.wordsLearned || 0,
    addXp,
  };
}
