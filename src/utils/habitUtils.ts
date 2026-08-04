import { Habit, HabitCompletion, HabitStats, FrequencyType } from '../types';

/**
 * Get today's date string in UTC (YYYY-MM-DD)
 */
export function getTodayStr(): string {
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get a date string offset by a certain number of days
 */
export function getOffsetDateStr(offsetDays: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date string YYYY-MM-DD to readable format e.g. "Monday, Jul 29" in UTC
 */
export function parseDateStr(dateStr: string | undefined | null): [number, number, number] | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return [year, month, day];
}

export function formatDisplayDate(dateStr: string | undefined | null): string {
  const parts = parseDateStr(dateStr);
  if (!parts) return '';
  const [year, month, day] = parts;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Returns day name e.g., "Mon" in UTC
 */
export function getDayName(dateStr: string | undefined | null): string {
  const parts = parseDateStr(dateStr);
  if (!parts) return '';
  const [year, month, day] = parts;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short' });
}

/**
 * Check if date falls on a target frequency in UTC
 */
export function isHabitScheduledForDate(habit: Habit | undefined | null, dateStr: string | undefined | null): boolean {
  if (!habit) return false;
  const parts = parseDateStr(dateStr);
  if (!parts) return false;
  const [year, month, day] = parts;
  
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = date.getUTCDay(); // 0 = Sun, 1 = Mon, ...
  
  if (habit.frequency === 'DAILY') return true;
  // Previously WEEKLY (weekdays) was Mon-Fri, CUSTOM (weekends) was Sat-Sun in sample code.
  if (habit.frequency === 'WEEKLY') return dayOfWeek >= 1 && dayOfWeek <= 5;
  if (habit.frequency === 'MONTHLY') return dayOfWeek === 1; // Arbitrary for monthly
  if (habit.frequency === 'CUSTOM') {
    if (!habit.targetDays || !Array.isArray(habit.targetDays) || habit.targetDays.length === 0) {
      return false; // Edge case: custom frequency with no target days scheduled
    }
    return habit.targetDays.includes(dayOfWeek);
  }
  
  return true;
}

/**
 * Shift a date string by offset days in UTC
 */
export function shiftDateStr(baseDateStr: string | undefined | null, offsetDays: number): string {
  const parts = parseDateStr(baseDateStr);
  if (!parts) return getTodayStr(); // Fallback if invalid base date
  const [year, month, day] = parts;
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + offsetDays);
  const newYear = date.getUTCFullYear();
  const newMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
  const newDay = String(date.getUTCDate()).padStart(2, '0');
  return `${newYear}-${newMonth}-${newDay}`;
}

export function calculateHabitStats(habit: Habit | undefined | null, referenceDateStr: string = getTodayStr()): HabitStats {
  if (!habit) {
    return { currentStreak: 0, bestStreak: 0, totalCompletions: 0, completionRate30Days: 0, last30DaysHistory: [] };
  }
  const completions = habit.completions || {};

  let currentStreak = 0;
  let bestStreak = 0;
  let totalCompletions = 0;

  // Total completions count
  Object.values(completions).forEach((c) => {
    if (c && c.completed) totalCompletions++;
  });

  // Calculate current streak
  let currOffset = 0;
  let isFirstScheduledDay = true;
  
  while (currOffset >= -365) {
    const dStr = shiftDateStr(referenceDateStr, currOffset);
    if (isHabitScheduledForDate(habit, dStr)) {
      if (completions[dStr]?.completed) {
        currentStreak++;
        isFirstScheduledDay = false;
      } else {
        if (currOffset === 0 && isFirstScheduledDay) {
          // Today is scheduled but not completed yet. It does not break the streak.
          isFirstScheduledDay = false;
        } else {
          // Found a missed scheduled day in the past. Streak breaks.
          break;
        }
      }
    }
    currOffset--;
  }

  // Calculate best streak over the past 365 days
  let tempStreak = 0;
  for (let offset = -365; offset <= 0; offset++) {
    const dStr = shiftDateStr(referenceDateStr, offset);
    if (isHabitScheduledForDate(habit, dStr)) {
      if (completions[dStr]?.completed) {
        tempStreak++;
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }
  }
  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
  }

  // Last 30 days array
  const last30DaysHistory: boolean[] = [];
  let completedCount30 = 0;
  let scheduledCount30 = 0;

  for (let i = 29; i >= 0; i--) {
    const dStr = shiftDateStr(referenceDateStr, -i);
    const isScheduled = isHabitScheduledForDate(habit, dStr);
    const isDone = Boolean(completions[dStr]?.completed);
    
    last30DaysHistory.push(isDone);
    
    if (isScheduled) {
      scheduledCount30++;
      if (isDone) completedCount30++;
    }
  }

  const completionRate30Days = scheduledCount30 > 0 ? Math.round((completedCount30 / scheduledCount30) * 100) : 0;

  return {
    currentStreak,
    bestStreak,
    totalCompletions,
    completionRate30Days,
    last30DaysHistory,
  };
}

/**
 * Generate rich, realistic initial sample habits for first-time usage
 */
export function getInitialSampleHabits(): Habit[] {
  const today = getTodayStr();
  const sampleHabits: Habit[] = [
    {
      id: 'h-1',
      title: 'Morning Mindfulness & Meditation',
      description: '10 minutes of diaphragmatic breathing and gratitude journaling',
      categoryId: 'mindset',
      frequency: 'DAILY',
      targetValue: 10,
      unit: 'mins',
      createdAt: getOffsetDateStr(-60),
      completions: {},
    },
    {
      id: 'h-2',
      title: '30-Min Workout or Run',
      description: 'High intensity cardio, resistance training, or zone 2 running',
      categoryId: 'fitness',
      frequency: 'WEEKLY',
      targetValue: 30,
      unit: 'mins',
      createdAt: getOffsetDateStr(-45),
      completions: {},
    },
    {
      id: 'h-3',
      title: 'Hydrate 2.5 Liters of Water',
      description: 'Drink fresh water with electrolytes throughout the day',
      categoryId: 'health',
      frequency: 'DAILY',
      targetValue: 2.5,
      unit: 'liters',
      createdAt: getOffsetDateStr(-90),
      completions: {},
    },
    {
      id: 'h-4',
      title: 'Deep Work Focus Block',
      description: '90 minutes of distraction-free single-task execution',
      categoryId: 'work',
      frequency: 'WEEKLY',
      targetValue: 90,
      unit: 'mins',
      createdAt: getOffsetDateStr(-30),
      completions: {},
    },
    {
      id: 'h-5',
      title: 'Track Daily Expense & Savings',
      description: 'Log daily expenditures and review weekly financial targets',
      categoryId: 'finance',
      frequency: 'DAILY',
      targetValue: 1,
      unit: 'log',
      createdAt: getOffsetDateStr(-20),
      completions: {},
    },
    {
      id: 'h-6',
      title: 'Read 20 Pages of Non-Fiction',
      description: 'Expand knowledge with books on philosophy, technology, or design',
      categoryId: 'personal',
      frequency: 'DAILY',
      targetValue: 20,
      unit: 'pages',
      createdAt: getOffsetDateStr(-40),
      completions: {},
    },
  ];

  // Populate history with high completion rates over the past 45 days
  sampleHabits.forEach((habit, hIdx) => {
    // Generate completions pattern with a solid streak leading to today
    for (let offset = -45; offset <= 0; offset++) {
      const dStr = getOffsetDateStr(offset);
      if (isHabitScheduledForDate(habit, dStr)) {
        // High probability of completion, e.g. 85-95%
        const seed = (Math.abs(offset) * 17 + hIdx * 23) % 100;
        // Keep last 12 days 100% completed for active streaks!
        const isDone = offset >= -12 || seed > 18;
        if (isDone) {
          habit.completions[dStr] = {
            completed: true,
            value: habit.targetValue || 1,
            timestamp: new Date(Date.now() + offset * 86400000).toISOString(),
          };
        }
      }
    }
  });

  return sampleHabits;
}
