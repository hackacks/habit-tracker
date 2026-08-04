export type CategoryId = 'health' | 'fitness' | 'mindset' | 'work' | 'finance' | 'personal';

export interface Category {
  id: CategoryId;
  name: string;
  color: string; // Tailwind color class or hex
  bgLight: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  iconName: string;
}

export type FrequencyType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  categoryId: CategoryId;
  frequency: FrequencyType;
  targetDays?: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  targetValue?: number; // e.g., 8 (glasses of water), 30 (mins)
  unit?: string; // e.g., "mins", "pages", "liters", "times"
  createdAt: string; // ISO date string YYYY-MM-DD
  archived?: boolean;
  color?: string;
  // History is a map of date string (YYYY-MM-DD) to completion status or completed value
  completions: Record<string, HabitCompletion>; 
}

export interface HabitCompletion {
  completed: boolean;
  value?: number;
  timestamp: string; // ISO timestamp string
  notes?: string;
}

export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  completionRate30Days: number;
  last30DaysHistory: boolean[]; // array of 30 booleans
}

export type ViewTab = 'today' | 'heatmap' | 'analytics' | 'manage' | 'prd';

export type FilterCategory = 'all' | CategoryId;
