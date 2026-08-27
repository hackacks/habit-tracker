import React, { useState, useEffect } from 'react';
import { Habit, CategoryId, FrequencyType, EvaluationType, PriorityLevel } from '../types';
import { CATEGORY_LIST } from '../utils/categories';
import { X, Sparkles, Check, Plus, Trash2, Calendar, Target, Clock, AlertCircle } from 'lucide-react';

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
  const [priority, setPriority] = useState<PriorityLevel>('DEFAULT');
  
  // Evaluation
  const [evaluationType, setEvaluationType] = useState<EvaluationType>('YES_NO');
  const [targetValue, setTargetValue] = useState<number>(1);
  const [unit, setUnit] = useState<string>('times');
  const [checklistItems, setChecklistItems] = useState<string[]>(['']);
  
  // Advanced Scheduling
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [interval, setInterval] = useState<number>(2);
  const [targetDays, setTargetDays] = useState<number[]>([1,2,3,4,5]); // Mon-Fri default
  const [periodType, setPeriodType] = useState<'WEEK' | 'MONTH'>('WEEK');
  const [targetPerPeriod, setTargetPerPeriod] = useState<number>(3);
  const [weeklyTarget, setWeeklyTarget] = useState<number>(0);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(0);

  useEffect(() => {
    if (initialHabit) {
      setTitle(initialHabit.title || '');
      setDescription(initialHabit.description || '');
      setCategoryId(initialHabit.categoryId || 'health');
      setFrequency(initialHabit.frequency || 'DAILY');
      setPriority(initialHabit.priority || 'DEFAULT');
      setEvaluationType(initialHabit.evaluationType || 'YES_NO');
      setTargetValue(initialHabit.targetValue || 1);
      setUnit(initialHabit.unit || 'times');
      setChecklistItems(initialHabit.checklistItems?.length ? initialHabit.checklistItems : ['']);
      setStartDate(initialHabit.startDate || '');
      setEndDate(initialHabit.endDate || '');
      setInterval(initialHabit.interval || 2);
      setTargetDays(initialHabit.targetDays || [1,2,3,4,5]);
      setPeriodType(initialHabit.periodType || 'WEEK');
      setTargetPerPeriod(initialHabit.targetPerPeriod || 3);
      setWeeklyTarget(initialHabit.weeklyTarget || 0);
      setMonthlyTarget(initialHabit.monthlyTarget || 0);
    } else {
      setTitle('');
      setDescription('');
      setCategoryId('health');
      setFrequency('DAILY');
      setPriority('DEFAULT');
      setEvaluationType('YES_NO');
      setTargetValue(1);
      setUnit('times');
      setChecklistItems(['']);
      setStartDate('');
      setEndDate('');
      setInterval(2);
      setTargetDays([1,2,3,4,5]);
      setPeriodType('WEEK');
      setTargetPerPeriod(3);
      setWeeklyTarget(0);
      setMonthlyTarget(0);
    }
  }, [initialHabit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const cleanedChecklist = Array.from(new Set(checklistItems.map(i => i.trim()).filter(i => i !== '')));

    onSave({
      title: title.trim(),
      description: description.trim(),
      categoryId,
      frequency,
      priority,
      evaluationType,
      targetValue: Number(targetValue) || 1,
      unit: unit.trim() || 'times',
      checklistItems: evaluationType === 'CHECKLIST' ? cleanedChecklist : [],
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      interval: frequency === 'INTERVAL' ? Number(interval) || 2 : undefined,
      targetDays: (frequency === 'SPECIFIC_DAYS' || frequency === 'CUSTOM') ? targetDays : undefined,
      periodType: frequency === 'FLEXIBLE' ? periodType : undefined,
      targetPerPeriod: frequency === 'FLEXIBLE' ? Number(targetPerPeriod) || 1 : undefined,
      weeklyTarget: Number(weeklyTarget) || undefined,
      monthlyTarget: Number(monthlyTarget) || undefined,
    });
    onClose();
  };

  const handleDayToggle = (dayIndex: number) => {
    if (targetDays.includes(dayIndex)) {
      setTargetDays(targetDays.filter(d => d !== dayIndex));
    } else {
      setTargetDays([...targetDays, dayIndex]);
    }
  };

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl my-8 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-10">
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
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
<div className="flex-1 flex flex-col md:flex-row min-h-0 text-xs">
            
            {/* Left Column: Basic Info */}
            <div className="w-full md:w-1/2 p-6 md:overflow-y-auto space-y-4 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800">
                <div className="space-y-1.5">
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 text-xs">Habit Name <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Read 20 pages, 30 min Workout..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 text-xs">Description / Cue</label>
                  <input
                    type="text"
                    placeholder="e.g. Right after morning coffee"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 text-xs">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_LIST.map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategoryId(cat.id)}
                        className={"flex items-center gap-2 p-2 rounded-xl border text-xs font-medium text-left transition " + (
                          categoryId === cat.id
                            ? cat.badgeBg + " " + cat.badgeText + " " + cat.borderColor + " ring-1 ring-indigo-500/50"
                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                        )}
                      >
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 text-xs">Priority</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['LOW', 'DEFAULT', 'HIGH', 'URGENT'] as PriorityLevel[]).map((pri) => (
                      <button
                        type="button"
                        key={pri}
                        onClick={() => setPriority(pri)}
                        className={"p-2 rounded-xl border text-[10px] font-bold capitalize text-center transition " + (
                          priority === pri
                            ? "bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 border-zinc-800 dark:border-white shadow-sm"
                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        )}
                      >
                        {pri.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Tracking & Schedule */}
              <div className="w-full md:w-1/2 p-6 overflow-y-auto space-y-6">
                
                {/* Evaluation Type */}
                <div className="space-y-2">
                  <label className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs flex items-center gap-1.5 mb-2">
                    <Target className="w-4 h-4 text-indigo-400" /> Tracking Method
                  </label>
                  <div className="space-y-3">
                    {[
                      { id: 'YES_NO', title: 'Simple Check-off', description: 'Track simple completion.' },
                      { id: 'NUMERIC', title: 'Target Amount', description: 'Track a target number or amount.' },
                      { id: 'CHECKLIST', title: 'Sub-tasks', description: 'Break your habit down into smaller sub-tasks.' },
                      { id: 'TIMER', title: 'Countdown', description: 'Countdown timer for time-based habits.' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setEvaluationType(opt.id as EvaluationType)}
                        className={"w-full flex items-start gap-3 p-3 text-left border rounded-xl transition-all duration-200 " + (
                          evaluationType === opt.id 
                            ? "bg-indigo-500/10 border-indigo-500/50 dark:bg-indigo-500/20" 
                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                        )}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={"text-xs font-bold " + (evaluationType === opt.id ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-900 dark:text-zinc-100")}>
                              {opt.title}
                            </span>
                            
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            {opt.description}
                          </p>
                        </div>
                        {evaluationType === opt.id && (
                          <div className="flex-shrink-0 mt-1 text-indigo-500">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>



                  {evaluationType === 'CHECKLIST' && (
                    <div className="space-y-2 mt-2">
                      {checklistItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Sub-task name"
                            value={item}
                            onChange={(e) => {
                              const newItems = [...checklistItems];
                              newItems[idx] = e.target.value;
                              setChecklistItems(newItems);
                            }}
                            className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = checklistItems.filter((_, i) => i !== idx);
                              if (newItems.length === 0) newItems.push('');
                              setChecklistItems(newItems);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setChecklistItems([...checklistItems, ''])}
                        className="text-[10px] flex items-center gap-1 font-medium text-indigo-500 hover:text-indigo-600"
                      >
                        <Plus className="w-3 h-3" /> Add Item
                      </button>
                    </div>
                  )}
                </div>

                {/* Scheduling */}
                <div className="space-y-3 pt-2">
                  <label className="font-semibold text-zinc-900 dark:text-zinc-100 text-[11px] mb-2 block">
                    How Often?
                  </label>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {['DAILY', 'WEEKLY', 'MONTHLY'].map(freq => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setFrequency(freq as FrequencyType)}
                        className={"px-3 py-2.5 rounded-[1.25rem] text-xs font-semibold transition-all border " + (
                          frequency === freq
                            ? "bg-indigo-500 border-indigo-500 text-white shadow-sm dark:bg-indigo-600 dark:border-indigo-600"
                            : "bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
                        )}
                      >
                        {freq.charAt(0) + freq.slice(1).toLowerCase()}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFrequency('CUSTOM')}
                      className={"px-3 py-2.5 col-span-1 rounded-[1.25rem] text-xs font-semibold transition-all border " + (
                        ['CUSTOM', 'SPECIFIC_DAYS', 'INTERVAL', 'FLEXIBLE'].includes(frequency)
                          ? "bg-indigo-500 border-indigo-500 text-white shadow-sm dark:bg-indigo-600 dark:border-indigo-600"
                          : "bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
                      )}
                    >
                      Custom
                    </button>
                  </div>

                  {/* Advanced custom options if Custom is selected */}
                  {['CUSTOM', 'SPECIFIC_DAYS', 'INTERVAL', 'FLEXIBLE'].includes(frequency) && (
                    <div className="mt-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
                      <select
                        value={frequency === 'CUSTOM' ? 'SPECIFIC_DAYS' : frequency}
                        onChange={(e) => setFrequency(e.target.value as FrequencyType)}
                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-indigo-500 transition"
                      >
                        <option value="SPECIFIC_DAYS">Specific Days of Week</option>
                        <option value="INTERVAL">Repeating Interval (Every N Days)</option>
                        <option value="FLEXIBLE">Flexible (X times per period)</option>
                      </select>
                    </div>
                  )}

                  {(frequency === 'SPECIFIC_DAYS' || frequency === 'CUSTOM') && (
                    <div className="flex justify-between gap-1 pt-1">
                      {dayNames.map((d, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleDayToggle(i)}
                          className={"w-7 h-7 sm:w-8 sm:h-8 rounded-full text-[10px] font-bold transition-all " + (
                            targetDays.includes(i)
                              ? "bg-emerald-500 text-white shadow-md"
                              : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:border-emerald-300"
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  )}

                  {frequency === 'INTERVAL' && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-zinc-500">Repeat every</span>
                      <input
                        type="number"
                        min="2"
                        value={interval}
                        onChange={(e) => setInterval(Number(e.target.value))}
                        className="w-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs text-center text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[11px] text-zinc-500">days</span>
                    </div>
                  )}

                  {frequency === 'FLEXIBLE' && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-zinc-500">Target</span>
                      <input
                        type="number"
                        min="1"
                        value={targetPerPeriod}
                        onChange={(e) => setTargetPerPeriod(Number(e.target.value))}
                        className="w-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs text-center text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[11px] text-zinc-500">times per</span>
                      <select
                        value={periodType}
                        onChange={(e) => setPeriodType(e.target.value as 'WEEK' | 'MONTH')}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="WEEK">Week</option>
                        <option value="MONTH">Month</option>
                      </select>
                    </div>
                  )}

                  
                  {/* Goal Amount & Unit (Always visible, adapt based on tracking) */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-200 dark:border-zinc-700/50 mt-3">
                    <div>
                      <label className="block font-medium text-zinc-700 dark:text-zinc-300 text-[11px] mb-1.5">Daily Goal Amount</label>
                      <input
                        type="number"
                        min="1"
                        value={targetValue}
                        onChange={(e) => setTargetValue(Number(e.target.value))}
                        className="w-full bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-zinc-700 dark:text-zinc-300 text-[11px] mb-1.5">Unit</label>
                      <input
                        type="text"
                        placeholder="e.g. mins, pages, times"
                        value={evaluationType === 'TIMER' ? 'mins' : unit}
                        onChange={(e) => evaluationType !== 'TIMER' && setUnit(e.target.value)}
                        disabled={evaluationType === 'TIMER'}
                        className="w-full bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-700/50 mt-3">
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">Start Date (Optional)</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">End Date (Optional)</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
            {/* Modal Actions */}
            <div className="flex-shrink-0 flex items-center justify-end gap-3 p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition"
              >
                <Check className="w-4 h-4" />
                <span>{initialHabit ? 'Save Changes' : 'Create Habit'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
};
