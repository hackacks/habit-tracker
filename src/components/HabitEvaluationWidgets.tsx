import React, { useState, useEffect } from 'react';
import { Habit, HabitCompletion } from '../types';
import { Check, Plus, Minus, Play, Pause, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WidgetProps {
  habit: Habit;
  completionData?: HabitCompletion;
  onUpdate: (data: Partial<HabitCompletion>) => void;
}

export const NumericWidget: React.FC<WidgetProps> = ({ habit, completionData, onUpdate }) => {
  const value = completionData?.value || 0;
  const target = habit.targetValue || 1;
  
  const handleAdd = () => {
    const newVal = Math.min(value + 1, target);
    onUpdate({ value: newVal, completed: newVal >= target });
  };
  const handleSub = () => {
    const newVal = Math.max(value - 1, 0);
    onUpdate({ value: newVal, completed: newVal >= target });
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <button onClick={handleSub} className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer">
        <Minus className="w-4 h-4" />
      </button>
      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 w-auto min-w-[4rem] text-center">
        {value} / {target} {habit.unit}
      </span>
      <button onClick={handleAdd} className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ChecklistWidget: React.FC<WidgetProps> = ({ habit, completionData, onUpdate }) => {
  const items = habit.checklistItems || [];
  const state = completionData?.checklistState || {};
  
  const completedCount = items.filter(i => Boolean(state[i])).length;
  const isAllDone = items.length > 0 && completedCount === items.length;

  const toggleItem = (item: string) => {
    const isCurrentlyChecked = Boolean(state[item]);
    const newState = { ...state, [item]: !isCurrentlyChecked };
    const allDone = items.length > 0 && items.every(i => Boolean(newState[i]));
    const newCompletedCount = items.filter(i => Boolean(newState[i])).length;

    // Trigger confetti when newly completing all checklist items
    if (allDone && !completionData?.completed) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#f59e0b', '#3b82f6', '#10b981'],
      });
    }

    onUpdate({
      checklistState: newState,
      completed: allDone,
      value: newCompletedCount,
    });
  };

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mt-3 p-3 bg-zinc-50/80 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80">
      <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-0.5">
        <span>Sub-tasks ({completedCount}/{items.length})</span>
        {isAllDone && (
          <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
            <Check className="w-3.5 h-3.5" /> All completed
          </span>
        )}
      </div>
      <div className="space-y-1">
        {items.map((item, idx) => {
          const checked = Boolean(state[item]);
          return (
            <button
              key={`${item}-${idx}`}
              type="button"
              onClick={() => toggleItem(item)}
              className="flex items-center gap-2.5 w-full text-left p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors group cursor-pointer"
            >
              <div
                className={`flex-shrink-0 w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                  checked
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                    : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 group-hover:border-indigo-400'
                }`}
              >
                {checked && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span
                className={`text-xs select-none transition-colors ${
                  checked
                    ? 'text-zinc-400 dark:text-zinc-500 line-through'
                    : 'text-zinc-700 dark:text-zinc-200 font-medium'
                }`}
              >
                {item}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const TimerWidget: React.FC<WidgetProps> = ({ habit, completionData, onUpdate }) => {
  const targetSeconds = Math.max(1, (habit.targetValue || 1) * 60);
  const currentElapsed = Math.min(targetSeconds, completionData?.value || 0);
  const initialLeft = Math.max(0, targetSeconds - currentElapsed);
  const [secondsLeft, setSecondsLeft] = useState(initialLeft);
  const [isRunning, setIsRunning] = useState(false);

  const isCompleted = Boolean(completionData?.completed) || secondsLeft === 0;

  useEffect(() => {
    const elapsed = Math.min(targetSeconds, completionData?.value || 0);
    setSecondsLeft(Math.max(0, targetSeconds - elapsed));
  }, [completionData?.value, targetSeconds]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            setIsRunning(false);
            onUpdate({ value: targetSeconds, completed: true });
            confetti({
              particleCount: 50,
              spread: 70,
              origin: { y: 0.7 },
              colors: ['#6366f1', '#f59e0b', '#3b82f6', '#10b981'],
            });
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft, targetSeconds, onUpdate]);

  const handleToggle = () => {
    if (isRunning) {
      setIsRunning(false);
      const elapsed = targetSeconds - secondsLeft;
      onUpdate({ value: elapsed, completed: secondsLeft <= 0 });
    } else {
      if (secondsLeft === 0) {
        setSecondsLeft(targetSeconds);
        onUpdate({ value: 0, completed: false });
        setIsRunning(true);
      } else {
        setIsRunning(true);
      }
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(targetSeconds);
    onUpdate({ value: 0, completed: false });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = Math.min(100, Math.round(((targetSeconds - secondsLeft) / targetSeconds) * 100));

  return (
    <div className="flex flex-col gap-2 mt-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono font-bold tracking-wider text-zinc-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 rounded-lg shadow-xs">
            {formatTime(secondsLeft)}
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            / {habit.targetValue || 1} {habit.unit || 'mins'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            type="button"
            onClick={handleToggle} 
            className={`p-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold px-2.5 ${
              isRunning 
                ? 'bg-amber-500 text-white shadow-xs' 
                : isCompleted
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5"/>
                <span>Pause</span>
              </>
            ) : isCompleted ? (
              <>
                <RotateCcw className="w-3.5 h-3.5"/>
                <span>Restart</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5"/>
                <span>Start</span>
              </>
            )}
          </button>
          <button 
            type="button"
            onClick={handleReset} 
            className="p-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
        <span>{isRunning ? 'Timer running in real-time...' : isCompleted ? 'Completed!' : 'Requires running countdown to complete'}</span>
        <span className="font-semibold">{progressPercent}%</span>
      </div>
    </div>
  );
};


