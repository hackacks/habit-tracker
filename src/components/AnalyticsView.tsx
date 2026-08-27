import React from 'react';
import { Habit } from '../types';
import { CATEGORY_LIST } from '../utils/categories';
import { calculateHabitStats } from '../utils/habitUtils';
import { 
  Trophy, 
  Flame, 
  PieChart, 
  BarChart2, 
  Target, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle,
  Zap
} from 'lucide-react';

interface AnalyticsViewProps {
  habits: Habit[];
  selectedDate: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ habits, selectedDate }) => {
  if (!habits || habits.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-600">
        No habits to analyze yet. Please create habits first.
      </div>
    );
  }

  // Calculate stats for all habits
  const habitStatsList = habits.map((h) => ({
    habit: h,
    stats: calculateHabitStats(h, selectedDate),
  }));

  // Sort by current streak
  const streakLeaderboard = [...habitStatsList].sort(
    (a, b) => b.stats.currentStreak - a.stats.currentStreak
  );

  // Category completion stats
  const categoryStats = CATEGORY_LIST.map((cat) => {
    const catHabits = habitStatsList.filter((item) => item.habit.categoryId === cat.id);
    if (catHabits.length === 0) {
      return { category: cat, habitCount: 0, avgCompletionRate: 0, totalCompletions: 0 };
    }
    const sumRates = catHabits.reduce((acc, item) => acc + item.stats.completionRate30Days, 0);
    const sumCompletions = catHabits.reduce((acc, item) => acc + item.stats.totalCompletions, 0);
    return {
      category: cat,
      habitCount: catHabits.length,
      avgCompletionRate: Math.round(sumRates / catHabits.length),
      totalCompletions: sumCompletions,
    };
  }).filter((item) => item.habitCount > 0);

  // Total completions overall
  const grandTotalCompletions = habitStatsList.reduce(
    (acc, item) => acc + item.stats.totalCompletions,
    0
  );

  // Average 30-day completion rate
  const overallAvgCompletionRate = Math.round(
    habitStatsList.reduce((acc, item) => acc + item.stats.completionRate30Days, 0) /
      habitStatsList.length
  );

  return (
    <div className="space-y-8">
      
      {/* Analytics Overview Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Total Completions
            </span>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{grandTotalCompletions}</div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">All-time logged actions</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              30-Day Avg Success
            </span>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{overallAvgCompletionRate}%</div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Consistency benchmark</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            <Flame className="w-6 h-6 fill-indigo-500/20" />
          </div>
          <div>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Active Habit Count
            </span>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{habits.length}</div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Habits in routine</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Performance Breakdown */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Category Consistency Rate</h3>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Past 30 Days</span>
          </div>

          <div className="space-y-4">
            {categoryStats.map((cs) => (
              <div key={cs.category.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cs.category.color }}
                    />
                    {cs.category.name} ({cs.habitCount})
                  </span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-300">{cs.avgCompletionRate}%</span>
                </div>
                {/* Meter */}
                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${cs.avgCompletionRate}%`, backgroundColor: cs.category.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak Leaderboard */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Habit Streak Leaderboard</h3>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Active Streaks</span>
          </div>

          <div className="space-y-3">
            {streakLeaderboard.map((item, idx) => (
              <div
                key={item.habit.id}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      idx === 0
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : idx === 1
                        ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-50'
                        : idx === 2
                        ? 'bg-amber-100 text-amber-800 dark:bg-zinc-800 dark:text-zinc-300'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200">{item.habit.title}</h4>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      Total: {item.stats.totalCompletions} logs
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 text-indigo-700 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-500/20">
                    <Flame className="w-3.5 h-3.5 fill-indigo-500/20" />
                    <span>{item.stats.currentStreak}d streak</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
