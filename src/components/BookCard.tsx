"use client";

import { useState } from "react";
import type { BookItem } from "@/types/books";
import { GENRE_LABELS } from "@/data/books";
import { LEVEL_COLORS } from "@/data/videos";

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

interface BookCardProps {
  book: BookItem;
  read: boolean;
  favorite: boolean;
  onOpen: () => void;
  onToggleFav: () => void;
}

export function BookCard({ book, read, favorite, onOpen, onToggleFav }: BookCardProps) {
  const [thumbError, setThumbError] = useState(false);
  const thumbUrl = `https://i.ytimg.com/vi/${book.youtubeId}/hqdefault.jpg`;
  const genre = GENRE_LABELS[book.genre];

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative flex flex-col text-left bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:border-[#d97706]/60 hover:shadow-lg transition-all active:scale-[0.98]"
    >
      <div className="relative aspect-video bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
        {!thumbError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbUrl}
            alt={book.title}
            loading="lazy"
            onError={() => setThumbError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#d97706]/20 to-[#b45309]/20">
            <span className="text-4xl">📚</span>
          </div>
        )}

        {/* Hover play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-colors">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-full text-xs font-bold text-[#b45309]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Leer
          </div>
        </div>

        {/* Duration */}
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 text-white text-[10px] font-bold">
          {formatDuration(book.durationSec)}
        </span>

        {/* Read badge */}
        {read && (
          <span
            className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[#00b894] text-white flex items-center justify-center shadow"
            title="Leído"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}

        {/* Favorite */}
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onToggleFav();
            }
          }}
          aria-label={favorite ? "Quitar de favoritos" : "Marcar favorito"}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-base shadow transition-all cursor-pointer ${
            favorite
              ? "bg-yellow-400 text-white"
              : "bg-white/90 text-zinc-400 hover:text-yellow-400"
          }`}
        >
          {favorite ? "★" : "☆"}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-1 p-3">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-2 leading-snug">
          {book.title}
        </h3>
        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 italic truncate">
          by {book.author}
        </p>

        <div className="flex flex-wrap gap-1 mt-1.5">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
            style={{ backgroundColor: LEVEL_COLORS[book.level] }}
          >
            {book.level}
          </span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#d97706]/10 text-[#b45309]">
            {genre.emoji} {genre.label}
          </span>
        </div>
      </div>
    </button>
  );
}
