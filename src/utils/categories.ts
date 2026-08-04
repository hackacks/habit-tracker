import { Category, CategoryId } from '../types';

export const CATEGORIES: Record<CategoryId, Category> = {
  health: {
    id: 'health',
    name: 'Health & Hydration',
    color: '#10b981', // emerald-500
    bgLight: 'bg-emerald-500/10',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    iconName: 'HeartPulse',
  },
  fitness: {
    id: 'fitness',
    name: 'Fitness & Movement',
    color: '#f43f5e', // rose-500
    bgLight: 'bg-rose-500/10',
    badgeBg: 'bg-rose-500/15',
    badgeText: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    iconName: 'Dumbbell',
  },
  mindset: {
    id: 'mindset',
    name: 'Mindset & Mindfulness',
    color: '#a855f7', // purple-500
    bgLight: 'bg-purple-500/10',
    badgeBg: 'bg-purple-500/15',
    badgeText: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    iconName: 'Brain',
  },
  work: {
    id: 'work',
    name: 'Productivity & Work',
    color: '#3b82f6', // blue-500
    bgLight: 'bg-blue-500/10',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    iconName: 'Briefcase',
  },
  finance: {
    id: 'finance',
    name: 'Finance & Growth',
    color: '#f59e0b', // amber-500
    bgLight: 'bg-amber-500/10',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    iconName: 'Coins',
  },
  personal: {
    id: 'personal',
    name: 'Personal & Routine',
    color: '#06b6d4', // cyan-500
    bgLight: 'bg-cyan-500/10',
    badgeBg: 'bg-cyan-500/15',
    badgeText: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    iconName: 'Sparkles',
  },
};

export const CATEGORY_LIST: Category[] = Object.values(CATEGORIES);
