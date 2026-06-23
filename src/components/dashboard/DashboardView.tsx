import React from 'react';
import { useStore } from '../../store/useStore';
import { AISummarySection } from './AISummarySection';
import { StatsCards } from './StatsCards';

interface DashboardViewProps {
  rows: any[]; // TestRow[]
}

export const DashboardView: React.FC<DashboardViewProps> = ({ rows }) => {
  const { settings } = useStore();

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Header Section */}
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-primary font-label-caps text-label-caps tracking-widest uppercase mb-2 block">System Performance</span>
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-slate-900 dark:text-slate-50">QA Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-body-sm text-slate-800 dark:text-slate-100 font-medium">Live Monitoring Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Testing Metrics Overview (KPIs) */}
      <div className="mb-10">
        <StatsCards rows={rows} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* AI-Powered Report Analyst */}
          <div className="glass-card premium-stroke rounded-2xl overflow-hidden min-h-[400px] flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">AI-Powered Report Analyst</h3>
              </div>
              <span className="text-label-caps text-primary bg-primary/10 px-2 py-1 rounded">Beta v2.4</span>
            </div>
            <div className="flex-grow p-0">
              {/* Replace the static mockup analyst with our actual dynamic AI Summary Section */}
              <AISummarySection rows={rows} settings={settings} />
            </div>
          </div>


        </div>

        {/* Sidebar (4 Columns) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Project Bible */}
          <section className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80/30">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-xl">auto_stories</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Project Bible</h3>
              </div>
              <p className="text-body-sm text-slate-500 dark:text-slate-400">Core single source of truth</p>
            </div>
            <div className="p-2">
              <div className="space-y-1">
                <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all cursor-pointer group">
                  <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">description</span>
                  <div className="flex-grow">
                    <p className="text-body-sm text-slate-800 dark:text-slate-100 font-medium">Architecture Overview.pdf</p>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400">Updated 2h ago</p>
                  </div>
                  <span className="material-symbols-outlined text-sm text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">download</span>
                </div>
                <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all cursor-pointer group">
                  <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">link</span>
                  <div className="flex-grow">
                    <p className="text-body-sm text-slate-800 dark:text-slate-100 font-medium">API Endpoints Swagger</p>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400">Production Environment</p>
                  </div>
                  <span className="material-symbols-outlined text-sm text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                </div>
                <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all cursor-pointer group">
                  <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">security</span>
                  <div className="flex-grow">
                    <p className="text-body-sm text-slate-800 dark:text-slate-100 font-medium">Security Protocols.docx</p>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400">v4.2.1 Stable</p>
                  </div>
                  <span className="material-symbols-outlined text-sm text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">download</span>
                </div>
                <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all cursor-pointer group">
                  <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">inventory</span>
                  <div className="flex-grow">
                    <p className="text-body-sm text-slate-800 dark:text-slate-100 font-medium">Resource Mapping v2</p>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400">Last edited by Alex</p>
                  </div>
                  <span className="material-symbols-outlined text-sm text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">download</span>
                </div>
              </div>
              <button className="w-full mt-2 py-3 text-body-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors flex items-center justify-center gap-2">
                View All Assets
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </section>

          {/* Critical Defect Watchlist */}
          <section className="glass-card rounded-2xl p-6 border-l-4 border-l-error">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Critical Watchlist</h3>
              </div>
              <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded text-[10px] font-bold">4 HIGH</span>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-error-container/10 border border-error/20 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-label-caps text-error font-bold tracking-wider">DEF-902</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Reported 45m ago</span>
                </div>
                <h4 className="text-body-sm font-bold text-slate-900 dark:text-slate-50 mb-1">Stripe Webhook Timeout</h4>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">Intermittent failure on checkout success callback affecting 15% of users.</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                    Unassigned
                  </div>
                  <button className="text-error text-[10px] font-bold uppercase tracking-widest hover:underline">Assign Me</button>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/50 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-label-caps text-slate-500 dark:text-slate-400 font-bold tracking-wider">DEF-884</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Reported 3h ago</span>
                </div>
                <h4 className="text-body-sm font-bold text-slate-900 dark:text-slate-50 mb-1">CORS Policy Leak</h4>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">Staging environment leaking internal headers to unauthorized origins.</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                    Sarah K.
                  </div>
                  <button className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-primary">Update</button>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 bg-white dark:bg-slate-800 hover:bg-white dark:bg-slate-900-variant text-slate-800 dark:text-slate-100 py-3 rounded-xl text-body-sm font-medium transition-all">
              Open Defect Manager
            </button>
          </section>

          {/* System Stats Mini-Card */}
          <section className="glass-card rounded-2xl p-6 bg-gradient-to-br from-surface-container to-surface-container-lowest">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">speed</span>
              </div>
              <div>
                <p className="text-label-caps text-slate-500 dark:text-slate-400">Avg. Page Load</p>
                <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-50">412ms</h4>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};
