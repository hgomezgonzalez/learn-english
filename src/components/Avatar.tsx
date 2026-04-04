"use client";

import Image from "next/image";
import type { AvatarState } from "@/types";

function WaveBars() {
  return (
    <div className="flex items-end gap-1 h-5 justify-center mt-2">
      {[0, 100, 200, 300, 100].map((delay, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full bg-[#00b894] animate-[wave-bar_0.45s_ease-in-out_infinite]"
          style={{ animationDelay: `${delay}ms`, height: "4px" }}
        />
      ))}
    </div>
  );
}

export function Avatar({ state }: { state: AvatarState }) {
  const isSpeaking = state === "speaking";
  const isThinking = state === "thinking";

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative transition-transform duration-500 ${
          isThinking ? "scale-[1.02]" : "scale-100"
        } ${isSpeaking ? "animate-[headNod_2.5s_ease-in-out_infinite]" : ""}`}
      >
        {/* Speaking outer glow rings */}
        {isSpeaking && (
          <>
            <div className="absolute -inset-3 rounded-2xl bg-[#00b894] opacity-15 animate-ping" />
            <div className="absolute -inset-2 rounded-2xl bg-[#00b894] opacity-20 animate-pulse" />
          </>
        )}

        {/* Thinking glow */}
        {isThinking && (
          <div className="absolute -inset-2 rounded-2xl bg-amber-400 opacity-15 animate-pulse" />
        )}

        <div
          className={`relative w-48 h-56 rounded-2xl overflow-hidden border-[3px] transition-all duration-300 ${
            isSpeaking
              ? "border-[#00b894] shadow-2xl shadow-[#00b894]/30 animate-[breathe_2s_ease-in-out_infinite]"
              : isThinking
                ? "border-amber-400 shadow-lg shadow-amber-400/20 animate-pulse"
                : "border-white/20 shadow-md"
          }`}
        >
          <Image
            src="/avatar-tutor.png"
            alt="English Tutor"
            width={192}
            height={224}
            className="object-cover w-full h-full"
            priority
          />

          {/* Speaking shimmer overlay */}
          {isSpeaking && (
            <div className="absolute inset-0 bg-gradient-to-t from-[#00b894]/15 via-transparent to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
          )}
        </div>

        {/* Status indicator */}
        <div
          className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#1a2a6c] ${
            isSpeaking
              ? "bg-[#00b894] animate-bounce"
              : isThinking
                ? "bg-amber-400 animate-pulse"
                : "bg-[#00b894]"
          }`}
        />
      </div>

      {/* Name and status */}
      <div className="text-center">
        <p className="text-sm font-semibold text-white">Ms. Emma</p>
        {isSpeaking ? (
          <WaveBars />
        ) : (
          <p className={`text-xs ${isThinking ? "text-amber-400 animate-pulse" : "text-[#00b894]"}`}>
            {isThinking ? "Thinking..." : "Online"}
          </p>
        )}
      </div>
    </div>
  );
}
