"use client";

import type { VideoItem } from "@/types/videos";
import { LEVEL_COLORS, TOPIC_LABELS } from "@/data/videos";

interface VideoPlayerProps {
  video: VideoItem;
  watched: boolean;
  favorite: boolean;
  onClose: () => void;
  onMarkWatched: () => void;
  onToggleFavorite: () => void;
  onAskTutor: (prompt: string) => void;
}

export function VideoPlayer({
  video,
  watched,
  favorite,
  onClose,
  onMarkWatched,
  onToggleFavorite,
  onAskTutor,
}: VideoPlayerProps) {
  const topicsLabel = video.topics
    .map((t) => `${TOPIC_LABELS[t].emoji} ${TOPIC_LABELS[t].label}`)
    .join(", ");

  function askTutor() {
    const levelStr = video.levels.join("/");
    const topicStr = video.topics.map((t) => TOPIC_LABELS[t].label).join(", ");
    const prompt = `I just watched a video titled "${video.title}" by ${video.channel} (level: ${levelStr}, topic: ${topicStr}). Ask me 3 short comprehension questions about typical vocabulary or grammar related to this topic, one at a time.`;
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
          <h2 className="text-sm sm:text-base font-bold text-[#1a2a6c] dark:text-white truncate pr-2">
            📺 {video.title}
          </h2>
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

        {/* Iframe (lazy: only mounted when this component mounts) */}
        <div className="bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
            title={video.title}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full aspect-video"
          />
        </div>

        {/* Body */}
        <div className="flex-1 p-4 sm:p-5 space-y-4">
          {/* Channel + chips */}
          <div className="space-y-2">
            <p className="text-sm text-zinc-500">{video.channel}</p>
            <div className="flex flex-wrap gap-1.5">
              {video.levels.map((lvl) => (
                <span
                  key={lvl}
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: LEVEL_COLORS[lvl] }}
                >
                  {lvl}
                </span>
              ))}
              {video.topics.map((t) => (
                <span
                  key={t}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  {TOPIC_LABELS[t].emoji} {TOPIC_LABELS[t].label}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {video.description}
          </p>
          {video.recommendedFor && (
            <div className="rounded-xl bg-[#e74c3c]/5 dark:bg-[#e74c3c]/10 border border-[#e74c3c]/20 px-3 py-2">
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                <span className="font-bold text-[#e74c3c]">Recomendado:</span>{" "}
                {video.recommendedFor}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={onMarkWatched}
              disabled={watched}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                watched
                  ? "bg-[#00b894]/15 text-[#00b894] cursor-not-allowed"
                  : "bg-gradient-to-r from-[#00b894] to-[#00a383] text-white hover:shadow-lg active:scale-[0.98]"
              }`}
            >
              {watched ? "✓ Visto (+10 XP)" : "✓ Marcar como visto"}
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
            title="Preguntar a Ms. Emma sobre este video"
          >
            <span>🤖</span>
            <span>Preguntar a Ms. Emma sobre este video</span>
          </button>

          <a
            href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
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
