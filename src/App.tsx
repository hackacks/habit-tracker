/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Habit, ViewTab, FilterCategory, HabitCompletion } from './types';
import { getTodayStr, calculateHabitStats } from './utils/habitUtils';
import { api } from './api';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { HabitList } from './components/HabitList';
import { HeatmapView } from './components/HeatmapView';
import { AnalyticsView } from './components/AnalyticsView';
import { PrdDoc } from './components/PrdDoc';
import { HabitModal } from './components/HabitModal';
import { DataManagementModal } from './components/DataManagementModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Auth } from './components/Auth';
import { ProfileModal } from './components/ProfileModal';
import { userPool } from './lib/cognito';
import { Github } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  // View state
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [activeTab, setActiveTab] = useState<ViewTab>('today');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Check auth initially
  useEffect(() => {
    const user = userPool.getCurrentUser();
    if (user) {
      user.getSession((err: any, session: any) => {
        if (!err && session.isValid()) {
          setIsAuthenticated(true);
        }
        setIsAuthChecking(false);
      });
    } else {
      setIsAuthChecking(false);
    }
  }, []);

  useEffect(() => {
    async function loadHabits() {
      if (!isAuthenticated) return;
      try {
        const data = await api.getHabits();
        setHabits(data);
      } catch (e) {
        console.error('Failed to fetch habits:', e);
      } finally {
        setLoading(false);
      }
    }
    loadHabits();
  }, [isAuthenticated]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [confirmDeleteHabitId, setConfirmDeleteHabitId] = useState<string | null>(null);
  const [pastDateAction, setPastDateAction] = useState<{ habitId: string, dateStr: string, updateData?: Partial<HabitCompletion> } | null>(null);

  const processToggleCompletion = async (habitId: string, dateStr: string, updateData?: Partial<HabitCompletion>) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    // Countdown habit cannot be filled/marked complete without completing and running the timer
    if (habit.evaluationType === 'TIMER' && !updateData) {
      const existing = habit.completions?.[dateStr];
      if (!existing || !existing.completed) {
        return;
      }
    }

    const existing = habit.completions?.[dateStr];
    let completionData: any = null;

    if (updateData) {
      completionData = {
        ...existing,
        ...updateData,
        timestamp: new Date().toISOString(),
      };
    } else {
      if (existing && existing.completed) {
        completionData = {
          ...existing,
          completed: false,
          value: 0,
          timestamp: new Date().toISOString(),
        };
      } else {
        completionData = {
          completed: true,
          value: habit.targetValue || 1,
          timestamp: new Date().toISOString(),
        };
      }
    }

    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        return {
          ...h,
          completions: {
            ...h.completions,
            [dateStr]: completionData,
          },
        };
      })
    );

    try {
      if (completionData) {
        await api.toggleCompletion(habitId, dateStr, completionData);
      }
    } catch (e) {
      console.error('Failed to toggle completion on server:', e);
      // Revert state if failed (optional, simplified here)
    }
  };

  // Toggle habit completion for a given date
  const handleToggleCompletion = async (habitId: string, dateStr: string, updateData?: Partial<HabitCompletion>) => {
    if (dateStr < getTodayStr()) {
      setPastDateAction({ habitId, dateStr, updateData });
      return;
    }
    await processToggleCompletion(habitId, dateStr, updateData);
  };

  // Create or update habit
  const handleSaveHabit = async (habitData: Partial<Habit>) => {
    try {
      if (habitData.id) {
        // Edit existing
        const updated = await api.updateHabit(habitData.id, habitData);
        setHabits((prev) =>
          prev.map((h) => (h.id === updated.id ? { ...h, ...updated, completions: h.completions } : h))
        );
      } else {
        // Create new
        const newHabit = await api.createHabit(habitData);
        setHabits((prev) => [{ ...newHabit, completions: {} }, ...prev]);
      }
    } catch (e) {
      console.error('Failed to save habit:', e);
    }
    setEditingHabit(null);
  };

  // Delete habit
  const handleDeleteHabit = (habitId: string) => {
    setConfirmDeleteHabitId(habitId);
  };

  const confirmDeleteHabit = async () => {
    if (!confirmDeleteHabitId) return;
    try {
      await api.deleteHabit(confirmDeleteHabitId);
      setHabits((prev) => prev.filter((h) => h.id !== confirmDeleteHabitId));
    } catch (e) {
      console.error('Failed to delete habit:', e);
    }
    setConfirmDeleteHabitId(null);
  };

  const handleUpdateHabitsFromImport = async () => {
    try {
      const data = await api.getHabits();
      setHabits(data);
    } catch(e) {
      console.error(e);
    }
  };

  // Compute master total streak across all active habits
  const totalStreak = React.useMemo(() => {
    let maxS = 0;
    habits.forEach((h) => {
      const stats = calculateHabitStats(h, selectedDate);
      if (stats.currentStreak > maxS) {
        maxS = stats.currentStreak;
      }
    });
    return maxS;
  }, [habits, selectedDate]);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const handleLogout = () => {
    const user = userPool.getCurrentUser();
    if (user) {
      user.signOut();
    }
    setIsAuthenticated(false);
    setHabits([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
      
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        totalStreak={totalStreak}
        openAddModal={() => {
          setEditingHabit(null);
          setIsAddModalOpen(true);
        }}
        openDataModal={() => setIsDataModalOpen(true)}
        openProfileModal={() => setIsProfileModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'today' && (
          <div className="space-y-6">
            <StatsOverview habits={habits} selectedDate={selectedDate} />
            <HabitList
              habits={habits}
              selectedDate={selectedDate}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              searchQuery={searchQuery}
              onToggleCompletion={handleToggleCompletion}
              onEditHabit={(h) => {
                setEditingHabit(h);
                setIsAddModalOpen(true);
              }}
              onDeleteHabit={handleDeleteHabit}
              openAddModal={() => {
                setEditingHabit(null);
                setIsAddModalOpen(true);
              }}
            />
          </div>
        )}

        {activeTab === 'heatmap' && (
          <HeatmapView habits={habits} onToggleCompletion={handleToggleCompletion} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView habits={habits} selectedDate={selectedDate} />
        )}

        {activeTab === 'prd' && <PrdDoc />}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-6 px-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5">
            @ {new Date().getFullYear()} Habit Flow
            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
            <a 
              href="https://github.com/hackacks/habit-tracker" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              Source Code
            </a>
          </p>
          <div className="flex items-center gap-4 text-zinc-600 font-medium">
            <button onClick={() => setActiveTab('today')} className="hover:text-zinc-900 dark:hover:text-zinc-50">Dashboard</button>
            <button onClick={() => setActiveTab('heatmap')} className="hover:text-zinc-900 dark:hover:text-zinc-50">Heatmap Grid</button>
            <button onClick={() => setActiveTab('analytics')} className="hover:text-zinc-900 dark:hover:text-zinc-50">Analytics</button>
            <button onClick={() => setActiveTab('prd')} className="hover:text-zinc-900 dark:hover:text-zinc-50">PRD Specs</button>
          </div>
        </div>
      </footer>

      {/* Add / Edit Habit Modal */}
      <HabitModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        initialHabit={editingHabit}
      />

      {/* Data Management & Backup Modal */}
      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        habits={habits}
        onUpdateHabits={handleUpdateHabitsFromImport}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onLogout={handleLogout}
        habitCount={habits.length}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteHabitId}
        title="Delete Habit"
        message="Are you sure you want to delete this habit and its history?"
        confirmLabel="Delete Habit"
        isDestructive={true}
        onConfirm={confirmDeleteHabit}
        onCancel={() => setConfirmDeleteHabitId(null)}
      />

      <ConfirmModal
        isOpen={!!pastDateAction}
        title="Edit Past Habit"
        message="Are you sure you want to modify a habit on a past date?"
        confirmLabel="Confirm"
        onConfirm={() => {
          if (pastDateAction) {
            processToggleCompletion(pastDateAction.habitId, pastDateAction.dateStr, pastDateAction.updateData);
            setPastDateAction(null);
          }
        }}
        onCancel={() => setPastDateAction(null)}
      />
    </div>
  );
}
