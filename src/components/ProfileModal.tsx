import React, { useEffect, useState } from 'react';
import { X, User, Mail, LogOut, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { userPool } from '../lib/cognito';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  habitCount: number;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onLogout, habitCount }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      const user = userPool.getCurrentUser();
      if (user) {
        user.getSession((err: any, session: any) => {
          if (err || !session.isValid()) return;
          user.getUserAttributes((err, attributes) => {
            if (err) return;
            attributes?.forEach((attr) => {
              if (attr.getName() === 'email') setEmail(attr.getValue());
              if (attr.getName() === 'name') setName(attr.getValue());
            });
          });
        });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">User Profile</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl shrink-0 shadow-inner">
                {name ? name.charAt(0).toUpperCase() : (email ? email.charAt(0).toUpperCase() : 'U')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">
                  {name || 'User Account'}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5 truncate">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{email || 'Loading...'}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
                Total Habits
              </div>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{habitCount}</div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
