"use client";

import { useMemo, useState } from "react";
import type { CEFRLevel, VideoItem, VideoTopic } from "@/types/videos";
import {
  LEVEL_COLORS,
  LEVEL_ORDER,
  TOPIC_LABELS,
  TOPIC_ORDER,
  VIDEOS,
} from "@/data/videos";
import { useVideosProgress } from "@/hooks/useVideosProgress";
import { VideoCard } from "./VideoCard";
import { VideoPlayer } from "./VideoPlayer";

interface VideosLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onAskTutor: (prompt: string) => void;
  onVideoWatched: () => void;
}

export function VideosLibrary({
  isOpen,
  onClose,
  onAskTutor,
  onVideoWatched,
}: VideosLibraryProps) {
  const [selectedLevels, setSelectedLevels] = useState<Set<CEFRLevel>>(new Set());
  const [selectedTopics, setSelectedTopics] = useState<Set<VideoTopic>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyUnwatched, setShowOnlyUnwatched] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [viewing, setViewing] = useState<VideoItem | null>(null);

  const progress = useVideosProgress();

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return VIDEOS.filter((v) => {
      if (selectedLevels.size > 0 && !v.levels.some((l) => selectedLevels.has(l)))
        return false;
      if (selectedTopics.size > 0 && !v.topics.some((t) => selectedTopics.has(t)))
        return false;
      if (showOnlyUnwatched && progress.isWatched(v.id)) return false;
      if (showOnlyFavorites && !progress.isFavorite(v.id)) return false;
      if (q) {
        const hay = `${v.title} ${v.channel} ${v.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    selectedLevels,
    selectedTopics,
    searchQuery,
    showOnlyUnwatched,
    showOnlyFavorites,
    progress,
  ]);

  function toggleLevel(lvl: CEFRLevel) {
    setSelectedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(lvl)) next.delete(lvl);
      else next.add(lvl);
      return next;
    });
  }

  function toggleTopic(topic: VideoTopic) {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  }

  function clearFilters() {
    setSelectedLevels(new Set());
    setSelectedTopics(new Set());
    setSearchQuery("");
    setShowOnlyUnwatched(false);
    setShowOnlyFavorites(false);
  }

  function handleMarkWatched(video: VideoItem) {
    const firstTime = progress.markWatched(video.id);
    if (firstTime) onVideoWatched();
  }

  if (!isOpen) return null;

  const hasFilters =
    selectedLevels.size > 0 ||
    selectedTopics.size > 0 ||
    searchQuery.trim() !== "" ||
    showOnlyUnwatched ||
    showOnlyFavorites;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-zinc-50 dark:bg-zinc-900 w-full max-w-6xl flex flex-col max-h-[100dvh] sm:max-h-[96vh] sm:my-4 sm:rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-[#e74c3c] to-[#ff7675] text-white">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl">📺</span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold truncate">
                Videos en inglés
              </h2>
              <p className="text-[11px] text-white/80">
                {progress.watchedCount} de {VIDEOS.length} vistos
                {progress.favoritesCount > 0 && ` · ${progress.favoritesCount} favoritos`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Filters bar */}
        <div className="px-4 sm:px-5 py-3 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 space-y-2.5">
          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Buscar por título, canal o tema..."
            className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm outline-none focus:border-[#e74c3c] focus:ring-1 focus:ring-[#e74c3c]"
          />

          {/* Levels */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mr-1">
              Nivel
            </span>
            {LEVEL_ORDER.map((lvl) => {
              const active = selectedLevels.has(lvl);
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => toggleLevel(lvl)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-all ${
                    active
                      ? "text-white shadow"
                      : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                  }`}
                  style={active ? { backgroundColor: LEVEL_COLORS[lvl] } : undefined}
                >
                  {lvl}
                </button>
              );
            })}
          </div>

          {/* Topics */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mr-1">
              Tema
            </span>
            {TOPIC_ORDER.map((topic) => {
              const active = selectedTopics.has(topic);
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggleTopic(topic)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-all ${
                    active
                      ? "bg-[#1a2a6c] text-white shadow"
                      : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                  }`}
                >
                  {TOPIC_LABELS[topic].emoji} {TOPIC_LABELS[topic].label}
                </button>
              );
            })}
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowOnlyUnwatched((v) => !v)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-all ${
                showOnlyUnwatched
                  ? "bg-[#00b894] text-white"
                  : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
              }`}
            >
              Solo no vistos
            </button>
            <button
              type="button"
              onClick={() => setShowOnlyFavorites((v) => !v)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-all ${
                showOnlyFavorites
                  ? "bg-yellow-400 text-white"
                  : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
              }`}
            >
              ★ Favoritos
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] text-zinc-500 hover:text-[#e74c3c] underline-offset-2 hover:underline ml-auto"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4">
          {filtered.length === 0 ? (
            <div className="h-full min-h-[40vh] flex flex-col items-center justify-center text-center gap-3 text-zinc-400">
              <span className="text-5xl">🔎</span>
              <p className="text-sm">No hay videos que coincidan con los filtros.</p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filtered.map((v) => (
                <VideoCard
                  key={v.id}
                  video={v}
                  watched={progress.isWatched(v.id)}
                  favorite={progress.isFavorite(v.id)}
                  onOpen={() => setViewing(v)}
                  onToggleFav={() => progress.toggleFavorite(v.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Player overlay */}
      {viewing && (
        <VideoPlayer
          video={viewing}
          watched={progress.isWatched(viewing.id)}
          favorite={progress.isFavorite(viewing.id)}
          onClose={() => setViewing(null)}
          onMarkWatched={() => handleMarkWatched(viewing)}
          onToggleFavorite={() => progress.toggleFavorite(viewing.id)}
          onAskTutor={onAskTutor}
        />
      )}
    </div>
  );
}
