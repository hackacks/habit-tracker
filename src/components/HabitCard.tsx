import React from 'react';
import { Habit } from '../types';
import { CATEGORIES } from '../utils/categories';
import { calculateHabitStats, getOffsetDateStr, isHabitScheduledForDate, getDayName } from '../utils/habitUtils';
import { 
  Check, 
  Flame, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  HeartPulse, 
  Dumbbell, 
  Brain, 
  Briefcase, 
  Coins, 
  Sparkles,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface HabitCardProps {
  habit: Habit;
  selectedDate: string;
  onToggleCompletion: (habitId: string, dateStr: string) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  selectedDate,
  onToggleCompletion,
  onEditHabit,
  onDeleteHabit,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const category = CATEGORIES[habit.categoryId] || CATEGORIES.personal;
  const isCompletedToday = Boolean(habit.completions && habit.completions[selectedDate]?.completed);
  const stats = calculateHabitStats(habit, selectedDate);

  // Icon dynamic picker
  const renderIcon = () => {
    switch (category.iconName) {
      case 'HeartPulse': return <HeartPulse className="w-4 h-4" />;
      case 'Dumbbell': return <Dumbbell className="w-4 h-4" />;
      case 'Brain': return <Brain className="w-4 h-4" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4" />;
      case 'Coins': return <Coins className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const handleMainToggle = () => {
    onToggleCompletion(habit.id, selectedDate);
    // Trigger confetti on fresh completion
    if (!isCompletedToday) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: [category.color, '#f59e0b', '#3b82f6', '#10b981'],
      });
    }
  };

  // Mini 7-day history array (last 6 days + today)
  const miniPastDays = Array.from({ length: 7 }, (_, i) => {
    const offset = i - 6; // -6, -5, ..., 0
    const dStr = getOffsetDateStr(offset);
    const isDone = Boolean(habit.completions && habit.completions[dStr]?.completed);
    const isScheduled = isHabitScheduledForDate(habit, dStr);
    const dayLabel = getDayName(dStr);
    return { offset, dateStr: dStr, isDone, isScheduled, dayLabel };
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`group relative bg-white dark:bg-zinc-900 border rounded-2xl p-5 transition-all duration-200 hover:shadow-xl ${
        isCompletedToday
          ? 'border-indigo-500/40 bg-white dark:bg-zinc-900'
          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        
        {/* Left Side: Animated Completion Toggle Button */}
        <div className="flex items-start gap-3.5">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleMainToggle}
            className={`mt-0.5 relative flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              isCompletedToday
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-105'
                : 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-700 text-transparent hover:border-indigo-500/50 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <AnimatePresence mode="wait">
              {isCompletedToday ? (
                <motion.div
                  key="checked"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.button>

          {/* Title, Category & Description */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`font-bold text-base transition-colors ${
                  isCompletedToday ? 'text-zinc-500 dark:text-zinc-400 line-through decoration-zinc-600' : 'text-zinc-900 dark:text-zinc-50'
                }`}
              >
                {habit.title}
              </h3>

              {/* Category Pill */}
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-md border ${category.badgeBg} ${category.badgeText} ${category.borderColor}`}
              >
                {renderIcon()}
                <span>{category.name}</span>
              </span>
            </div>

            {habit.description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl">
                {habit.description}
              </p>
            )}

            {/* Target Details & Frequency */}
            <div className="flex items-center gap-3 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              <span className="capitalize bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-800">
                {habit.frequency}
              </span>
              {habit.targetValue && habit.unit && (
                <span>
                  Target: <strong className="text-zinc-800 dark:text-zinc-200">{habit.targetValue} {habit.unit}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Flame Streak Count & Actions Menu */}
        <div className="flex items-center gap-3">
          {/* Streak Flame Pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold transition-all ${
              stats.currentStreak > 0
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'
            }`}
            title={`Current streak: ${stats.currentStreak} days | Best: ${stats.bestStreak} days`}
          >
            <Flame
              className={`w-4 h-4 ${
                stats.currentStreak > 0 ? 'text-indigo-400 fill-indigo-400/20' : 'text-zinc-600'
              }`}
            />
            <span>{stats.currentStreak} d</span>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 mt-1 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl py-1 z-20"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEditHabit(habit);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Edit Habit</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteHabit(habit.id);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Habit</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mini 7-Day History Strip */}
      <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Last 7 Days
        </span>
        <div className="flex items-center gap-1.5">
          {miniPastDays.map((d) => (
            <button
              key={d.dateStr}
              onClick={() => onToggleCompletion(habit.id, d.dateStr)}
              title={`${d.dayLabel} (${d.dateStr}): ${d.isDone ? 'Completed' : 'Missed'}`}
              className={`flex flex-col items-center gap-1 p-1 rounded-md transition ${
                d.dateStr === selectedDate ? 'bg-indigo-500/10 ring-1 ring-indigo-500/50' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono">{d.dayLabel}</span>
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                  d.isDone
                    ? 'bg-indigo-500 text-white scale-100'
                    : d.isScheduled
                    ? 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-700'
                    : 'bg-zinc-950 border border-zinc-200 dark:border-zinc-800/50'
                }`}
              >
                {d.isDone && <Check className="w-2.5 h-2.5 stroke-[2.5]" />}
              </div>
            </button>
          ))}
        </div>
      </div>

    </motion.div>
  );
};
