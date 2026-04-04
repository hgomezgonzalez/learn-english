"use client";

interface ScoreBoardProps {
  totalXp: number;
  todayXp: number;
  streak: number;
  level: { name: string; emoji: string; minXp: number };
  nextLevel: { name: string; emoji: string; minXp: number } | null;
  levelProgress: number;
  todayMessages: number;
  todayQuizzes: number;
  todayWords: number;
}

export function ScoreBoard({
  totalXp,
  todayXp,
  streak,
  level,
  nextLevel,
  levelProgress,
  todayMessages,
  todayQuizzes,
  todayWords,
}: ScoreBoardProps) {
  return (
    <div className="w-full rounded-xl bg-white/5 border border-white/10 p-4 text-white space-y-3">
      {/* Level + XP */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{level.emoji}</span>
          <div>
            <p className="text-xs font-bold text-white">{level.name}</p>
            <p className="text-[10px] text-white/40">{totalXp} XP total</p>
          </div>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 bg-orange-500/20 rounded-full px-2.5 py-1">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-bold text-orange-300">{streak}</span>
          </div>
        )}
      </div>

      {/* Level progress bar */}
      <div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00b894] to-[#55efc4] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(levelProgress, 100)}%` }}
          />
        </div>
        {nextLevel && (
          <p className="text-[10px] text-white/30 mt-1 text-right">
            {nextLevel.minXp - totalXp} XP to {nextLevel.emoji} {nextLevel.name}
          </p>
        )}
      </div>

      {/* Today stats */}
      <div className="bg-white/5 rounded-lg p-3">
        <p className="text-[10px] font-semibold text-[#00b894] uppercase tracking-wide mb-2">Today</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{todayXp}</p>
            <p className="text-[10px] text-white/40">XP earned</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{todayMessages}</p>
            <p className="text-[10px] text-white/40">Messages</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{todayQuizzes}</p>
            <p className="text-[10px] text-white/40">Quizzes</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{todayWords}</p>
            <p className="text-[10px] text-white/40">Words</p>
          </div>
        </div>
      </div>
    </div>
  );
}
