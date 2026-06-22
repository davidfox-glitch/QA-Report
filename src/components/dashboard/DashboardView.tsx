import React from 'react';
import { useStore } from '../../store/useStore';
import { Shield } from 'lucide-react';
import { AISummarySection } from './AISummarySection';
import { StatsCards } from './StatsCards';

interface DashboardViewProps {
  rows: any[]; // TestRow[]
}

export const DashboardView: React.FC<DashboardViewProps> = ({ rows }) => {
  const { settings, activeProjectId, activeModuleId, projects, modules, setCurrentView } = useStore();

  const activeProjectName = projects.find(p => p.id === activeProjectId)?.name || settings.projectName;
  const activeModuleName = modules.find(m => m.id === activeModuleId)?.name;

  return (
    <div className="w-full animate-fade-in">
      {/* Hero Header Section */}
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-primary font-label-caps text-label-caps tracking-widest uppercase mb-2 block">System Performance</span>
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background">Project Health Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-xl border border-white/5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-body-sm text-on-surface font-medium">Live Monitoring Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Testing Metrics Overview (KPIs) */}
      <StatsCards rows={rows} />

      <div className="w-full mt-6">
        {/* AI-Powered Report Analyst */}
        <AISummarySection rows={rows} settings={settings} />
      </div>
    </div>
  );
};
