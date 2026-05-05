"use client";

import type { BookItem } from "@/types/books";
import { GENRE_LABELS } from "@/data/books";
import { LEVEL_COLORS } from "@/data/videos";

interface BookPlayerProps {
  book: BookItem;
  read: boolean;
  favorite: boolean;
  onClose: () => void;
  onMarkRead: () => void;
  onToggleFavorite: () => void;
  onAskTutor: (prompt: string) => void;
}

export function BookPlayer({
  book,
  read,
  favorite,
  onClose,
  onMarkRead,
  onToggleFavorite,
  onAskTutor,
}: BookPlayerProps) {
  const genre = GENRE_LABELS[book.genre];

  function askTutor() {
    const prompt = `I just listened to a graded reader summary of the book "${book.title}" by ${book.author} (level: ${book.level}, genre: ${genre.label}). Ask me 3 short comprehension questions about the main ideas of this book, one at a time. Wait for my answer before asking the next question.`;
    onAskTutor(prompt);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 animate-[fadeIn_0.2s_ease-out] p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 w-full sm:max-w-3xl sm:rounded-2xl shadow-2xl max-h-[100dvh] sm:max-h-[92vh] overflow-y-auto animate-[slideUp_0.25s_ease-out] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
          <div className="min-w-0 pr-2">
            <h2 className="text-sm sm:text-base font-bold text-[#b45309] dark:text-[#fbbf24] truncate">
              📚 {book.title}
            </h2>
            <p className="text-[11px] text-zinc-500 italic truncate">by {book.author}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 flex-shrink-0 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Iframe (lazy: mounts only when this component is mounted) */}
        <div className="bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${book.youtubeId}?rel=0&modestbranding=1`}
            title={book.title}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full aspect-video"
          />
        </div>

        {/* Body */}
        <div className="flex-1 p-4 sm:p-5 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-zinc-500">
              {book.channel} · graded reader
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: LEVEL_COLORS[book.level] }}
              >
                {book.level}
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#d97706]/15 text-[#b45309]">
                {genre.emoji} {genre.label}
              </span>
            </div>
          </div>

          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {book.description}
          </p>
          {book.whyRead && (
            <div className="rounded-xl bg-[#d97706]/5 dark:bg-[#d97706]/10 border border-[#d97706]/25 px-3 py-2">
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                <span className="font-bold text-[#b45309]">Por qué leerlo:</span>{" "}
                {book.whyRead}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={onMarkRead}
              disabled={read}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                read
                  ? "bg-[#00b894]/15 text-[#00b894] cursor-not-allowed"
                  : "bg-gradient-to-r from-[#b45309] to-[#d97706] text-white hover:shadow-lg active:scale-[0.98]"
              }`}
            >
              {read ? "✓ Leído (+15 XP)" : "✓ Marcar como leído"}
            </button>
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`sm:w-32 py-3 rounded-xl font-bold text-sm transition-all ${
                favorite
                  ? "bg-yellow-400 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {favorite ? "★ Favorito" : "☆ Favorito"}
            </button>
          </div>

          <button
            type="button"
            onClick={askTutor}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1a2a6c] to-[#2d3a8c] text-white font-bold text-sm hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            title="Preguntar a Ms. Emma sobre este libro"
          >
            <span>🤖</span>
            <span>Preguntar a Ms. Emma sobre este libro</span>
          </button>

          <a
            href={`https://www.youtube.com/watch?v=${book.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs text-zinc-400 hover:text-zinc-600 underline-offset-2 hover:underline"
          >
            ¿No carga? Abrir en YouTube
          </a>
        </div>
      </div>
    </div>
  );
}
