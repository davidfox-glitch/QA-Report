import React from 'react';
import { Calendar, Download, Info } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
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
  
  const total = rows.length || 1;
  const successRate = ((passed / total) * 100).toFixed(1);

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

  // 3. Module Completion Data
  const moduleMap: Record<string, { name: string; Passed: number; Total: number }> = {};
  rows.forEach((r) => {
    const mod = modules.find(m => m.id === r.moduleId)?.name || 'General';
    if (!moduleMap[mod]) {
      moduleMap[mod] = { name: mod, Passed: 0, Total: 0 };
    }
    moduleMap[mod].Total += 1;
    if (r.testingStatus === 'Passed') moduleMap[mod].Passed += 1;
  });
  const moduleCompletionData = Object.values(moduleMap).map(m => ({
    ...m,
    percent: Math.round((m.Passed / m.Total) * 100) || 0
  })).sort((a, b) => b.percent - a.percent);

  // 4. Testing Distribution (Status breakdown across priorities)
  const priorityStats = ['Critical', 'High', 'Medium', 'Low'].map(prio => {
    const pRows = rows.filter(r => r.priority === prio);
    return {
      subject: prio,
      Passed: pRows.filter(r => r.testingStatus === 'Passed').length,
      Failed: pRows.filter(r => r.testingStatus === 'Failed').length,
      fullMark: rows.length
    };
  });

  // 5. Team Activity
  const teamActivityData = users.map((u) => {
    const userRows = rows.filter(r => r.assignedUsers?.includes(u.name));
    return {
      name: u.name,
      Total: userRows.length,
      Passed: userRows.filter(r => r.testingStatus === 'Passed').length,
      avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=273647&color=d0bcff`
    };
  }).sort((a, b) => b.Total - a.Total);

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
        <div className="space-y-1">
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Performance Analytics</h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl">Visualizing real-time testing metrics, velocity, and team throughput across all active QA cycles.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 rounded-lg border border-white/10 bg-surface-container hover:bg-surface-container-high transition-colors font-body-sm font-medium flex items-center gap-2 text-on-surface">
            <Calendar className="h-4 w-4" />
            Last 30 Days
          </button>
          <button className="px-6 py-2.5 rounded-lg bg-primary text-on-primary-container hover:opacity-90 transition-opacity font-body-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/10">
            <Download className="h-4 w-4" />
            Create Report
          </button>
        </div>
      </section>

      {/* Top Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Passed vs Failed Distribution (Donut Chart) */}
        <div className="lg:col-span-4 glass-card p-6 rounded-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-br from-primary/20 to-transparent [mask-image:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [-webkit-mask-composite:xor] pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-headline-md text-body-lg font-bold text-on-surface">Test Outcomes</h3>
            <Info className="h-4 w-4 text-on-surface-variant" />
          </div>
          <div className="relative h-48 flex items-center justify-center">
            {passedVsFailedData.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No test cases found.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={passedVsFailedData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {passedVsFailedData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...customTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-headline-md font-bold text-on-surface">{successRate}%</span>
                  <span className="text-[10px] font-bold text-on-surface-variant tracking-widest">SUCCESS</span>
                </div>
              </>
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase">Passed</span>
                <span className="text-body-sm font-bold text-on-surface">{passed}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-error"></div>
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase">Failed</span>
                <span className="text-body-sm font-bold text-on-surface">{failed}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary-container"></div>
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase">Pending</span>
                <span className="text-body-sm font-bold text-on-surface">{pending}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Updates Velocity Timeline (Line Chart) */}
        <div className="lg:col-span-8 glass-card p-6 rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-br from-primary/20 to-transparent [mask-image:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [-webkit-mask-composite:xor] pointer-events-none"></div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-headline-md text-body-lg font-bold text-on-surface">Audit Velocity</h3>
              <p className="text-body-sm text-on-surface-variant">Daily velocity of QA audits across projects</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded bg-primary/10 text-primary text-[12px] font-bold tracking-widest uppercase">+14% Growth</span>
            </div>
          </div>
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressTimelineData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
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

      {/* Middle Row Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Module Testing Completion Rate */}
        <div className="glass-card p-6 rounded-xl relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-br from-primary/20 to-transparent [mask-image:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [-webkit-mask-composite:xor] pointer-events-none"></div>
          <h3 className="font-headline-md text-body-lg font-bold text-on-surface mb-6">Module Completion</h3>
          <div className="space-y-6 flex-1">
            {moduleCompletionData.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No modules mapped.</p>
            ) : (
              moduleCompletionData.slice(0, 5).map((mod, i) => (
                <div key={mod.name} className="space-y-2">
                  <div className="flex justify-between text-body-sm font-medium text-on-surface">
                    <span>{mod.name}</span>
                    <span className="text-primary">{mod.percent}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-primary rounded-full ${i === 0 ? 'shadow-[0_0_10px_rgba(208,188,255,0.4)]' : ''}`} 
                      style={{ width: `${mod.percent}%`, opacity: 1 - (i * 0.15) }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Priority Testing Distribution (Radar Chart) */}
        <div className="glass-card p-6 rounded-xl relative overflow-hidden flex flex-col items-center">
          <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-br from-primary/20 to-transparent [mask-image:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [-webkit-mask-composite:xor] pointer-events-none"></div>
          <h3 className="w-full font-headline-md text-body-lg font-bold text-on-surface mb-4">Testing Priorities</h3>
          <div className="relative w-full flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={priorityStats}>
                <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
                <PolarAngleAxis dataKey="subject" stroke="#cbc3d7" fontSize={11} />
                <PolarRadiusAxis stroke="none" axisLine={false} tick={false} />
                <Radar name="Passed" dataKey="Passed" stroke="#d0bcff" fill="#d0bcff" fillOpacity={0.2} />
                <Radar name="Failed" dataKey="Failed" stroke="#ffb4ab" fill="#ffb4ab" fillOpacity={0.2} />
                <Tooltip {...customTooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Activity and Task Allocation */}
        <div className="glass-card p-6 rounded-xl relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-br from-primary/20 to-transparent [mask-image:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [-webkit-mask-composite:xor] pointer-events-none"></div>
          <h3 className="font-headline-md text-body-lg font-bold text-on-surface mb-6">Team Allocation</h3>
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {teamActivityData.map((user, index) => {
              const maxTasks = Math.max(...teamActivityData.map(u => u.Total)) || 1;
              const width = Math.max(5, (user.Total / maxTasks) * 100);
              return (
                <div key={user.name} className="flex items-center gap-4 group">
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-primary/50 transition-colors" />
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-body-sm text-on-surface">
                      <span className="font-bold">{user.name}</span>
                      <span className="text-on-surface-variant">{user.Total} Tasks</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-primary rounded-full ${index === 0 ? 'shadow-[0_0_10px_rgba(208,188,255,0.4)]' : ''}`} 
                        style={{ width: `${width}%`, opacity: 1 - (index * 0.1) }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
            {teamActivityData.length === 0 && (
               <p className="text-body-sm text-on-surface-variant">No team activity recorded.</p>
            )}
          </div>
        </div>

      </div>

      {/* Detailed Metrics Section (Bento Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-8">
        <div className="lg:col-span-2 glass-card p-8 rounded-xl relative overflow-hidden flex flex-col justify-center items-start">
          <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-br from-primary/20 to-transparent [mask-image:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [-webkit-mask-composite:xor] pointer-events-none"></div>
          <div className="p-3 bg-primary/10 rounded-lg mb-4">
            <span className="material-symbols-outlined text-primary text-[32px]">speed</span>
          </div>
          <h4 className="text-headline-md font-bold mb-2 text-on-surface">Cycle Efficiency</h4>
          <p className="text-body-sm text-on-surface-variant mb-6">Your team is completing test cases 24% faster than last month. Automation coverage has increased to 68% total codebase.</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">1.4s</span>
            <span className="text-label-caps font-bold text-on-surface-variant tracking-widest">AVERAGE EXECUTION</span>
          </div>
        </div>

        <div className="glass-card p-8 rounded-xl relative overflow-hidden group cursor-pointer hover:bg-white/5 transition-colors">
          <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-br from-primary/20 to-transparent [mask-image:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [-webkit-mask-composite:xor] pointer-events-none"></div>
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-error">bug_report</span>
                <span className="text-error font-bold text-label-caps tracking-widest">High Risk</span>
              </div>
              <h4 className="text-body-lg font-bold mb-1 text-on-surface">Critical Faults</h4>
              <p className="text-body-sm text-on-surface-variant">3 undetected memory leaks found in Payment Module.</p>
            </div>
            <div className="mt-4 flex items-center text-primary font-bold text-body-sm group-hover:translate-x-2 transition-transform">
              Investigate <span className="material-symbols-outlined ml-1">chevron_right</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-xl relative overflow-hidden group cursor-pointer hover:bg-white/5 transition-colors">
          <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-br from-primary/20 to-transparent [mask-image:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [-webkit-mask-composite:xor] pointer-events-none"></div>
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-surface-tint">verified</span>
                <span className="text-surface-tint font-bold text-label-caps tracking-widest">Certified</span>
              </div>
              <h4 className="text-body-lg font-bold mb-1 text-on-surface">Compliance Rate</h4>
              <p className="text-body-sm text-on-surface-variant">SOC2 and ISO27001 test suites passing at 100%.</p>
            </div>
            <div className="mt-4 flex items-center text-primary font-bold text-body-sm group-hover:translate-x-2 transition-transform">
              View Audit <span className="material-symbols-outlined ml-1">chevron_right</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
