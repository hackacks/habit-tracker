import React, { useState } from 'react';
import { Habit } from '../types';
import { CATEGORIES } from '../utils/categories';
import { getOffsetDateStr, formatDisplayDate, isHabitScheduledForDate } from '../utils/habitUtils';
import { Calendar, Grid, Flame, ChevronRight, Info } from 'lucide-react';

interface HeatmapViewProps {
  habits: Habit[];
  onToggleCompletion: (habitId: string, dateStr: string) => void;
}

export const HeatmapView: React.FC<HeatmapViewProps> = ({ habits, onToggleCompletion }) => {
  const [timeRangeDays, setTimeRangeDays] = useState<number>(90); // 90, 180, 365
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all');
  const [hoveredDateInfo, setHoveredDateInfo] = useState<{
    dateStr: string;
    completedCount: number;
    totalScheduled: number;
    percentage: number;
  } | null>(null);

  // Generate array of date strings from past (timeRangeDays - 1) to today
  const dateList = React.useMemo(() => {
    const dates: string[] = [];
    for (let i = timeRangeDays - 1; i >= 0; i--) {
      dates.push(getOffsetDateStr(-i));
    }
    return dates;
  }, [timeRangeDays]);

  // Group dates into columns of 7 days (weeks) for GitHub style heatmap
  const weeksMatrix = React.useMemo(() => {
    const weeks: string[][] = [];
    let currentWeek: string[] = [];

    dateList.forEach((dStr) => {
      currentWeek.push(dStr);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    return weeks;
  }, [dateList]);

  // Compute daily stats for combined activity
  const getDailyStats = (dateStr: string, habitFilterId: string) => {
    const targetHabits = habitFilterId === 'all' 
      ? habits 
      : habits.filter((h) => h.id === habitFilterId);

    if (targetHabits.length === 0) {
      return { completedCount: 0, totalScheduled: 0, percentage: 0 };
    }

    let completedCount = 0;
    let totalScheduled = 0;

    targetHabits.forEach((h) => {
      if (isHabitScheduledForDate(h, dateStr)) {
        totalScheduled++;
        if (h.completions && h.completions[dateStr]?.completed) {
          completedCount++;
        }
      }
    });

    const percentage = totalScheduled > 0 ? Math.round((completedCount / totalScheduled) * 100) : 0;
    return { completedCount, totalScheduled, percentage };
  };

  // Intensity color picker
  const getCellBgClass = (percentage: number, totalScheduled: number) => {
    if (totalScheduled === 0) return 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800/40 opacity-40';
    if (percentage === 0) return 'bg-zinc-100 dark:bg-zinc-800/90 border-zinc-200/80 dark:border-zinc-800';
    if (percentage <= 25) return 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300';
    if (percentage <= 50) return 'bg-emerald-300 dark:bg-emerald-800/80 border-emerald-400 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-200';
    if (percentage <= 75) return 'bg-emerald-500 dark:bg-emerald-600/90 border-emerald-600 dark:border-emerald-500/80 text-white dark:text-emerald-100 shadow-xs';
    return 'bg-emerald-600 dark:bg-gradient-to-tr dark:from-emerald-500 dark:to-teal-400 border-emerald-700 dark:border-emerald-300 text-white shadow-xs';
  };

  return (
    <div className="space-y-8">
      
      {/* Top Heatmap Control Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Consistency Matrix</h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Visualizing daily completion momentum across past activity windows
          </p>
        </div>

        {/* Timeframe & Habit Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* Habit Selector */}
          <select
            value={selectedHabitId}
            onChange={(e) => setSelectedHabitId(e.target.value)}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">⚡ Master All Habits Heatmap</option>
            {habits.map((h) => (
              <option key={h.id} value={h.id}>
                {h.title}
              </option>
            ))}
          </select>

          {/* Timeframe selector */}
          <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-medium">
            <button
              onClick={() => setTimeRangeDays(90)}
              className={`px-3 py-1 rounded-lg transition ${
                timeRangeDays === 90 ? 'bg-indigo-500 text-white font-semibold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              90 Days
            </button>
            <button
              onClick={() => setTimeRangeDays(180)}
              className={`px-3 py-1 rounded-lg transition ${
                timeRangeDays === 180 ? 'bg-indigo-500 text-white font-semibold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              180 Days
            </button>
            <button
              onClick={() => setTimeRangeDays(365)}
              className={`px-3 py-1 rounded-lg transition ${
                timeRangeDays === 365 ? 'bg-indigo-500 text-white font-semibold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              1 Year
            </button>
          </div>

        </div>
      </div>

      {/* GitHub-Style Master Heatmap Grid Box */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 relative overflow-x-auto shadow-xs">
        
        {/* Heatmap Matrix Header Info */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>
              Showing activity over the past <strong>{timeRangeDays} days</strong>
            </span>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 mr-1">Less</span>
            <div className="w-3.5 h-3.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800" />
            <div className="w-3.5 h-3.5 rounded bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800/50" />
            <div className="w-3.5 h-3.5 rounded bg-emerald-300 dark:bg-emerald-800 border border-emerald-400 dark:border-emerald-700" />
            <div className="w-3.5 h-3.5 rounded bg-emerald-500 dark:bg-emerald-600 border border-emerald-600 dark:border-emerald-500" />
            <div className="w-3.5 h-3.5 rounded bg-emerald-600 dark:bg-emerald-500 border border-emerald-700 dark:border-emerald-400" />
            <span className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 ml-1">More</span>
          </div>
        </div>

        {/* Heatmap Grid rendering */}
        <div className="min-w-[650px]">
          <div className="flex gap-1.5 pb-2">
            {weeksMatrix.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((dStr) => {
                  const stats = getDailyStats(dStr, selectedHabitId);
                  const bgClass = getCellBgClass(stats.percentage, stats.totalScheduled);

                  return (
                    <div
                      key={dStr}
                      onMouseEnter={() =>
                        setHoveredDateInfo({
                          dateStr: dStr,
                          completedCount: stats.completedCount,
                          totalScheduled: stats.totalScheduled,
                          percentage: stats.percentage,
                        })
                      }
                      onMouseLeave={() => setHoveredDateInfo(null)}
                      onClick={() => {
                        if (habits.length > 0) {
                          onToggleCompletion(habits[0].id, dStr);
                        }
                      }}
                      className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-sm border cursor-pointer transition-all duration-150 hover:scale-125 hover:z-10 ${bgClass}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip / Details Footer Bar */}
        <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs min-h-[32px]">
          {hoveredDateInfo ? (
            <div className="flex items-center gap-3">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {formatDisplayDate(hoveredDateInfo.dateStr)}
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                {hoveredDateInfo.completedCount} / {hoveredDateInfo.totalScheduled} Completed ({hoveredDateInfo.percentage}%)
              </span>
            </div>
          ) : (
            <span className="text-zinc-500 dark:text-zinc-400 text-xs flex items-center gap-1.5 italic">
              <Info className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              Hover over any square cell to inspect exact daily habit metrics.
            </span>
          )}
        </div>

      </div>

      {/* Individual Habit Heatmaps Breakdown Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          <span>Individual Habit Heatmaps</span>
          <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">({habits.length} habits)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((h) => {
            const category = CATEGORIES[h.categoryId] || CATEGORIES.personal;
            return (
              <div
                key={h.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 space-y-3 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: category.color }} />
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">{h.title}</h4>
                  </div>
                  <span className={`text-[10px] uppercase font-semibold px-2.5 py-0.5 rounded-md border ${category.badgeBg} ${category.badgeText} ${category.borderColor}`}>
                    {category.name}
                  </span>
                </div>

                {/* Habit Mini Grid (last 60 days) */}
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {Array.from({ length: 60 }, (_, i) => {
                    const offset = i - 59; // -59 to 0
                    const dStr = getOffsetDateStr(offset);
                    const isDone = Boolean(h.completions && h.completions[dStr]?.completed);
                    const isSched = isHabitScheduledForDate(h, dStr);

                    return (
                      <div
                        key={dStr}
                        title={`${dStr}: ${isDone ? 'Completed' : isSched ? 'Missed' : 'Not Scheduled'}`}
                        className={`w-3.5 h-3.5 flex-shrink-0 rounded-sm border ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-600 dark:border-emerald-400'
                            : isSched
                            ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800'
                            : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200/50 dark:border-zinc-800'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
