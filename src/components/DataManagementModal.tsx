import React, { useRef, useState } from 'react';
import { Habit } from '../types';
import { getInitialSampleHabits } from '../utils/habitUtils';
import { Database, Download, Upload, RefreshCw, Trash2, X, Check } from 'lucide-react';
import { api } from '../api';
import { ConfirmModal } from './ConfirmModal';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  onUpdateHabits: () => void; // Trigger reload
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  habits,
  onUpdateHabits,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'reset' | 'clear' | null>(null);

  if (!isOpen) return null;

  // Export JSON file
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(habits, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `habit_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setMsg('Data successfully exported!');
  };

  // Import JSON file
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsLoading(true);
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          await api.batchCreateHabits(imported);
          onUpdateHabits();
          setMsg('Successfully imported habits backup!');
        } else {
          setMsg('Invalid JSON format: expected an array of habits.');
        }
      } catch (err) {
        setMsg('Error parsing JSON file or saving to database.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // Reset demo data
  const handleResetDemo = () => setConfirmAction('reset');

  const executeResetDemo = async () => {
    try {
      setIsLoading(true);
      await api.clearAll();
      const sample = getInitialSampleHabits();
      await api.batchCreateHabits(sample);
      onUpdateHabits();
      setMsg('Reset to demo sample data!');
    } catch (e) {
      setMsg('Failed to reset data.');
    } finally {
      setIsLoading(false);
      setConfirmAction(null);
    }
  };

  // Clear all
  const handleClearAll = () => setConfirmAction('clear');

  const executeClearAll = async () => {
    try {
      setIsLoading(true);
      await api.clearAll();
      onUpdateHabits();
      setMsg('All habits cleared.');
    } catch (e) {
      setMsg('Failed to clear data.');
    } finally {
      setIsLoading(false);
      setConfirmAction(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Data Management & Backup</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {msg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 font-medium">
              <Check className="w-4 h-4" />
              <span>{msg}</span>
            </div>
          )}

          {/* Action List */}
          <div className="space-y-3 text-xs">
            {/* Export */}
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 rounded-2xl text-zinc-800 dark:text-zinc-200 transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-zinc-900 dark:text-zinc-50">Export Backup JSON</strong>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Download habit data & full completion logs</span>
                </div>
              </div>
            </button>

            {/* Import */}
            <button
              onClick={handleImportClick}
              className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 rounded-2xl text-zinc-800 dark:text-zinc-200 transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-zinc-900 dark:text-zinc-50">Import Backup JSON</strong>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Restore habits from a previously saved JSON file</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </button>

            {/* Reset Demo */}
            <button
              onClick={handleResetDemo}
              className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 rounded-2xl text-zinc-800 dark:text-zinc-200 transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-zinc-900 dark:text-zinc-50">Reset to Sample Demo Habits</strong>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Load pre-populated habits with history</span>
                </div>
              </div>
            </button>

            {/* Clear All */}
            <button
              onClick={handleClearAll}
              className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-rose-500/50 rounded-2xl text-zinc-800 dark:text-zinc-200 transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-rose-400">Clear All Habits & Data</strong>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Delete all habits and restart fresh</span>
                </div>
              </div>
            </button>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-zinc-200 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 font-medium text-xs rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal
      isOpen={confirmAction === 'reset'}
      title="Reset to Demo Data"
      message="Reset habits to initial sample demo data? This will overwrite current entries."
      confirmLabel="Reset Data"
      isDestructive={true}
      onConfirm={executeResetDemo}
      onCancel={() => setConfirmAction(null)}
    />
    <ConfirmModal
      isOpen={confirmAction === 'clear'}
      title="Clear All Data"
      message="Are you sure you want to delete ALL habits and history? This action cannot be undone."
      confirmLabel="Clear All"
      isDestructive={true}
      onConfirm={executeClearAll}
      onCancel={() => setConfirmAction(null)}
    />
    </>
  );
};
