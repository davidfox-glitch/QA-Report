import React from 'react';
import { useStore } from '../../store/useStore';
import { StatsCards } from './StatsCards';
import { AISummarySection } from './AISummarySection';
import { 
  AlertTriangle, 
  Bell, 
  ArrowRight,
  TrendingUp, 
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export const DashboardView: React.FC = () => {
  const { rows, settings, notifications, setCurrentView } = useStore();

  // Find recent failing tests
  const recentFailures = rows.filter(r => r.testingStatus === 'Failed').slice(0, 3);
  
  // Find top assignees task distributions
  const usersAssignedCount = rows.reduce((acc: Record<string, number>, r) => {
    if (r.assignedUser) {
      acc[r.assignedUser] = (acc[r.assignedUser] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            Testing Metrics Overview
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit summary dashboard for <span className="font-semibold text-slate-800 dark:text-slate-200">{settings.projectName}</span>.
          </p>
        </div>
      </div>

      {/* Stats Cards Section */}
      <StatsCards rows={rows} />

      {/* AI Summary Section */}
      <AISummarySection rows={rows} settings={settings} />

      {/* Dynamic Activity and Quick Triage widgets grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Widget 1: Critical Bug Watchlist */}
        <div className="glass-panel border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-rose-500" /> Critical Defect Watchlist
            </h4>
            <button
              onClick={() => setCurrentView('table')}
              className="text-[10px] font-bold text-indigo-500 hover:text-indigo-650 flex items-center gap-0.5"
            >
              Triage <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentFailures.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200/40 dark:border-slate-800/40 rounded-xl">
                <p className="text-[10px] text-slate-400 dark:text-slate-500">🎉 Zero active bugs recorded.</p>
              </div>
            ) : (
              recentFailures.map(row => (
                <div
                  key={row.id}
                  onClick={() => setCurrentView('table')}
                  className="p-3 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/40 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.5 rounded">
                      {row.priority} Priority
                    </span>
                    <span className="text-[8px] text-slate-400">{row.lastUpdated.split(' ')[0]}</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{row.testPoint}</h5>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate">Actual: {row.actualResult || 'No output recorded.'}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 2: Recent Activity / Notification Feed */}
        <div className="glass-panel border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-indigo-500 animate-pulse" /> Live Audit Log
            </h4>
            <span className="text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
              Live Feed
            </span>
          </div>

          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200/40 dark:border-slate-800/40 rounded-xl">
                <p className="text-[10px] text-slate-400 dark:text-slate-500">No recent notifications recorded.</p>
              </div>
            ) : (
              notifications.slice(0, 4).map(notif => (
                <div key={notif.id} className="flex gap-2.5 text-[10px] items-start">
                  <div className={`h-2 w-2 rounded-full mt-1 shrink-0 ${
                    notif.type === 'status_change' ? 'bg-emerald-500' :
                    notif.type === 'assignment' ? 'bg-indigo-500' : 'bg-slate-400'
                  }`} />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">{notif.message}</p>
                    <span className="text-[8px] text-slate-400">{notif.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 3: Team Workload Allocation */}
        <div className="glass-panel border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-indigo-500" /> Workload Allocation
            </h4>
            <button
              onClick={() => setCurrentView('users')}
              className="text-[10px] font-bold text-indigo-500 hover:text-indigo-650 flex items-center gap-0.5"
            >
              Team Directory <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3.5">
            {Object.keys(usersAssignedCount).length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200/40 dark:border-slate-800/40 rounded-xl">
                <p className="text-[10px] text-slate-400 dark:text-slate-500">No workload allocated to users.</p>
              </div>
            ) : (
              Object.entries(usersAssignedCount).slice(0, 3).map(([user, count]) => {
                const totalRows = rows.length;
                const percentage = totalRows > 0 ? Math.round((count / totalRows) * 100) : 0;
                return (
                  <div key={user} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-750 dark:text-slate-300">
                      <span>{user}</span>
                      <span>{count} Test Points ({percentage}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
