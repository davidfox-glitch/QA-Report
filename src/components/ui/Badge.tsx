import React from 'react';
import { FunctionalityStatus, TestingStatus, Priority } from '../../store/useStore';

interface BadgeProps {
  type: 'functionality' | 'testing' | 'priority' | 'custom';
  value: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, value, className = '' }) => {
  const getStyles = () => {
    const val = value.trim();
    
    if (type === 'functionality') {
      switch (val as FunctionalityStatus) {
        case 'Done':
          return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30';
        case 'In Progress':
          return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/30';
        case 'Blocked':
          return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30';
        case 'Pending':
        default:
          return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 dark:border-slate-500/30';
      }
    }

    if (type === 'testing') {
      switch (val as TestingStatus) {
        case 'Passed':
          return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30';
        case 'Failed':
          return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30';
        case 'Testing In Progress':
          return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 dark:border-sky-500/30';
        case 'Testing Pending':
        default:
          return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 dark:border-indigo-500/30';
      }
    }

    if (type === 'priority') {
      switch (val as Priority) {
        case 'Critical':
          return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 dark:border-purple-500/40 font-semibold animate-pulse';
        case 'High':
          return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 dark:border-orange-500/30';
        case 'Medium':
          return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30';
        case 'Low':
        default:
          return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 dark:border-slate-500/30';
      }
    }

    // Default badge
    return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStyles()} ${className}`}
    >
      {value}
    </span>
  );
};
