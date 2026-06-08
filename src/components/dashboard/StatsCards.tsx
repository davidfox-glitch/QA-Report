import React from 'react';
import { 
  Layers, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  PlayCircle, 
  Users, 
  Percent, 
  FileSpreadsheet 
} from 'lucide-react';
import { TestRow, useStore } from '../../store/useStore';

interface StatsCardsProps {
  rows: TestRow[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ rows }) => {
  const { users, notifications } = useStore();
  const total = rows.length;
  const passed = rows.filter(r => r.testingStatus === 'Passed').length;
  const failed = rows.filter(r => r.testingStatus === 'Failed').length;
  const pending = rows.filter(r => r.testingStatus === 'Pending').length;
  const inProgress = rows.filter(r => r.testingStatus === 'In Progress').length;
  
  // Unique assigned users from rows
  const activeAssignedUsers = Array.from(new Set(rows.map(r => r.assignedUser).filter(Boolean))).length;
  
  // Completion rate (Passed + Failed / Total)
  const completionRate = total > 0 ? Math.round(((passed + failed) / total) * 100) : 0;
  
  // Uploaded Sheets count dynamically tracked from notifications logs
  const sheetUploads = notifications.filter(n => n.message.toLowerCase().includes('imported')).length || 1;

  const stats = [
    {
      label: 'Total Test Points',
      value: total,
      icon: Layers,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10 dark:bg-indigo-500/15',
      borderColor: 'border-indigo-500/20 dark:border-indigo-500/30'
    },
    {
      label: 'Passed Cases',
      value: passed,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      borderColor: 'border-emerald-500/20 dark:border-emerald-500/30'
    },
    {
      label: 'Failed Cases',
      value: failed,
      icon: XCircle,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10 dark:bg-rose-500/15',
      borderColor: 'border-rose-500/20 dark:border-rose-500/30'
    },
    {
      label: 'Pending Cases',
      value: pending,
      icon: HelpCircle,
      color: 'text-slate-500',
      bgColor: 'bg-slate-500/10 dark:bg-slate-500/15',
      borderColor: 'border-slate-500/20 dark:border-slate-500/30'
    },
    {
      label: 'In Progress',
      value: inProgress,
      icon: PlayCircle,
      color: 'text-sky-500',
      bgColor: 'bg-sky-500/10 dark:bg-sky-500/15',
      borderColor: 'border-sky-500/20 dark:border-sky-500/30'
    },
    {
      label: 'Assigned Users',
      value: activeAssignedUsers,
      icon: Users,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10 dark:bg-violet-500/15',
      borderColor: 'border-violet-500/20 dark:border-violet-500/30'
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      icon: Percent,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10 dark:bg-amber-500/15',
      borderColor: 'border-amber-500/20 dark:border-amber-500/30'
    },
    {
      label: 'Uploaded Sheets',
      value: sheetUploads,
      icon: FileSpreadsheet,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10 dark:bg-cyan-500/15',
      borderColor: 'border-cyan-500/20 dark:border-cyan-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`flex items-center p-4 rounded-xl border glass-card ${stat.borderColor} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
          >
            <div className={`p-3 rounded-lg ${stat.bgColor} mr-4`}>
              <Icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
              <h4 className="text-xl font-bold font-display text-slate-900 dark:text-white mt-0.5">
                {stat.value}
              </h4>
            </div>
          </div>
        );
      })}
    </div>
  );
};
