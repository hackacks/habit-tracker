import React from 'react';
import { ViewTab } from '../types';
import { 
  Flame, 
  Plus, 
  LayoutDashboard, 
  Grid3X3, 
  BarChart3, 
  FileText, 
  Database, 
  User,
  Calendar,
  Search
} from 'lucide-react';
import { formatDisplayDate, getTodayStr } from '../utils/habitUtils';

interface HeaderProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  totalStreak: number;
  openAddModal: () => void;
  openDataModal: () => void;
  openProfileModal: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedDate,
  setSelectedDate,
  totalStreak,
  openAddModal,
  openDataModal,
  openProfileModal,
  searchQuery,
  setSearchQuery,
}) => {
  const isToday = selectedDate === getTodayStr();

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Flame Badge */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-zinc-200 dark:border-zinc-800 bg-zinc-900">
              <img src="/favicon.ico" alt="Habit Flow Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  Habit Flow
                </h1>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">Sleek habits & consistency tracker</p>
            </div>
          </div>

          {/* Streak Flame Badge */}
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 px-3 py-1.5 rounded-xl shadow-xs">
            <Flame className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-500/20" />
            <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{totalStreak}</span> Day Streak
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-zinc-100/80 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'today'
                ? 'bg-white dark:bg-indigo-500 text-indigo-600 dark:text-white shadow-xs dark:shadow-md dark:shadow-indigo-500/20 font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-white/60 dark:hover:bg-zinc-800/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Today</span>
          </button>

          <button
            onClick={() => setActiveTab('heatmap')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'heatmap'
                ? 'bg-white dark:bg-indigo-500 text-indigo-600 dark:text-white shadow-xs dark:shadow-md dark:shadow-indigo-500/20 font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-white/60 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Consistency Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-indigo-500 text-indigo-600 dark:text-white shadow-xs dark:shadow-md dark:shadow-indigo-500/20 font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-white/60 dark:hover:bg-zinc-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('prd')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'prd'
                ? 'bg-white dark:bg-indigo-500 text-indigo-600 dark:text-white shadow-xs dark:shadow-md dark:shadow-indigo-500/20 font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-white/60 dark:hover:bg-zinc-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PRD & Specs</span>
          </button>
        </nav>

        {/* Right Action Controls: Search, Date Picker, Add & Data */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Quick Search */}
          <div className="relative hidden lg:block w-44">
            <Search className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Date Picker Button */}
          {activeTab === 'today' && (
            <div className="relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 shadow-xs">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-600 dark:text-indigo-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-zinc-800 dark:text-zinc-200 focus:outline-none text-xs cursor-pointer font-semibold"
              />
              {!isToday && (
                <button
                  onClick={() => setSelectedDate(getTodayStr())}
                  className="ml-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  Today
                </button>
              )}
            </div>
          )}

          {/* Data Backup / Settings */}
          <button
            onClick={openDataModal}
            title="Backup & Manage Data"
            className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-xl transition"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Profile */}
          <button
            onClick={openProfileModal}
            title="User Profile"
            className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 rounded-xl transition"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Add Habit CTA */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2 rounded-xl text-xs shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Habit</span>
          </button>
        </div>

      </div>
    </header>
  );
};
