"use client";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-[fadeIn_0.2s_ease-out] p-4"
      onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-[slideUp_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}>

        {/* Header gradient */}
        <div className="bg-gradient-to-br from-[#1a2a6c] via-[#2d3a8c] to-[#1a2a6c] px-6 pt-8 pb-6 text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00b894] rounded-full opacity-10 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#6c5ce7] rounded-full opacity-10 translate-y-1/2 -translate-x-1/2" />

          {/* Logo */}
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white">ROHU</h1>
          <p className="text-[#00b894] font-semibold text-sm mt-0.5">Learn English</p>

          {/* Avatar */}
          <div className="mt-4 relative inline-block">
            <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-[#00b894] mx-auto shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/avatar-tutor.png" alt="Ms. Emma" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#00b894] rounded-full border-2 border-[#1a2a6c] flex items-center justify-center">
              <span className="text-[8px]">✓</span>
            </div>
          </div>
          <p className="text-white/80 text-xs mt-2">Ms. Emma — Your AI Tutor</p>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-300 text-center leading-relaxed">
            Practice English with your personal AI tutor.
            Chat, listen, and improve every day!
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2.5">
              <span className="text-lg">💬</span>
              <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">Chat & Learn</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2.5">
              <span className="text-lg">🎯</span>
              <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">Vocab Quiz</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2.5">
              <span className="text-lg">🎧</span>
              <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">Listening Quiz</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2.5">
              <span className="text-lg">📖</span>
              <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">Dictionary</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2.5">
              <span className="text-lg">🔊</span>
              <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">Pronunciation</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2.5">
              <span className="text-lg">📝</span>
              <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">Conjugation</span>
            </div>
          </div>

          <button type="button" onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1a2a6c] to-[#00b894] text-white font-bold text-sm hover:shadow-lg transition-all">
            Start Learning!
          </button>

          <p className="text-[9px] text-zinc-300 dark:text-zinc-600 text-center">
            Tap any word in the chat to see its definition
          </p>
        </div>
      </div>
    </div>
  );
}
