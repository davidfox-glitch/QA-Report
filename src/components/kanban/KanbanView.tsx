import React, { useState } from 'react';
import { useStore, TestRow, TestingStatus, FunctionalityStatus, Priority } from '../../store/useStore';
import { Badge } from '../ui/Badge';
import { User, StickyNote, Paperclip, ChevronRight, ArrowRight } from 'lucide-react';

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

  // Groups and their human-readable labels
  const testingColumns: { id: string; title: string; color: string }[] = [
    { id: 'Pending', title: 'Pending Review', color: 'border-t-indigo-500 bg-indigo-500/5' },
    { id: 'In Progress', title: 'In Progress', color: 'border-t-sky-500 bg-sky-500/5' },
    { id: 'Passed', title: 'Passed', color: 'border-t-emerald-500 bg-emerald-500/5' },
    { id: 'Failed', title: 'Failed (Bugs)', color: 'border-t-rose-500 bg-rose-500/5' }
  ];

  const functionalityColumns: { id: string; title: string; color: string }[] = [
    { id: 'Pending', title: 'Backlog / Pending', color: 'border-t-slate-400 bg-slate-500/5' },
    { id: 'Working', title: 'Operational / Working', color: 'border-t-emerald-500 bg-emerald-500/5' },
    { id: 'Partially Working', title: 'Partially Working', color: 'border-t-amber-500 bg-amber-500/5' },
    { id: 'Not Working', title: 'Broken / Not Working', color: 'border-t-rose-500 bg-rose-500/5' }
  ];

  // Dynamic user columns color helper
  const getColColor = (index: number) => {
    const colors = [
      'border-t-indigo-500 bg-indigo-500/5',
      'border-t-sky-500 bg-sky-500/5',
      'border-t-emerald-500 bg-emerald-500/5',
      'border-t-rose-500 bg-rose-500/5',
      'border-t-amber-500 bg-amber-500/5',
      'border-t-violet-500 bg-violet-500/5',
      'border-t-fuchsia-500 bg-fuchsia-500/5',
    ];
    return colors[index % colors.length];
  };

  // Build dynamic user columns based on users list
  const userColumns: { id: string; title: string; color: string }[] = [];
  users.forEach((u, index) => {
    userColumns.push({
      id: u.name,
      title: u.name,
      color: getColColor(index)
    });
  });
  // Add "Unassigned" column
  userColumns.push({
    id: 'unassigned',
    title: 'Unassigned',
    color: 'border-t-slate-400 bg-slate-500/5'
  });

  const moveCard = (cardId: string, targetColId: string) => {
    if (groupBy === 'testing') {
      onQuickUpdate(cardId, { testingStatus: targetColId as TestingStatus });
    } else if (groupBy === 'functionality') {
      onQuickUpdate(cardId, { functionalityStatus: targetColId as FunctionalityStatus });
    } else if (groupBy === 'user') {
      onQuickUpdate(cardId, { assignedUser: targetColId === 'unassigned' ? '' : targetColId });
    }
  };

  const getColumns = () => {
    if (groupBy === 'testing') return testingColumns;
    if (groupBy === 'functionality') return functionalityColumns;
    return userColumns;
  };

  return (
    <div className="space-y-4">
      {/* Board Group Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-xl">
          <button
            onClick={() => setGroupBy('testing')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              groupBy === 'testing'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
            }`}
          >
            Group by Testing Status
          </button>
          <button
            onClick={() => setGroupBy('functionality')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              groupBy === 'functionality'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
            }`}
          >
            Group by Dev Status
          </button>
          <button
            onClick={() => setGroupBy('user')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              groupBy === 'user'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
            }`}
          >
            Group by User
          </button>
        </div>
        
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          💡 Drag & drop is supported via status select controls on card footers.
        </p>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {/* Render columns */}
        {getColumns().map((col) => {
          // Filter rows belonging to this column
          const colRows = rows.filter((r) => {
            if (groupBy === 'testing') {
              return r.testingStatus === col.id;
            } else if (groupBy === 'functionality') {
              return r.functionalityStatus === col.id;
            } else {
              const val = String(r.assignedUser || '').trim();
              if (col.id === 'unassigned') return !val;
              return val === col.id;
            }
          });

          return (
            <div
              key={col.id}
              className="glass-panel border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 flex flex-col max-h-[75vh]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2 mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${
                    col.id === 'Passed' || col.id === 'Working' ? 'bg-emerald-500' :
                    col.id === 'Failed' || col.id === 'Not Working' ? 'bg-rose-500' :
                    col.id === 'In Progress' || col.id === 'Partially Working' ? 'bg-sky-500' : 'bg-indigo-500'
                  }`} />
                  <h4 className="text-xs font-bold font-display uppercase tracking-wide text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                    {col.title}
                  </h4>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-455 px-2 py-0.5 rounded-full">
                  {colRows.length}
                </span>
              </div>

              {/* Column Cards (scrollable list) */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colRows.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-200/50 dark:border-slate-800/40 rounded-xl">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Empty Column
                    </p>
                  </div>
                ) : (
                  colRows.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => onEditRow(card.id)}
                      className="glass-card hover:scale-[1.02] border border-slate-200/50 dark:border-slate-800/40 hover:border-slate-300 dark:hover:border-slate-750 p-3.5 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer space-y-3 group"
                    >
                      {/* Priority and Page Name */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge type="priority" value={card.priority} />
                          <span className="text-[9px] text-slate-400 dark:text-slate-500">
                            {card.lastUpdated.split(' ')[0]}
                          </span>
                        </div>
                        <h5 className="text-xs font-semibold text-slate-850 dark:text-slate-200 leading-snug group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                          {card.testPoint}
                        </h5>
                        <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">
                          {card.moduleName}
                        </p>
                        {card.url && (
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate" title={card.url}>
                            {card.url}
                          </p>
                        )}
                      </div>

                      {/* Details row: notes counts, etc. */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-450 border-t border-slate-100 dark:border-slate-850/60 pt-2.5">
                        {/* Display User / QA Owner Name on Card if grouped by something else */}
                        {groupBy !== 'user' && card.assignedUser && (
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <User className="h-2.5 w-2.5 text-indigo-500" />
                            {card.assignedUser}
                          </span>
                        )}
                        <div className="flex items-center space-x-2 ml-auto shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenNotes(card.id);
                            }}
                            className="flex items-center space-x-0.5 text-slate-400 hover:text-amber-500"
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

                      {/* Dropdown to move card (for accessibility & keyboard control) */}
                      <div className="border-t border-slate-100 dark:border-slate-850/60 pt-2 flex items-center justify-between">
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider flex items-center">
                          Move to <ArrowRight className="h-2 w-2 ml-1" />
                        </span>
                        <select
                          value={groupBy === 'user' ? (card.assignedUser || 'unassigned') : col.id}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => moveCard(card.id, e.target.value)}
                          className="bg-transparent border-none text-[10px] font-bold p-0.5 focus:ring-0 cursor-pointer text-indigo-500 dark:text-indigo-400 outline-none hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-1"
                        >
                          {getColumns().map((opt) => (
                            <option key={opt.id} value={opt.id} className="text-slate-800 dark:text-slate-200">
                              {opt.title}
                            </option>
                          ))}
                        </select>
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
