import React from 'react';
import { Habit, CategoryId, FilterCategory } from '../types';
import { CATEGORY_LIST } from '../utils/categories';
import { HabitCard } from './HabitCard';
import { Sparkles, Plus, Filter, CheckCircle2, Circle } from 'lucide-react';

interface HabitListProps {
  habits: Habit[];
  selectedDate: string;
  selectedCategory: FilterCategory;
  setSelectedCategory: (cat: FilterCategory) => void;
  statusFilter: 'all' | 'pending' | 'completed';
  setStatusFilter: (filter: 'all' | 'pending' | 'completed') => void;
  searchQuery: string;
  onToggleCompletion: (habitId: string, dateStr: string, updateData?: any) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  openAddModal: () => void;
}

export const HabitList: React.FC<HabitListProps> = ({
  habits,
  selectedDate,
  selectedCategory,
  setSelectedCategory,
  statusFilter,
  setStatusFilter,
  searchQuery,
  onToggleCompletion,
  onEditHabit,
  onDeleteHabit,
  openAddModal,
}) => {
  // Filter habits
  const filteredHabits = habits.filter((h) => {
    // Category filter
    if (selectedCategory !== 'all' && h.categoryId !== selectedCategory) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = h.title.toLowerCase().includes(q);
      const matchDesc = h.description?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDesc) return false;
    }
    // Completion status filter
    const isDone = Boolean(h.completions && h.completions[selectedDate]?.completed);
    if (statusFilter === 'pending' && isDone) return false;
    if (statusFilter === 'completed' && !isDone) return false;

    return true;
  });

  const priorityScore: Record<string, number> = {
    URGENT: 4,
    HIGH: 3,
    DEFAULT: 2,
    LOW: 1
  };

  filteredHabits.sort((a, b) => {
    const scoreA = priorityScore[a.priority || 'DEFAULT'] || 2;
    const scoreB = priorityScore[b.priority || 'DEFAULT'] || 2;
    return scoreB - scoreA;
  });

  return (
    <div className="space-y-6">
      
      {/* Category & Status Filters Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 lg:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-xs dark:shadow-md dark:shadow-indigo-500/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            All Categories ({habits.length})
          </button>

          {CATEGORY_LIST.map((cat) => {
            const count = habits.filter((h) => h.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? `${cat.badgeBg} ${cat.badgeText} border ${cat.borderColor} shadow-xs font-bold`
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[10px] font-mono opacity-85">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Status Filter Tabs (All / Pending / Done) */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 self-end lg:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-zinc-200 text-zinc-900 dark:text-zinc-900 shadow-xs font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition ${
              statusFilter === 'pending'
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 font-bold shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Circle className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span>Pending</span>
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition ${
              statusFilter === 'completed'
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-bold shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Completed</span>
          </button>
        </div>

      </div>

      {/* Habit Items Grid (Masonry Layout) */}
      {filteredHabits.length > 0 ? (
        <div className="columns-1 md:columns-2 xl:columns-3 gap-4">
          {filteredHabits.map((habit) => (
            <div key={habit.id} className="break-inside-avoid inline-block w-full mb-4 transition-all duration-200">
              <HabitCard
                habit={habit}
                selectedDate={selectedDate}
                onToggleCompletion={onToggleCompletion}
                onEditHabit={onEditHabit}
                onDeleteHabit={onDeleteHabit}
              />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 text-indigo-400">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 mb-1">
            No habits found
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-6">
            {searchQuery
              ? `No habits matching "${searchQuery}" in this view.`
              : 'Start building positive daily consistency by creating your first habit.'}
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2 rounded-xl text-xs shadow-lg shadow-indigo-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Habit</span>
          </button>
        </div>
      )}

    </div>
  );
};
