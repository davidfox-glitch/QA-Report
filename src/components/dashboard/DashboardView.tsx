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

      <div className="grid grid-cols-1 gap-6">
        {/* Main Content Area */}
        <div className="space-y-6">
          {/* AI-Powered Report Analyst */}
          <div className="glass-card premium-stroke rounded-2xl overflow-hidden flex flex-col">
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
      </div>
    </div>
  );
};
