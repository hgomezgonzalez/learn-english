"use client";

import { useState } from "react";
import type { VideoItem } from "@/types/videos";
import { LEVEL_COLORS } from "@/data/videos";

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface VideoCardProps {
  video: VideoItem;
  watched: boolean;
  favorite: boolean;
  onOpen: () => void;
  onToggleFav: () => void;
}

export function VideoCard({ video, watched, favorite, onOpen, onToggleFav }: VideoCardProps) {
  const [thumbError, setThumbError] = useState(false);
  const thumbUrl = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative flex flex-col text-left bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:border-[#e74c3c]/60 hover:shadow-lg transition-all active:scale-[0.98]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
        {!thumbError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbUrl}
            alt={video.title}
            loading="lazy"
            onError={() => setThumbError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#e74c3c]/20 to-[#ff7675]/20">
            <span className="text-4xl">📺</span>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
          <div className="w-12 h-12 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transition-all">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="#e74c3c"
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>

        {/* Duration */}
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 text-white text-[10px] font-bold">
          {formatDuration(video.durationSec)}
        </span>

        {/* Watched badge */}
        {watched && (
          <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[#00b894] text-white flex items-center justify-center shadow">
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
      <div className="flex-1 flex flex-col gap-1.5 p-3">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-2 leading-snug">
          {video.title}
        </h3>
        <p className="text-[11px] text-zinc-500 truncate">{video.channel}</p>

        <div className="flex flex-wrap gap-1 mt-1">
          {video.levels.map((lvl) => (
            <span
              key={lvl}
              className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
              style={{ backgroundColor: LEVEL_COLORS[lvl] }}
            >
              {lvl}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
