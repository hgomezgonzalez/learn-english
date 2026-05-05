"use client";

import { useMemo, useState } from "react";
import type { BookGenre, BookItem } from "@/types/books";
import type { CEFRLevel } from "@/types/videos";
import {
  BOOKS,
  BOOK_LEVEL_ORDER,
  GENRE_LABELS,
  GENRE_ORDER,
} from "@/data/books";
import { LEVEL_COLORS } from "@/data/videos";
import { useBooksProgress } from "@/hooks/useBooksProgress";
import { BookCard } from "./BookCard";
import { BookPlayer } from "./BookPlayer";

interface BooksLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onAskTutor: (prompt: string) => void;
  onBookRead: () => void;
}

export function BooksLibrary({
  isOpen,
  onClose,
  onAskTutor,
  onBookRead,
}: BooksLibraryProps) {
  const [selectedLevels, setSelectedLevels] = useState<Set<CEFRLevel>>(new Set());
  const [selectedGenres, setSelectedGenres] = useState<Set<BookGenre>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [viewing, setViewing] = useState<BookItem | null>(null);

  const progress = useBooksProgress();

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return BOOKS.filter((b) => {
      if (selectedLevels.size > 0 && !selectedLevels.has(b.level)) return false;
      if (selectedGenres.size > 0 && !selectedGenres.has(b.genre)) return false;
      if (showOnlyUnread && progress.isRead(b.id)) return false;
      if (showOnlyFavorites && !progress.isFavorite(b.id)) return false;
      if (q) {
        const hay = `${b.title} ${b.author} ${b.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    selectedLevels,
    selectedGenres,
    searchQuery,
    showOnlyUnread,
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

  function toggleGenre(g: BookGenre) {
    setSelectedGenres((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  }

  function clearFilters() {
    setSelectedLevels(new Set());
    setSelectedGenres(new Set());
    setSearchQuery("");
    setShowOnlyUnread(false);
    setShowOnlyFavorites(false);
  }

  function handleMarkRead(book: BookItem) {
    const firstTime = progress.markRead(book.id);
    if (firstTime) onBookRead();
  }

  if (!isOpen) return null;

  const hasFilters =
    selectedLevels.size > 0 ||
    selectedGenres.size > 0 ||
    searchQuery.trim() !== "" ||
    showOnlyUnread ||
    showOnlyFavorites;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-zinc-50 dark:bg-zinc-900 w-full max-w-6xl flex flex-col max-h-[100dvh] sm:max-h-[96vh] sm:my-4 sm:rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-[#b45309] to-[#d97706] text-white">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl">📚</span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold truncate">
                Books in English
              </h2>
              <p className="text-[11px] text-white/80">
                {progress.readCount} de {BOOKS.length} leídos
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

        {/* Filters */}
        <div className="px-4 sm:px-5 py-3 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 space-y-2.5">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Buscar por título, autor o descripción..."
            className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706]"
          />

          {/* Levels */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mr-1">
              Nivel
            </span>
            {BOOK_LEVEL_ORDER.map((lvl) => {
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

          {/* Genres */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mr-1">
              Género
            </span>
            {GENRE_ORDER.map((g) => {
              const active = selectedGenres.has(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-all ${
                    active
                      ? "bg-[#b45309] text-white shadow"
                      : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                  }`}
                >
                  {GENRE_LABELS[g].emoji} {GENRE_LABELS[g].label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowOnlyUnread((v) => !v)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-all ${
                showOnlyUnread
                  ? "bg-[#00b894] text-white"
                  : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
              }`}
            >
              Solo no leídos
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
                className="text-[11px] text-zinc-500 hover:text-[#b45309] underline-offset-2 hover:underline ml-auto"
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
              <p className="text-sm">No hay libros que coincidan con los filtros.</p>
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
              {filtered.map((b) => (
                <BookCard
                  key={b.id}
                  book={b}
                  read={progress.isRead(b.id)}
                  favorite={progress.isFavorite(b.id)}
                  onOpen={() => setViewing(b)}
                  onToggleFav={() => progress.toggleFavorite(b.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {viewing && (
        <BookPlayer
          book={viewing}
          read={progress.isRead(viewing.id)}
          favorite={progress.isFavorite(viewing.id)}
          onClose={() => setViewing(null)}
          onMarkRead={() => handleMarkRead(viewing)}
          onToggleFavorite={() => progress.toggleFavorite(viewing.id)}
          onAskTutor={onAskTutor}
        />
      )}
    </div>
  );
}
