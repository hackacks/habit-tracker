import React from 'react';
import { FileText, UserCheck, CheckCircle, Database, Palette, Zap, Sparkles, Layers } from 'lucide-react';

export const PrdDoc: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Title Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3 mb-2 text-indigo-400 font-semibold text-xs uppercase tracking-widest">
          <Sparkles className="w-4 h-4" /> Product & Design Specifications
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-3">
          Atomic Habit Tracker Blueprint & PRD
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
          An end-to-end product architecture specification detailing value proposition, target user personas, feature prioritization matrix, data schema, and Sleek Interface design tokens.
        </p>
      </div>

      {/* 1. PRD Executive Summary & Value Prop */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800 text-indigo-400 font-bold text-base">
          <FileText className="w-5 h-5" />
          <h2>1. Executive Summary & Value Proposition</h2>
        </div>
        <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-3">
          <p>
            <strong>Core Mission:</strong> To bridge the gap between intention and long-term execution through friction-free micro-logging, automated streak calculations, visual consistency heatmaps, and instant positive visual feedback loops.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <strong className="text-emerald-400 block mb-1">Low Friction</strong>
              One-tap completion toggles with sub-10ms UI update speed and instant local persistence.
            </div>
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <strong className="text-indigo-400 block mb-1">Streak Momentum</strong>
              Automated current and best streak logic that forgives scheduled off-days without breaking momentum.
            </div>
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <strong className="text-indigo-400 block mb-1">Visual Heatmaps</strong>
              GitHub-style 90/180/365-day calendar grid to celebrate visual progress over time.
            </div>
          </div>
        </div>
      </section>

      {/* 2. Target Personas & Key User Flows */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800 text-indigo-400 font-bold text-base">
          <UserCheck className="w-5 h-5" />
          <h2>2. Target Personas & Core User Flows</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm text-indigo-400">Persona A: Alex (The High-Performing Builder)</h3>
            <p className="text-zinc-500 dark:text-zinc-400">
              Needs structured routines for deep work, physical training, and mindfulness. Evaluates progress visually through weekly/monthly consistency ratios.
            </p>
            <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300 space-y-1 pt-1">
              <li>Flow: Opens dashboard in morning → Toggles completed habits → Checks flame streak.</li>
              <li>Flow: Inspects monthly heatmap to spot gaps in routine.</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm text-emerald-400">Persona B: Maya (The Wellness Seeker)</h3>
            <p className="text-zinc-500 dark:text-zinc-400">
              Wants to build healthy daily wellness micro-habits like hydration, reading, and financial logging without feeling overwhelmed by complex tools.
            </p>
            <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300 space-y-1 pt-1">
              <li>Flow: Quick categorization (Health, Fitness, Finance).</li>
              <li>Flow: Simple single-click check-ins with celebratory visual feedback.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Feature Prioritization Matrix */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800 text-emerald-400 font-bold text-base">
          <CheckCircle className="w-5 h-5" />
          <h2>3. Feature Prioritization Matrix (MVP vs Post-MVP)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-emerald-500/30 space-y-2">
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              MVP Deliverables (Completed)
            </span>
            <ul className="space-y-1.5 text-zinc-700 dark:text-zinc-300 pt-2">
              <li className="flex items-center gap-2">✓ Today's Habit Dashboard with micro-spring toggle animations</li>
              <li className="flex items-center gap-2">✓ Automated streak calculation (Current & Best)</li>
              <li className="flex items-center gap-2">✓ Full CRUD Modal for Habits (Title, Desc, Category, Frequency)</li>
              <li className="flex items-center gap-2">✓ Category Filtering (Health, Fitness, Mindset, Work, Finance, Personal)</li>
              <li className="flex items-center gap-2">✓ Interactive GitHub-style Heatmap Grid (90/180/365 Days)</li>
              <li className="flex items-center gap-2">✓ Local Storage Persistence + Demo Data Reset / JSON Backup</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2 opacity-80">
            <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              Post-MVP Horizon
            </span>
            <ul className="space-y-1.5 text-zinc-500 dark:text-zinc-400 pt-2">
              <li className="flex items-center gap-2">○ Cloud Sync (Firebase/PostgreSQL multi-device persistence)</li>
              <li className="flex items-center gap-2">○ Push Notifications / Browser Web Push reminders</li>
              <li className="flex items-center gap-2">○ Friend leaderboard & social accountability challenges</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Data Schema */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800 text-indigo-400 font-bold text-base">
          <Database className="w-5 h-5" />
          <h2>4. Data Schema (TypeScript Definition)</h2>
        </div>
        <pre className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl text-[11px] font-mono text-indigo-300 overflow-x-auto">
{`interface Habit {
  id: string;                      // Unique UUID (e.g. "h-1")
  title: string;                   // Title e.g. "Morning Meditation"
  description?: string;            // Cue / reminder context
  categoryId: CategoryId;          // 'health' | 'fitness' | 'mindset' | 'work' | 'finance' | 'personal'
  frequency: FrequencyType;        // 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'
  targetValue?: number;            // Daily target e.g. 30
  unit?: string;                   // Unit e.g. "mins", "pages", "liters"
  createdAt: string;               // ISO date YYYY-MM-DD
  completions: Record<string, {   // Keyed by date YYYY-MM-DD
    completed: boolean;
    timestamp: string;             // ISO timestamp
    notes?: string;
  }>;
}`}
        </pre>
      </section>

      {/* 5. UI/UX Design System */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800 text-indigo-400 font-bold text-base">
          <Palette className="w-5 h-5" />
          <h2>5. UI/UX Design System & Theme Specifications</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <h3 className="font-bold text-zinc-800 dark:text-zinc-200">Color Palette Tokens (Sleek Interface)</h3>
            <ul className="space-y-1.5 text-zinc-700 dark:text-zinc-300">
              <li className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-800">
                <span>Canvas Background</span>
                <span className="font-mono text-zinc-500 dark:text-zinc-400">bg-white dark:bg-zinc-900</span>
              </li>
              <li className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-800">
                <span>Cards & Containers</span>
                <span className="font-mono text-zinc-500 dark:text-zinc-400">bg-white dark:bg-zinc-900</span>
              </li>
              <li className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-800">
                <span>Primary Accent</span>
                <span className="font-mono text-indigo-400">#6366f1 (Indigo-500)</span>
              </li>
              <li className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-800">
                <span>Success Completion</span>
                <span className="font-mono text-emerald-400">#10b981 (Emerald-500)</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-zinc-800 dark:text-zinc-200">Micro-Interactions</h3>
            <ul className="space-y-1.5 text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <li>• <strong>Spring Animations:</strong> Checkbox toggles utilize stiffness: 400, damping: 25 spring curves.</li>
              <li>• <strong>Confetti Burst:</strong> Canvas confetti triggers on daily check-ins to create dopamine loops.</li>
              <li>• <strong>Smooth Hover States:</strong> Scale-up transform (1.25x) on heatmap grid cells with detailed tooltip popovers.</li>
            </ul>
          </div>
        </div>
      </section>

    </div>
  );
};
