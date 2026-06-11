import React from 'react';
import { TestRow } from '../../store/useStore';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';

interface TimelineViewProps {
  rows: TestRow[];
  onEditRow: (id: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ rows, onEditRow }) => {
  // Find rows with valid timeline dates
  const timelineRows = rows.filter(r => r.startDate && r.releaseDate);

  // If no rows have dates, render a warning
  const missingDatesCount = rows.length - timelineRows.length;

  // Compute date ranges
  const getDaysArray = () => {
    // Default 30 day window starting from today minus 5 days
    const start = new Date();
    start.setDate(start.getDate() - 5);
    const days = [];
    for (let i = 0; i < 28; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const days = getDaysArray();
  const timeLabels = days.filter((_, idx) => idx % 4 === 0); // show label every 4 days

  const calculateOffsetAndWidth = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const gridStart = days[0];
    const gridEnd = days[days.length - 1];

    if (end < gridStart || start > gridEnd) return { show: false, leftPercent: 0, widthPercent: 0 };

    const totalDuration = gridEnd.getTime() - gridStart.getTime();
    
    let leftOffset = start.getTime() - gridStart.getTime();
    if (leftOffset < 0) leftOffset = 0;

    let width = end.getTime() - start.getTime();
    if (start.getTime() < gridStart.getTime()) {
      width = end.getTime() - gridStart.getTime();
    }
    if (end.getTime() > gridEnd.getTime()) {
      width = gridEnd.getTime() - Math.max(start.getTime(), gridStart.getTime());
    }

    const leftPercent = (leftOffset / totalDuration) * 100;
    const widthPercent = (width / totalDuration) * 100;

    return {
      show: true,
      leftPercent: Math.max(0, Math.min(100, leftPercent)),
      widthPercent: Math.max(2, Math.min(100, widthPercent))
    };
  };

  return (
    <div className="glass-panel border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 space-y-4">
      {/* Timeline Header Info */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-indigo-500" />
          <h4 className="text-sm font-bold font-display text-slate-800 dark:text-slate-200">
            Project Timeline (4-Week Grid)
          </h4>
        </div>
        {missingDatesCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl text-[10px] font-semibold">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{missingDatesCount} cases lack start/release dates. Edit them to assign timelines.</span>
          </div>
        )}
      </div>

      {/* Gantt Timeline Structure */}
      <div className="border border-slate-100 dark:border-slate-850 rounded-xl overflow-hidden bg-slate-50/20 dark:bg-slate-900/10 flex flex-col">
        {/* Weekly Header Column Labels */}
        <div className="flex border-b border-slate-100 dark:border-slate-850/60 text-[10px] font-bold font-display uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <div className="w-1/3 p-3 border-r border-slate-100 dark:border-slate-850/60 shrink-0">
            Test Case / Module
          </div>
          <div className="w-2/3 relative flex items-center p-3">
            {timeLabels.map((date, idx) => {
              const leftPercent = (days.findIndex(d => d.toDateString() === date.toDateString()) / days.length) * 100;
              return (
                <div
                  key={idx}
                  style={{ left: `${leftPercent}%` }}
                  className="absolute transform -translate-x-1/2 flex items-center gap-0.5 text-[9px] dark:text-slate-400 whitespace-nowrap"
                >
                  <Clock className="h-2.5 w-2.5 text-slate-400" />
                  {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-850">
          {timelineRows.length === 0 ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400 text-xs">
              No test cases have start and release dates. Edit a row to view its timeline.
            </div>
          ) : (
            timelineRows.map((row) => {
              const { show, leftPercent, widthPercent } = calculateOffsetAndWidth(
                row.startDate!,
                row.releaseDate!
              );

              // Bar colors mapping
              const barColors = {
                'Passed': 'bg-emerald-500/80 hover:bg-emerald-500 border border-emerald-600',
                'Failed': 'bg-rose-500/80 hover:bg-rose-500 border border-rose-600',
                'In Progress': 'bg-sky-500/80 hover:bg-sky-500 border border-sky-600',
                'Pending': 'bg-indigo-500/80 hover:bg-indigo-500 border border-indigo-600'
              };

              return (
                <div
                  key={row.id}
                  onClick={() => onEditRow(row.id)}
                  className="flex items-stretch hover:bg-slate-50/50 dark:hover:bg-slate-900/10 cursor-pointer transition-colors"
                >
                  {/* Left Column: Test Case Info */}
                  <div className="w-1/3 p-3 border-r border-slate-100 dark:border-slate-850/60 flex flex-col justify-center gap-1 overflow-hidden shrink-0">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {row.testPoint}
                    </span>
                    <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 dark:text-slate-550">
                      <span className="uppercase font-bold text-[8px] tracking-wider text-slate-450">{row.moduleName}</span>
                      <span>•</span>
                      <span>Assignee: {row.assignedUser || 'Unassigned'}</span>
                    </div>
                  </div>

                  {/* Right Column: Timeline visualization Bar */}
                  <div className="w-2/3 relative min-h-[56px] flex items-center px-4 bg-slate-50/5 dark:bg-slate-900/5">
                    {/* Day background Grid separators */}
                    {timeLabels.map((_, idx) => {
                      const leftPercent = (days.findIndex((d, dIdx) => dIdx === idx * 4) / days.length) * 100;
                      return (
                        <div
                          key={idx}
                          style={{ left: `${leftPercent}%` }}
                          className="absolute top-0 bottom-0 border-l border-slate-200/30 dark:border-slate-800/20"
                        />
                      );
                    })}

                    {/* Timeline Pill */}
                    {show && (
                      <div
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`
                        }}
                        className={`absolute h-7 rounded-xl flex items-center justify-between px-3 text-[10px] font-bold text-white shadow-sm overflow-hidden select-none transition-all duration-300 hover:shadow-md ${
                          barColors[row.testingStatus] || barColors['Pending']
                        }`}
                        title={`${row.testPoint}: ${row.startDate} to ${row.releaseDate}`}
                      >
                        <span className="truncate pr-1">
                          {row.testPoint}
                        </span>
                        <span className="text-[8px] font-mono shrink-0 opacity-80">
                          {Math.round(widthPercent / (100 / 28))}d
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
