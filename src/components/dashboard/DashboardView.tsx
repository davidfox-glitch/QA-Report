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
      <div className="mb-10">
        <StatsCards rows={rows} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* AI-Powered Report Analyst */}
          <div className="glass-card premium-stroke rounded-2xl overflow-hidden min-h-[400px] flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                </div>
                <h3 className="text-headline-md font-headline-md text-on-background">AI-Powered Report Analyst</h3>
              </div>
              <span className="text-label-caps text-primary bg-primary/10 px-2 py-1 rounded">Beta v2.4</span>
            </div>
            <div className="flex-grow p-0">
              {/* Replace the static mockup analyst with our actual dynamic AI Summary Section */}
              <AISummarySection rows={rows} settings={settings} />
            </div>
          </div>

          {/* Project Documentation & Health Matrix */}
          <section className="glass-card rounded-2xl p-6">
            <h3 className="text-headline-md font-headline-md text-on-background mb-6">Project Documentation & Health</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-body-sm text-on-surface-variant">Technical Specifications</span>
                    <span className="text-body-sm text-primary font-bold">92%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full violet-glow" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-body-sm text-on-surface-variant">API Endpoint Definitions</span>
                    <span className="text-body-sm text-secondary font-bold">65%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-body-sm text-on-surface-variant">Security Audit Compliance</span>
                    <span className="text-body-sm text-tertiary font-bold">100%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center items-center text-center p-6 bg-surface-container-low rounded-xl border border-white/5">
                <div className="relative w-32 h-32 mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-surface-container" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                    <circle className="text-primary" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.4" strokeDashoffset="40" strokeWidth="8"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-headline-md font-bold text-on-background">88</span>
                    <span className="text-label-caps text-on-surface-variant">Health Index</span>
                  </div>
                </div>
                <p className="text-body-sm text-on-surface-variant">The project environment is exceptionally stable with minimal drift reported in the last 72h.</p>
              </div>
            </div>
          </section>

          {/* Feature Status Matrix */}
          <section className="glass-card rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-headline-md font-headline-md text-on-background">Feature Status Matrix</h3>
              <button className="text-body-sm text-primary hover:underline">View Roadmap</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-label-caps text-on-surface-variant">
                    <th className="pb-4 font-semibold uppercase tracking-wider">Feature Module</th>
                    <th className="pb-4 font-semibold uppercase tracking-wider">Status</th>
                    <th className="pb-4 font-semibold uppercase tracking-wider">Stability</th>
                    <th className="pb-4 font-semibold uppercase tracking-wider">Assignee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="group hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-lg">payments</span>
                        <span className="text-body-lg text-on-background font-medium">Checkout Flow</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-green-500/10 text-green-400 text-label-caps rounded-md border border-green-500/20">Deployed</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <div className="h-1 w-8 bg-primary rounded-full"></div>
                        <div className="h-1 w-8 bg-primary rounded-full"></div>
                        <div className="h-1 w-8 bg-primary rounded-full"></div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border border-surface bg-surface-bright flex items-center justify-center text-[10px] text-on-surface">JD</div>
                      </div>
                    </td>
                  </tr>
                  <tr className="group hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-secondary text-lg">shield_person</span>
                        <span className="text-body-lg text-on-background font-medium">RBAC Security</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-label-caps rounded-md border border-yellow-500/20">In Testing</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <div className="h-1 w-8 bg-secondary rounded-full"></div>
                        <div className="h-1 w-8 bg-secondary rounded-full"></div>
                        <div className="h-1 w-8 bg-surface-container rounded-full"></div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border border-surface bg-surface-bright flex items-center justify-center text-[10px] text-on-surface">AL</div>
                      </div>
                    </td>
                  </tr>
                  <tr className="group hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-tertiary text-lg">cloud_upload</span>
                        <span className="text-body-lg text-on-background font-medium">Bulk Upload</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-label-caps rounded-md border border-primary/20">Backlog</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <div className="h-1 w-8 bg-surface-container rounded-full"></div>
                        <div className="h-1 w-8 bg-surface-container rounded-full"></div>
                        <div className="h-1 w-8 bg-surface-container rounded-full"></div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border border-surface bg-surface-bright flex items-center justify-center text-[10px] text-on-surface">MK</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar (4 Columns) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Project Bible */}
          <section className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-surface-container-high/30">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-xl">auto_stories</span>
                <h3 className="text-headline-md font-headline-md text-on-background">Project Bible</h3>
              </div>
              <p className="text-body-sm text-on-surface-variant">Core single source of truth</p>
            </div>
            <div className="p-2">
              <div className="space-y-1">
                <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all cursor-pointer group">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">description</span>
                  <div className="flex-grow">
                    <p className="text-body-sm text-on-surface font-medium">Architecture Overview.pdf</p>
                    <p className="text-[12px] text-on-surface-variant">Updated 2h ago</p>
                  </div>
                  <span className="material-symbols-outlined text-sm text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">download</span>
                </div>
                <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all cursor-pointer group">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">link</span>
                  <div className="flex-grow">
                    <p className="text-body-sm text-on-surface font-medium">API Endpoints Swagger</p>
                    <p className="text-[12px] text-on-surface-variant">Production Environment</p>
                  </div>
                  <span className="material-symbols-outlined text-sm text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                </div>
                <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all cursor-pointer group">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">security</span>
                  <div className="flex-grow">
                    <p className="text-body-sm text-on-surface font-medium">Security Protocols.docx</p>
                    <p className="text-[12px] text-on-surface-variant">v4.2.1 Stable</p>
                  </div>
                  <span className="material-symbols-outlined text-sm text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">download</span>
                </div>
                <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all cursor-pointer group">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">inventory</span>
                  <div className="flex-grow">
                    <p className="text-body-sm text-on-surface font-medium">Resource Mapping v2</p>
                    <p className="text-[12px] text-on-surface-variant">Last edited by Alex</p>
                  </div>
                  <span className="material-symbols-outlined text-sm text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">download</span>
                </div>
              </div>
              <button className="w-full mt-2 py-3 text-body-sm text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-2">
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
                <h3 className="text-headline-md font-headline-md text-on-background">Critical Watchlist</h3>
              </div>
              <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded text-[10px] font-bold">4 HIGH</span>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-error-container/10 border border-error/20 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-label-caps text-error font-bold tracking-wider">DEF-902</span>
                  <span className="text-[10px] text-on-surface-variant">Reported 45m ago</span>
                </div>
                <h4 className="text-body-sm font-bold text-on-background mb-1">Stripe Webhook Timeout</h4>
                <p className="text-[12px] text-on-surface-variant leading-relaxed">Intermittent failure on checkout success callback affecting 15% of users.</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                    Unassigned
                  </div>
                  <button className="text-error text-[10px] font-bold uppercase tracking-widest hover:underline">Assign Me</button>
                </div>
              </div>
              <div className="p-4 bg-surface-container-low border border-white/5 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-label-caps text-on-surface-variant font-bold tracking-wider">DEF-884</span>
                  <span className="text-[10px] text-on-surface-variant">Reported 3h ago</span>
                </div>
                <h4 className="text-body-sm font-bold text-on-background mb-1">CORS Policy Leak</h4>
                <p className="text-[12px] text-on-surface-variant leading-relaxed">Staging environment leaking internal headers to unauthorized origins.</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                    Sarah K.
                  </div>
                  <button className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest hover:text-primary">Update</button>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 bg-surface-container hover:bg-surface-variant text-on-surface py-3 rounded-xl text-body-sm font-medium transition-all">
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
                <p className="text-label-caps text-on-surface-variant">Avg. Page Load</p>
                <h4 className="text-headline-md font-bold text-on-background">412ms</h4>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};
