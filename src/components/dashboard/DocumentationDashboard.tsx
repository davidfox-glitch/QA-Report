import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Clock, AlertTriangle, FileText, Database, Shield, Cpu, Activity, ShieldAlert, Zap } from 'lucide-react';

interface ProjectStatus {
  'Current Progress %': number;
  'Completed Features': string[];
  'In Progress Features': string[];
  'Pending Features': string[];
  'Known Bugs': string[];
  'Technical Debt': string[];
  'Last Updated': string;
}

export const DocumentationDashboard: React.FC = () => {
  const [status, setStatus] = useState<ProjectStatus | null>(null);

  useEffect(() => {
    // In a real scenario, this might fetch from an API that reads the local docs/PROJECT_STATUS.json
    // For this dashboard, we will mock the import based on the actual file contents since we can't do direct FS reads in browser without an API route.
    const mockStatus: ProjectStatus = {
      'Current Progress %': 80,
      'Completed Features': [
        'Authentication',
        'Task Assignment',
        'Archive System',
        'Trash Bin',
        'Notifications (@mentions)',
        'Import Wizard',
        'Documentation Hub (Docs)'
      ],
      'In Progress Features': [
        'Documentation Dashboard UI',
        'Self Audit Scripts'
      ],
      'Pending Features': [
        'Report Generator',
        'AI Notes Assistant',
        'Push Notifications',
        'Screenshot Analysis'
      ],
      'Known Bugs': [],
      'Technical Debt': [
        'Full Supabase real-time sync for Zustand state'
      ],
      'Last Updated': '2026-06-11'
    };
    setStatus(mockStatus);
  }, []);

  if (!status) return null;

  const docsLinks = [
    { title: 'Project Overview', file: 'PROJECT_OVERVIEW.md', icon: <FileText className="w-4 h-4 text-indigo-500" /> },
    { title: 'Roadmap & Matrix', file: 'ROADMAP.md', icon: <Activity className="w-4 h-4 text-emerald-500" /> },
    { title: 'Features Inventory', file: 'FEATURES.md', icon: <BookOpen className="w-4 h-4 text-sky-500" /> },
    { title: 'UI & Design Guide', file: 'UI_GUIDE.md', icon: <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" /> },
    { title: 'Database Schema', file: 'DATABASE.md', icon: <Database className="w-4 h-4 text-amber-500" /> },
    { title: 'Security Policies', file: 'SECURITY.md', icon: <Shield className="w-4 h-4 text-rose-500" /> },
    { title: 'AI Context', file: 'AI_CONTEXT.md', icon: <Cpu className="w-4 h-4 text-fuchsia-500" /> }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Project Documentation & Health
        </h2>
        <div className="text-sm text-slate-500">
          Last Updated: {status['Last Updated']}
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-slate-500 text-sm font-medium mb-1">Project Progress</div>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{status['Current Progress %']}%</div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${status['Current Progress %']}%` }}></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Completed
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-white">{status['Completed Features'].length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            Pending/WIP
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-white">{status['In Progress Features'].length + status['Pending Features'].length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Tech Debt / Bugs
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-white">{status['Technical Debt'].length + status['Known Bugs'].length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Features & Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white">Feature Status Matrix</h3>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Completed</h4>
                <ul className="space-y-2">
                  {status['Completed Features'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">In Progress & Planned</h4>
                <ul className="space-y-2">
                  {status['In Progress Features'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-amber-500" /> {f}
                    </li>
                  ))}
                  {status['Pending Features'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 dark:border-slate-600" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Documentation Links */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white">Project Bible</h3>
              <BookOpen className="w-4 h-4 text-slate-400" />
            </div>
            <div className="p-2">
              {docsLinks.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3">
                    {doc.icon}
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {doc.title}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {doc.file}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Defect Watchlist */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border-l-4 border-l-rose-500 border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="text-rose-500 w-4 h-4" />
                <h3 className="font-bold text-slate-800 dark:text-white">Critical Watchlist</h3>
              </div>
              <span className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded text-[10px] font-bold">4 HIGH</span>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-bold tracking-wider">DEF-902</span>
                  <span className="text-[10px] text-slate-500">45m ago</span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Stripe Webhook Timeout</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">Intermittent failure on checkout success callback affecting 15% of users.</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs text-slate-500 font-bold tracking-wider">DEF-884</span>
                  <span className="text-[10px] text-slate-500">3h ago</span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">CORS Policy Leak</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">Staging environment leaking internal headers to unauthorized origins.</p>
              </div>
            </div>
          </div>

          {/* System Stats Mini-Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center bg-white dark:bg-slate-800">
                <Zap className="text-indigo-500 w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Avg. Page Load</p>
                <h4 className="text-xl font-extrabold text-slate-800 dark:text-white">412ms</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
