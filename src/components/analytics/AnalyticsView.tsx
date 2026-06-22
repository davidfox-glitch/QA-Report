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
  const { users, modules } = useStore();

  // 1. Passed vs Failed Data
  const passed = rows.filter((r) => r.testingStatus === 'Passed').length;
  const failed = rows.filter((r) => r.testingStatus === 'Failed').length;
  const pending = rows.filter((r) => r.testingStatus === 'Pending').length;
  const inProgress = rows.filter((r) => r.testingStatus === 'In Progress').length;

  const passedVsFailedData = [
    { name: 'Passed', value: passed, color: '#d0bcff' }, // primary
    { name: 'Failed', value: failed, color: '#ffb4ab' }, // error
    { name: 'In Progress', value: inProgress, color: '#c4c1fb' }, // tertiary
    { name: 'Pending', value: pending, color: '#3f465c' } // secondary-container
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
    const mod = modules.find(m => m.id === r.moduleId)?.name || 'General';
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
    const userRows = rows.filter(r => r.assignedUsers?.includes(u.name));
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
      color: '#d4e4fa',
      fontSize: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
    },
    itemStyle: {
      color: '#d4e4fa'
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Row: Donut and Line charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Passed vs Failed */}
        <div className="lg:col-span-4 glass-card p-6 rounded-xl premium-border flex flex-col h-[380px]">
          <h3 className="font-headline-md text-body-lg font-bold text-on-surface mb-2">
            Test Outcomes
          </h3>
          <p className="text-body-sm text-on-surface-variant mb-4">Overall success metrics</p>
          <div className="flex-1 min-h-0 relative flex items-center justify-center">
            {passedVsFailedData.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No test cases found.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={passedVsFailedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {passedVsFailedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...customTooltipStyle} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12, color: '#cbc3d7' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Progress Timeline */}
        <div className="lg:col-span-8 glass-card p-6 rounded-xl premium-border flex flex-col h-[380px]">
          <h3 className="font-headline-md text-body-lg font-bold text-on-surface mb-2">
            Audit Velocity
          </h3>
          <p className="text-body-sm text-on-surface-variant mb-4">Daily velocity of QA audits across projects</p>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressTimelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUpdates" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d0bcff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d0bcff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="date" stroke="#cbc3d7" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#cbc3d7" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip {...customTooltipStyle} />
                <Area type="monotone" dataKey="Updates" stroke="#d0bcff" strokeWidth={3} fillOpacity={1} fill="url(#colorUpdates)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Middle Row: Module Completion, Priorities, Team Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Chart 3: Module Completion */}
        <div className="glass-card p-6 rounded-xl premium-border flex flex-col h-[380px]">
          <h3 className="font-headline-md text-body-lg font-bold text-on-surface mb-2">
            Module Completion
          </h3>
          <p className="text-body-sm text-on-surface-variant mb-4">Pass vs Fail per component</p>
          <div className="flex-1 min-h-0">
            {moduleCompletionData.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No module data mapped.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moduleCompletionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="name" stroke="#cbc3d7" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#cbc3d7" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip {...customTooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Passed" fill="#d0bcff" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Failed" name="Failed (Bugs)" fill="#ffb4ab" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 4: Testing Distribution (Radar chart mapping priorities) */}
        <div className="glass-card p-6 rounded-xl premium-border flex flex-col h-[380px]">
          <h3 className="font-headline-md text-body-lg font-bold text-on-surface mb-2">
            Testing Priorities
          </h3>
          <p className="text-body-sm text-on-surface-variant mb-4">Urgency distribution matrix</p>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={priorityStats}>
                <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
                <PolarAngleAxis dataKey="subject" stroke="#cbc3d7" fontSize={11} />
                <PolarRadiusAxis stroke="rgba(255, 255, 255, 0.1)" fontSize={9} axisLine={false} tick={false} />
                <Radar name="Passed" dataKey="Passed" stroke="#d0bcff" fill="#d0bcff" fillOpacity={0.25} />
                <Radar name="Failed" dataKey="Failed" stroke="#ffb4ab" fill="#ffb4ab" fillOpacity={0.25} />
                <Tooltip {...customTooltipStyle} />
                <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Team Activity */}
        <div className="glass-card p-6 rounded-xl premium-border flex flex-col h-[380px]">
          <h3 className="font-headline-md text-body-lg font-bold text-on-surface mb-2">
            Team Allocation
          </h3>
          <p className="text-body-sm text-on-surface-variant mb-4">Workload breakdown by engineer</p>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamActivityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="name" stroke="#cbc3d7" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#cbc3d7" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip {...customTooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Passed" fill="#d0bcff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Bugs" name="Bugs Found" fill="#ffb4ab" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Total" name="Total Assigned" fill="#c4c1fb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
