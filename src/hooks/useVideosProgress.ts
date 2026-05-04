"use client";

import { useCallback, useEffect, useState } from "react";

interface VideosState {
  watched: string[];
  favorites: string[];
}

const KEY = "rohu-videos";
const EMPTY: VideosState = { watched: [], favorites: [] };

function load(): VideosState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return {
      watched: Array.isArray(parsed.watched) ? parsed.watched : [],
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
    };
  } catch {
    return EMPTY;
  }
}

function save(state: VideosState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

export function useVideosProgress() {
  const [state, setState] = useState<VideosState>(EMPTY);

  useEffect(() => {
    setState(load());
  }, []);

  const isWatched = useCallback(
    (id: string) => state.watched.includes(id),
    [state.watched]
  );

  const isFavorite = useCallback(
    (id: string) => state.favorites.includes(id),
    [state.favorites]
  );

  const markWatched = useCallback((id: string): boolean => {
    let firstTime = false;
    setState((prev) => {
      if (prev.watched.includes(id)) return prev;
      firstTime = true;
      const next: VideosState = {
        ...prev,
        watched: [...prev.watched, id],
      };
      save(next);
      return next;
    });
    return firstTime;
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setState((prev) => {
      const has = prev.favorites.includes(id);
      const next: VideosState = {
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
    watched: state.watched,
    favorites: state.favorites,
    watchedCount: state.watched.length,
    favoritesCount: state.favorites.length,
    isWatched,
    isFavorite,
    markWatched,
    toggleFavorite,
  };
}
