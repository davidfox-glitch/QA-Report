import React, { useState } from 'react';
import { useStore, TestRow, TestingStatus, FunctionalityStatus } from '../../store/useStore';
import { Badge } from '../ui/Badge';
import { User, StickyNote, Paperclip, MoreVertical } from 'lucide-react';

interface KanbanViewProps {
  rows: TestRow[];
  onEditRow: (id: string) => void;
  onOpenNotes: (id: string) => void;
  onQuickUpdate: (id: string, updates: Partial<TestRow>) => void;
}

type GroupByOption = 'testing' | 'functionality' | 'user';

export const KanbanView: React.FC<KanbanViewProps> = ({
  rows,
  onEditRow,
  onOpenNotes,
  onQuickUpdate
}) => {
  const { users, modules } = useStore();
  const [groupBy, setGroupBy] = useState<GroupByOption>('testing');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColId, setOverColId] = useState<string | null>(null);

  const testingColumns = [
    { id: 'Pending', title: 'Pending Review', dot: 'bg-outline', textClass: 'text-on-surface', badgeClass: 'bg-surface-container-highest text-on-surface-variant' },
    { id: 'In Progress', title: 'In Progress', dot: 'bg-primary shadow-[0_0_8px_rgba(208,188,255,0.6)]', textClass: 'text-on-surface', badgeClass: 'bg-primary/10 text-primary border border-primary/20' },
    { id: 'Passed', title: 'Passed', dot: 'bg-secondary-fixed-dim', textClass: 'text-on-surface', badgeClass: 'bg-secondary-container text-secondary' },
    { id: 'Failed', title: 'Failed (Bugs)', dot: 'bg-error animate-pulse shadow-[0_0_8px_rgba(255,180,171,0.6)]', textClass: 'text-error', badgeClass: 'bg-error-container text-error' }
  ];

  const functionalityColumns = [
    { id: 'Pending', title: 'Backlog / Pending', dot: 'bg-outline', textClass: 'text-on-surface', badgeClass: 'bg-surface-container-highest text-on-surface-variant' },
    { id: 'Working', title: 'Operational', dot: 'bg-secondary-fixed-dim', textClass: 'text-on-surface', badgeClass: 'bg-secondary-container text-secondary' },
    { id: 'Partially Working', title: 'Partially Working', dot: 'bg-yellow-500', textClass: 'text-yellow-400', badgeClass: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' },
    { id: 'Not Working', title: 'Broken', dot: 'bg-error animate-pulse', textClass: 'text-error', badgeClass: 'bg-error-container text-error' }
  ];

  const getColDot = (index: number) => {
    const dots = ['bg-primary', 'bg-tertiary', 'bg-secondary', 'bg-error', 'bg-yellow-500', 'bg-blue-500'];
    return dots[index % dots.length];
  };

  const userColumns = [
    ...users.map((u, i) => ({ id: u.name, title: u.name, dot: getColDot(i), textClass: 'text-on-surface', badgeClass: 'bg-surface-container-highest text-on-surface-variant' })),
    { id: 'unassigned', title: 'Unassigned', dot: 'bg-outline', textClass: 'text-on-surface', badgeClass: 'bg-surface-container-highest text-on-surface-variant' }
  ];

  const getColumns = () => {
    if (groupBy === 'testing') return testingColumns;
    if (groupBy === 'functionality') return functionalityColumns;
    return userColumns;
  };

  const moveCard = (cardId: string, targetColId: string) => {
    if (groupBy === 'testing') onQuickUpdate(cardId, { testingStatus: targetColId as TestingStatus });
    else if (groupBy === 'functionality') onQuickUpdate(cardId, { functionalityStatus: targetColId as FunctionalityStatus });
    else onQuickUpdate(cardId, { assignedUsers: targetColId === 'unassigned' ? [] : [targetColId] });
  };

  const getRowColId = (row: TestRow) => {
    if (groupBy === 'testing') return row.testingStatus;
    if (groupBy === 'functionality') return row.functionalityStatus;
    return row.assignedUsers?.[0] || 'unassigned';
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setOverColId(null);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverColId(colId);
  };

  const handleDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) moveCard(id, colId);
    setDraggingId(null);
    setOverColId(null);
  };

  const getCardStyle = (status: TestingStatus) => {
    switch (status) {
      case 'In Progress': return 'border-l-4 border-l-primary/60';
      case 'Failed': return 'border border-error/20 bg-error-container/10';
      case 'Passed': return 'opacity-80 hover:opacity-100';
      default: return 'border border-white/5';
    }
  };

  const getCardRefPillStyle = (status: TestingStatus) => {
    switch (status) {
      case 'In Progress': return 'bg-primary/10 text-primary border border-primary/20';
      case 'Failed': return 'bg-error-container text-error border border-error/30';
      case 'Passed': return 'bg-secondary-container text-on-secondary-container border border-white/5';
      default: return 'bg-surface-container text-on-surface-variant border border-white/10';
    }
  };

  const getPriorityText = (priority: string) => {
    switch(priority) {
      case 'Critical': return 'BLOCKER';
      case 'High': return 'HIGH';
      case 'Medium': return 'MEDIUM';
      case 'Low': return 'MINOR';
      default: return 'NORMAL';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Critical': return 'text-error';
      case 'High': return 'text-primary';
      case 'Medium': return 'text-secondary';
      case 'Low': return 'text-error/60';
      default: return 'text-on-surface-variant';
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* SECTION: Project Timeline (4-Week Grid) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">Project Timeline</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">4-Week active test cycle oversight</p>
          </div>
          <div className="flex gap-2">
            <button className="glass-card px-4 py-2 rounded-lg text-label-caps font-label-caps text-on-surface-variant hover:text-primary transition-colors">Oct 2023</button>
            <button className="bg-surface-variant/40 px-4 py-2 rounded-lg text-label-caps font-label-caps text-primary border border-primary/20">Nov 2023</button>
          </div>
        </div>
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 border-b border-white/10 bg-surface-container-low/50">
            <div className="p-4 text-center font-label-caps text-label-caps text-on-surface-variant border-r border-white/5 uppercase tracking-widest">Week 01</div>
            <div className="p-4 text-center font-label-caps text-label-caps text-on-surface-variant border-r border-white/5 uppercase tracking-widest">Week 02</div>
            <div className="p-4 text-center font-label-caps text-label-caps text-on-surface-variant border-r border-white/5 uppercase tracking-widest">Week 03</div>
            <div className="p-4 text-center font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Week 04</div>
          </div>
          <div className="relative min-h-[320px] p-6" style={{ backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: 'calc(100% / 4) 100%' }}>
            {/* Dynamic Progress Bars */}
            <div className="space-y-6">
              {/* Bar 1 */}
              <div className="flex items-center group hover:scale-[1.01] transition-transform">
                <div className="w-32 flex-shrink-0 text-body-sm font-medium text-on-surface-variant truncate pr-4">Auth Security Scan</div>
                <div className="flex-grow relative h-8 bg-surface-container-highest/20 rounded-full overflow-hidden">
                  <div className="absolute left-[5%] w-[45%] h-full bg-gradient-to-r from-primary/60 to-primary flex items-center px-4 rounded-full shadow-[0_0_15px_rgba(208,188,255,0.3)]">
                    <span className="text-[10px] font-bold text-on-primary-container whitespace-nowrap">ST-402 • 72% Complete</span>
                  </div>
                </div>
              </div>
              {/* Bar 2 */}
              <div className="flex items-center group hover:scale-[1.01] transition-transform">
                <div className="w-32 flex-shrink-0 text-body-sm font-medium text-on-surface-variant truncate pr-4">API Load Testing</div>
                <div className="flex-grow relative h-8 bg-surface-container-highest/20 rounded-full overflow-hidden">
                  <div className="absolute left-[40%] w-[35%] h-full bg-gradient-to-r from-tertiary/60 to-tertiary flex items-center px-4 rounded-full shadow-[0_0_15px_rgba(196,193,251,0.3)]">
                    <span className="text-[10px] font-bold text-on-tertiary-container whitespace-nowrap">ST-405 • In Progress</span>
                  </div>
                </div>
              </div>
              {/* Bar 3 */}
              <div className="flex items-center group hover:scale-[1.01] transition-transform">
                <div className="w-32 flex-shrink-0 text-body-sm font-medium text-on-surface-variant truncate pr-4">UI Regression</div>
                <div className="flex-grow relative h-8 bg-surface-container-highest/20 rounded-full overflow-hidden">
                  <div className="absolute left-[15%] w-[80%] h-full bg-gradient-to-r from-secondary-container to-secondary-fixed-dim flex items-center px-4 rounded-full">
                    <span className="text-[10px] font-bold text-on-secondary-container whitespace-nowrap">ST-409 • Multi-stage Cycle</span>
                  </div>
                </div>
              </div>
              {/* Bar 4 */}
              <div className="flex items-center group hover:scale-[1.01] transition-transform">
                <div className="w-32 flex-shrink-0 text-body-sm font-medium text-on-surface-variant truncate pr-4">Data Migration</div>
                <div className="flex-grow relative h-8 bg-surface-container-highest/20 rounded-full overflow-hidden">
                  <div className="absolute left-[65%] w-[25%] h-full bg-gradient-to-r from-error/40 to-error flex items-center px-4 rounded-full shadow-[0_0_15px_rgba(255,180,171,0.3)] border border-error/50">
                    <span className="text-[10px] font-bold text-on-error flex items-center gap-1"><span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span> Critical Block</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Current Time Indicator */}
            <div className="absolute top-0 bottom-0 left-[55%] w-px bg-primary/40 shadow-[0_0_8px_rgba(208,188,255,0.8)] z-10 pointer-events-none">
              <div className="absolute -top-3 -left-1.5 w-3 h-3 bg-primary rounded-full ring-4 ring-primary/20"></div>
              <div className="absolute -top-8 -left-8 bg-primary text-on-primary-container px-2 py-1 rounded text-[10px] font-bold">TODAY</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Kanban Board */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">Quality Board</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Live execution and bug tracking</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-1 bg-surface-container-highest/50 border border-white/5 p-1 rounded-xl backdrop-blur-sm">
              {(['testing', 'functionality', 'user'] as GroupByOption[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setGroupBy(opt)}
                  className={`px-3 py-1.5 text-[10px] sm:text-xs font-semibold rounded-full transition-all ${
                    groupBy === opt
                      ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                  }`}
                >
                  {opt === 'testing' ? 'Group by QA Status' : opt === 'functionality' ? 'Group by Functionality' : 'Group by User'}
                </button>
              ))}
            </div>
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">filter_list</button>
          </div>
        </div>

      {/* Kanban Board */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 items-start pb-6 custom-scrollbar">
        {getColumns().map((col) => {
          const colRows = rows.filter((r) => getRowColId(r) === col.id);
          const isOver = overColId === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              onDragLeave={() => setOverColId(null)}
              className={`space-y-4 rounded-xl transition-all duration-200 min-h-[500px] min-w-[280px] sm:min-w-[320px] w-full flex-none snap-start ${
                isOver ? 'bg-primary/5 ring-1 ring-primary/30' : ''
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 pt-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <h3 className={`font-label-caps text-label-caps uppercase tracking-wider ${col.textClass}`}>
                    {col.title}
                  </h3>
                  <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded ${col.badgeClass}`}>
                    {colRows.length}
                  </span>
                </div>
                {/* <button className="material-symbols-outlined text-on-surface-variant text-lg hover:text-primary transition-colors">add</button> */}
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-4">
                {colRows.length === 0 ? (
                  <div className={`text-center py-10 border-2 border-dashed rounded-xl transition-colors ${
                    isOver ? 'border-primary/40 bg-primary/5' : 'border-white/5 bg-surface-container/20'
                  }`}>
                    <p className="text-body-sm text-on-surface-variant">
                      {isOver ? 'Drop here' : 'Empty Column'}
                    </p>
                  </div>
                ) : (
                  colRows.map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onEditRow(card.id)}
                      className={`glass-card p-4 rounded-xl space-y-3 cursor-grab active:cursor-grabbing hover:scale-[1.01] ${getCardStyle(card.testingStatus)} ${
                        draggingId === card.id ? 'opacity-40 scale-95' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`status-pill ${getCardRefPillStyle(card.testingStatus)}`}>
                          Ref: #{card.id.split('-')[0]}-{card.id.split('-')[4]?.substring(0,3) || '001'}
                        </span>
                        <MoreVertical className="text-on-surface-variant h-4 w-4" />
                      </div>
                      
                      <h4 className={`font-body-lg text-body-lg font-medium leading-tight ${card.testingStatus === 'Passed' ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                        {card.testPoint}
                      </h4>
                      
                      {card.howToTest && card.testingStatus !== 'Passed' && (
                        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                          {card.howToTest}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          {card.assignedUsers && card.assignedUsers.length > 0 ? (
                            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-300 ring-2 ring-white dark:ring-slate-900 shadow-sm" title={card.assignedUsers.join(', ')}>
                              {card.assignedUsers[0].substring(0, 2).toUpperCase()}
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-surface-container border border-white/5 flex items-center justify-center text-[10px] text-on-surface-variant font-bold">
                              --
                            </div>
                          )}
                          <span className="text-[10px] text-on-surface-variant">
                            {card.lastUpdated.split(' ')[0] || 'Unknown'}
                          </span>
                        </div>
                        
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${getPriorityColor(card.priority)}`}>
                          {card.priority === 'Critical' ? <span className="material-symbols-outlined text-sm">priority_high</span> :
                           card.priority === 'High' ? <span className="material-symbols-outlined text-sm">bolt</span> : null}
                          {card.testingStatus === 'Passed' ? 'RESOLVED' : getPriorityText(card.priority)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
      </section>
    </div>
  );
};
