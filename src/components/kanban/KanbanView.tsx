import React, { useState } from 'react';
import { useStore, TestRow, TestingStatus, FunctionalityStatus } from '../../store/useStore';
import { Badge } from '../ui/Badge';
import { User, StickyNote, Paperclip } from 'lucide-react';

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
  const { users } = useStore();
  const [groupBy, setGroupBy] = useState<GroupByOption>('testing');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColId, setOverColId] = useState<string | null>(null);

  const testingColumns = [
    { id: 'Pending', title: 'Pending Review', dot: 'bg-indigo-500' },
    { id: 'In Progress', title: 'In Progress', dot: 'bg-sky-500' },
    { id: 'Passed', title: 'Passed', dot: 'bg-emerald-500' },
    { id: 'Failed', title: 'Failed (Bugs)', dot: 'bg-rose-500' }
  ];

  const functionalityColumns = [
    { id: 'Pending', title: 'Backlog / Pending', dot: 'bg-slate-400' },
    { id: 'Working', title: 'Operational', dot: 'bg-emerald-500' },
    { id: 'Partially Working', title: 'Partially Working', dot: 'bg-amber-500' },
    { id: 'Not Working', title: 'Broken', dot: 'bg-rose-500' }
  ];

  const getColDot = (index: number) => {
    const dots = ['bg-indigo-500', 'bg-sky-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-violet-500'];
    return dots[index % dots.length];
  };

  const userColumns = [
    ...users.map((u, i) => ({ id: u.name, title: u.name, dot: getColDot(i) })),
    { id: 'unassigned', title: 'Unassigned', dot: 'bg-slate-400' }
  ];

  const getColumns = () => {
    if (groupBy === 'testing') return testingColumns;
    if (groupBy === 'functionality') return functionalityColumns;
    return userColumns;
  };

  const moveCard = (cardId: string, targetColId: string) => {
    if (groupBy === 'testing') onQuickUpdate(cardId, { testingStatus: targetColId as TestingStatus });
    else if (groupBy === 'functionality') onQuickUpdate(cardId, { functionalityStatus: targetColId as FunctionalityStatus });
    else onQuickUpdate(cardId, { assignedUser: targetColId === 'unassigned' ? '' : targetColId });
  };

  const getRowColId = (row: TestRow) => {
    if (groupBy === 'testing') return row.testingStatus;
    if (groupBy === 'functionality') return row.functionalityStatus;
    return row.assignedUser || 'unassigned';
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

  return (
    <div className="space-y-4">
      {/* Group By Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-xl">
          {(['testing', 'functionality', 'user'] as GroupByOption[]).map((opt) => (
            <button
              key={opt}
              onClick={() => setGroupBy(opt)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                groupBy === opt
                  ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {opt === 'testing' ? 'Group by Testing Status' : opt === 'functionality' ? 'Group by Dev Status' : 'Group by User'}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
          🖱️ Drag cards between columns to move them
        </p>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {getColumns().map((col) => {
          const colRows = rows.filter((r) => getRowColId(r) === col.id);
          const isOver = overColId === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              onDragLeave={() => setOverColId(null)}
              className={`glass-panel border rounded-2xl p-4 flex flex-col max-h-[75vh] transition-all duration-200 ${
                isOver
                  ? 'border-indigo-500/60 bg-indigo-500/5 dark:bg-indigo-500/5 ring-2 ring-indigo-500/20'
                  : 'border-slate-200/60 dark:border-slate-800/60'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/70 pb-2.5 mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                  <h4 className="text-xs font-bold font-display uppercase tracking-wide text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                    {col.title}
                  </h4>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                  {colRows.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
                {colRows.length === 0 ? (
                  <div className={`text-center py-10 border-2 border-dashed rounded-xl transition-colors ${
                    isOver ? 'border-indigo-400/60 bg-indigo-50/10' : 'border-slate-200/50 dark:border-slate-800/40'
                  }`}>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
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
                      className={`glass-card border border-slate-200/50 dark:border-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 p-3.5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-3 group select-none ${
                        draggingId === card.id ? 'opacity-40 scale-95 rotate-1' : 'hover:scale-[1.02]'
                      }`}
                    >
                      {/* Priority + Date */}
                      <div className="flex items-center justify-between">
                        <Badge type="priority" value={card.priority} />
                        <span className="text-[9px] text-slate-400 dark:text-slate-500">
                          {card.lastUpdated.split(' ')[0]}
                        </span>
                      </div>

                      {/* Title & Module */}
                      <div>
                        <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                          {card.testPoint}
                        </h5>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                          {card.moduleName}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 dark:border-slate-800/60 pt-2.5">
                        {groupBy !== 'user' && card.assignedUser && (
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <User className="h-2.5 w-2.5 text-indigo-500" />
                            {card.assignedUser}
                          </span>
                        )}
                        <div className="flex items-center space-x-2 ml-auto shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); onOpenNotes(card.id); }}
                            className="flex items-center space-x-0.5 text-slate-400 hover:text-amber-500 transition-colors"
                            title="Notes"
                          >
                            <StickyNote className="h-3 w-3" />
                            <span>{card.notes.length}</span>
                          </button>
                          <div className="flex items-center space-x-0.5 text-slate-400">
                            <Paperclip className="h-3 w-3" />
                            <span>{card.attachments.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
