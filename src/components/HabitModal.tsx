import React, { useState, useEffect } from 'react';
import { Habit, CategoryId, FrequencyType } from '../types';
import { CATEGORY_LIST } from '../utils/categories';
import { X, Sparkles, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Partial<Habit>) => void;
  initialHabit?: Habit | null;
}

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialHabit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('health');
  const [frequency, setFrequency] = useState<FrequencyType>('DAILY');
  const [targetValue, setTargetValue] = useState<number>(1);
  const [unit, setUnit] = useState<string>('times');

  useEffect(() => {
    if (initialHabit) {
      setTitle(initialHabit.title || '');
      setDescription(initialHabit.description || '');
      setCategoryId(initialHabit.categoryId || 'health');
      setFrequency(initialHabit.frequency || 'DAILY');
      setTargetValue(initialHabit.targetValue || 1);
      setUnit(initialHabit.unit || 'times');
    } else {
      setTitle('');
      setDescription('');
      setCategoryId('health');
      setFrequency('DAILY');
      setTargetValue(1);
      setUnit('times');
    }
  }, [initialHabit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: initialHabit?.id,
      title: title.trim(),
      description: description.trim(),
      categoryId,
      frequency,
      targetValue: Number(targetValue) || 1,
      unit: unit.trim() || 'times',
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {initialHabit ? 'Edit Habit' : 'Create New Habit'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Title */}
            <div className="space-y-1.5">
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 text-xs">
                Habit Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Read 20 pages, 30 min Workout, Hydrate..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 text-xs">
                Description / Cue
              </label>
              <input
                type="text"
                placeholder="e.g. Right after morning coffee, at 8:00 AM"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 text-xs">
                Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORY_LIST.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium text-left transition ${
                      categoryId === cat.id
                        ? `${cat.badgeBg} ${cat.badgeText} ${cat.borderColor} ring-1 ring-indigo-500/50`
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency Selector */}
            <div className="space-y-1.5">
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 text-xs">
                Target Frequency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'] as FrequencyType[]).map((freq) => (
                  <button
                    type="button"
                    key={freq}
                    onClick={() => setFrequency(freq)}
                    className={`p-2 rounded-xl border text-xs font-medium capitalize text-center transition ${
                      frequency === freq
                        ? 'bg-indigo-500 text-white border-indigo-500 font-semibold'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    {freq.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Value & Unit */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 text-xs">
                  Daily Goal Amount
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 text-xs">
                  Unit
                </label>
                <input
                  type="text"
                  placeholder="e.g., mins, pages, liters, times"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-5 py-2 rounded-xl text-xs shadow-lg shadow-indigo-500/20 transition"
              >
                <Check className="w-4 h-4" />
                <span>{initialHabit ? 'Save Changes' : 'Create Habit'}</span>
              </button>
            </div>

          </form>
        </motion.div>

      </div>
    </AnimatePresence>
  );
};
