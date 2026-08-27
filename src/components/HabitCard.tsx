import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { NumericWidget, ChecklistWidget, TimerWidget } from './HabitEvaluationWidgets';

interface HabitCardProps {
  habit: Habit;
  selectedDate: string;
  onToggleCompletion: (habitId: string, dateStr: string, updateData?: any) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ 
  habit,
  selectedDate,
  onToggleCompletion,
  onEditHabit,
  onDeleteHabit
}) => {
  const [showMenu, setShowMenu] = useState(false);

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
    if (habit.evaluationType === 'TIMER') {
      if (!isCompletedToday) {
        // Cannot manually check off countdown timer habits without running and completing the countdown!
        return;
      } else {
        // If already completed, clicking resets the completion
        onToggleCompletion(habit.id, selectedDate, {
          value: 0,
          completed: false
        });
        return;
      }
    }

    if (habit.evaluationType === 'CHECKLIST' && habit.checklistItems && habit.checklistItems.length > 0) {
      if (isCompletedToday) {
        const clearedState = habit.checklistItems.reduce((acc, it) => ({ ...acc, [it]: false }), {} as Record<string, boolean>);
        onToggleCompletion(habit.id, selectedDate, {
          checklistState: clearedState,
          completed: false,
          value: 0
        });
      } else {
        const allCheckedState = habit.checklistItems.reduce((acc, it) => ({ ...acc, [it]: true }), {} as Record<string, boolean>);
        onToggleCompletion(habit.id, selectedDate, {
          checklistState: allCheckedState,
          completed: true,
          value: habit.checklistItems.length
        });
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: [category.color, '#f59e0b', '#3b82f6', '#10b981'],
        });
      }
      return;
    }

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

  const handleMiniDayToggle = (dateStr: string, isDone: boolean) => {
    if (habit.evaluationType === 'TIMER') {
      if (!isDone) {
        return;
      } else {
        onToggleCompletion(habit.id, dateStr, { value: 0, completed: false });
        return;
      }
    }
    onToggleCompletion(habit.id, dateStr);
  };

  return (
    <div
      className={`group relative bg-white dark:bg-zinc-900 border rounded-2xl p-5 transition-all duration-200 hover:shadow-xl ${
        isCompletedToday
          ? 'border-indigo-500/40 bg-white dark:bg-zinc-900'
          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        
        {/* Left Side: Animated Completion Toggle Button */}
        <div className="flex items-start gap-3.5">
          <button
            onClick={handleMainToggle}
            disabled={habit.evaluationType === 'TIMER' && !isCompletedToday}
            title={
              habit.evaluationType === 'TIMER' && !isCompletedToday
                ? 'Countdown habit: Start and complete the timer below to check off this habit'
                : isCompletedToday
                ? 'Click to reset completion'
                : 'Click to mark as complete'
            }
            className={`mt-0.5 relative flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 ${
              isCompletedToday
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-105 active:scale-90 cursor-pointer'
                : habit.evaluationType === 'TIMER'
                ? 'bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                : 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-700 text-transparent hover:border-indigo-500/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-90 cursor-pointer'
            }`}
          >
            {isCompletedToday ? (
              <div className="transition-transform transform scale-100">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
            ) : habit.evaluationType === 'TIMER' ? (
              <Clock className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            ) : null}
          </button>

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

              {habit.priority === 'HIGH' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                  High
                </span>
              )}
              {habit.priority === 'URGENT' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                  Urgent
                </span>
              )}
              {habit.priority === 'LOW' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border border-zinc-500/20 uppercase tracking-wider">
                  Low
                </span>
              )}

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

            {/* Evaluation Widget */}
            {habit.evaluationType === 'NUMERIC' && (
              <NumericWidget habit={habit} completionData={habit.completions?.[selectedDate]} onUpdate={(data) => onToggleCompletion(habit.id, selectedDate, data)} />
            )}
            {habit.evaluationType === 'CHECKLIST' && (
              <ChecklistWidget habit={habit} completionData={habit.completions?.[selectedDate]} onUpdate={(data) => onToggleCompletion(habit.id, selectedDate, data)} />
            )}
            {habit.evaluationType === 'TIMER' && (
              <TimerWidget habit={habit} completionData={habit.completions?.[selectedDate]} onUpdate={(data) => onToggleCompletion(habit.id, selectedDate, data)} />
            )}
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
              onClick={() => handleMiniDayToggle(d.dateStr, d.isDone)}
              title={
                habit.evaluationType === 'TIMER' && !d.isDone
                  ? `${d.dayLabel} (${d.dateStr}): Countdown timer required`
                  : `${d.dayLabel} (${d.dateStr}): ${d.isDone ? 'Completed' : 'Missed'}`
              }
              className={`flex flex-col items-center gap-1 p-1 rounded-md transition ${
                d.dateStr === selectedDate ? 'bg-indigo-500/10 ring-1 ring-indigo-500/50' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
              } ${habit.evaluationType === 'TIMER' && !d.isDone ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
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

    </div>
  );
};
