import React from 'react';
import { Habit } from '../types';
import { calculateHabitStats, formatDisplayDate } from '../utils/habitUtils';
import { CheckCircle2, Flame, Trophy, Target, Sparkles, TrendingUp } from 'lucide-react';

interface StatsOverviewProps {
  habits: Habit[];
  selectedDate: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ habits, selectedDate }) => {
  if (!habits) return null;
  const totalHabits = habits.length;

  if (totalHabits === 0) return null;

  // Compute completions for selected date
  const completedTodayCount = habits.filter(
    (h) => h.completions && h.completions[selectedDate]?.completed
  ).length;

  const percentage = Math.round((completedTodayCount / totalHabits) * 100);

  // Compute streaks
  let maxCurrentStreak = 0;
  let topStreakHabitTitle = '';
  let maxBestStreak = 0;

  habits.forEach((h) => {
    const stats = calculateHabitStats(h, selectedDate);
    if (stats.currentStreak > maxCurrentStreak) {
      maxCurrentStreak = stats.currentStreak;
      topStreakHabitTitle = h.title;
    }
    if (stats.bestStreak > maxBestStreak) {
      maxBestStreak = stats.bestStreak;
    }
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Metric Card 1: Today's Completion Progress */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 relative overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs transition">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Today's Progress
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {completedTodayCount} <span className="text-zinc-500 dark:text-zinc-400 text-sm font-normal">/ {totalHabits}</span>
          </div>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{percentage}%</span>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            style={{ width: `${percentage}%` }}
            className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
          />
        </div>
      </div>

      {/* Metric Card 2: Active Streak Momentum */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 relative overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs transition">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Active Streak
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Flame className="w-4 h-4 fill-indigo-500/20" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {maxCurrentStreak} <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">Days</span>
          </div>
          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/20">
            Momentum
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-2">
          {topStreakHabitTitle ? `Lead: ${topStreakHabitTitle}` : 'Keep completing habits!'}
        </p>
      </div>

      {/* Metric Card 3: All-Time Best Record */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 relative overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs transition">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            All-Time Record
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-indigo-500/10 border border-amber-200 dark:border-indigo-500/20 flex items-center justify-center text-amber-600 dark:text-indigo-400">
            <Trophy className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {maxBestStreak} <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">Days</span>
          </div>
          <span className="text-xs font-semibold text-amber-700 dark:text-indigo-400 bg-amber-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-indigo-500/20">
            Best Streak
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
          Personal record benchmark
        </p>
      </div>

      {/* Metric Card 4: Daily Target Quality */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 relative overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs transition">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Day Target Status
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {percentage === 100 ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> Perfect Day!
              </span>
            ) : percentage >= 50 ? (
              <span className="text-indigo-600 dark:text-indigo-400">On Track</span>
            ) : (
              <span className="text-zinc-700 dark:text-zinc-300">In Progress</span>
            )}
          </div>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
          {formatDisplayDate(selectedDate)}
        </p>
      </div>

    </div>
  );
};
