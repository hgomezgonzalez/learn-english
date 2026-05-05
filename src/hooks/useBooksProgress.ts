"use client";

import { useCallback, useEffect, useState } from "react";

interface BooksState {
  read: string[];
  favorites: string[];
}

const KEY = "rohu-books";
const EMPTY: BooksState = { read: [], favorites: [] };

function load(): BooksState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return {
      read: Array.isArray(parsed.read) ? parsed.read : [],
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
    };
  } catch {
    return EMPTY;
  }
}

function save(state: BooksState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

export function useBooksProgress() {
  const [state, setState] = useState<BooksState>(EMPTY);

  useEffect(() => {
    setState(load());
  }, []);

  const isRead = useCallback(
    (id: string) => state.read.includes(id),
    [state.read]
  );

  const isFavorite = useCallback(
    (id: string) => state.favorites.includes(id),
    [state.favorites]
  );

  const markRead = useCallback((id: string): boolean => {
    let firstTime = false;
    setState((prev) => {
      if (prev.read.includes(id)) return prev;
      firstTime = true;
      const next: BooksState = { ...prev, read: [...prev.read, id] };
      save(next);
      return next;
    });
    return firstTime;
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setState((prev) => {
      const has = prev.favorites.includes(id);
      const next: BooksState = {
        ...prev,
        favorites: has
          ? prev.favorites.filter((x) => x !== id)
          : [...prev.favorites, id],
      };
      save(next);
      return next;
    });
  }, []);

  return {
    read: state.read,
    favorites: state.favorites,
    readCount: state.read.length,
    favoritesCount: state.favorites.length,
    isRead,
    isFavorite,
    markRead,
    toggleFavorite,
  };
}
