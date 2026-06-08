import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { TestRow, useStore } from '../../store/useStore';

interface AnalyticsViewProps {
  rows: TestRow[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ rows }) => {
  const { users } = useStore();

  // 1. Passed vs Failed Data
  const passed = rows.filter((r) => r.testingStatus === 'Passed').length;
  const failed = rows.filter((r) => r.testingStatus === 'Failed').length;
  const pending = rows.filter((r) => r.testingStatus === 'Pending').length;
  const inProgress = rows.filter((r) => r.testingStatus === 'In Progress').length;

  const passedVsFailedData = [
    { name: 'Passed', value: passed, color: '#10b981' },
    { name: 'Failed', value: failed, color: '#ef4444' },
    { name: 'In Progress', value: inProgress, color: '#0ea5e9' },
    { name: 'Pending', value: pending, color: '#6366f1' }
  ].filter(d => d.value > 0);

  // 2. Progress Timeline Data (Velocity of updates by Date)
  const dateMap: Record<string, { date: string; Updates: number }> = {};
  rows.forEach((r) => {
    const dateStr = r.lastUpdated.split(' ')[0] || 'Unknown';
    if (!dateMap[dateStr]) {
      dateMap[dateStr] = { date: dateStr, Updates: 0 };
    }
    dateMap[dateStr].Updates += 1;
  });
  const progressTimelineData = Object.values(dateMap)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10); // Show last 10 days

  // 3. Module Completion Data (Pass vs Fail per Module)
  const moduleMap: Record<string, { name: string; Passed: number; Failed: number }> = {};
  rows.forEach((r) => {
    const mod = r.moduleName || 'General';
    if (!moduleMap[mod]) {
      moduleMap[mod] = { name: mod, Passed: 0, Failed: 0 };
    }
    if (r.testingStatus === 'Passed') moduleMap[mod].Passed += 1;
    if (r.testingStatus === 'Failed') moduleMap[mod].Failed += 1;
  });
  const moduleCompletionData = Object.values(moduleMap);

  // 4. Testing Distribution (Status breakdown across priorities)
  const priorityStats = ['Critical', 'High', 'Medium', 'Low'].map(prio => {
    const pRows = rows.filter(r => r.priority === prio);
    return {
      subject: prio,
      Passed: pRows.filter(r => r.testingStatus === 'Passed').length,
      Failed: pRows.filter(r => r.testingStatus === 'Failed').length,
      'In Progress': pRows.filter(r => r.testingStatus === 'In Progress').length,
      fullMark: rows.length
    };
  });

  // 5. Team Activity (Assigned tests breakdown per user)
  const teamActivityData = users.map((u) => {
    const userRows = rows.filter(r => r.assignedUser === u.name);
    return {
      name: u.name.split(' ')[0], // First name for layout fitting
      Passed: userRows.filter(r => r.testingStatus === 'Passed').length,
      Bugs: userRows.filter(r => r.testingStatus === 'Failed').length,
      Total: userRows.length
    };
  });

  const customTooltipStyle = {
    contentStyle: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      color: '#fff',
      fontSize: '11px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Row: Donut and Line charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Passed vs Failed */}
        <div className="glass-panel border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 flex flex-col h-[320px]">
          <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-700 dark:text-slate-350 mb-2">
            Passed vs Failed Distribution
          </h4>
          <div className="flex-1 min-h-0 relative flex items-center justify-center">
            {passedVsFailedData.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">No test cases found.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={passedVsFailedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {passedVsFailedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...customTooltipStyle} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Progress Timeline */}
        <div className="glass-panel border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 flex flex-col h-[320px]">
          <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Audit Updates Velocity Timeline
          </h4>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressTimelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUpdates" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip {...customTooltipStyle} />
                <Area type="monotone" dataKey="Updates" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorUpdates)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Middle Row: Module Completion and Testing Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 3: Module Completion */}
        <div className="glass-panel border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 flex flex-col h-[340px]">
          <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Module Testing Completion Rate
          </h4>
          <div className="flex-1 min-h-0">
            {moduleCompletionData.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">No module data mapped.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moduleCompletionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip {...customTooltipStyle} cursor={{ fill: 'rgba(148,163,184,0.04)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Passed" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Failed" name="Failed (Bugs)" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 4: Testing Distribution (Radar chart mapping priorities) */}
        <div className="glass-panel border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 flex flex-col h-[340px]">
          <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Priority Testing Distribution
          </h4>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="90%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={priorityStats}>
                <PolarGrid stroke="rgba(148, 163, 184, 0.12)" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis stroke="#94a3b8" fontSize={8} />
                <Radar name="Passed" dataKey="Passed" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                <Radar name="Failed" dataKey="Failed" stroke="#ef4444" fill="#ef4444" fillOpacity={0.25} />
                <Tooltip {...customTooltipStyle} />
                <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: 9 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom Row: Team Activity */}
      <div className="glass-panel border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 flex flex-col h-[320px]">
        <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
          Team Activity and Task Allocation
        </h4>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={teamActivityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
              <Tooltip {...customTooltipStyle} cursor={{ fill: 'rgba(148,163,184,0.04)' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="Passed" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Bugs" name="Bugs Found" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Total" name="Total Assigned" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
