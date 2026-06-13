import React from 'react';
import { Search, RefreshCw, PlusCircle, Settings } from 'lucide-react';
import { CustomFieldDef } from '../../store/useStore';

interface FiltersProps {
  search: string;
  setSearch: (val: string) => void;
  funcFilter: string;
  setFuncFilter: (val: string) => void;
  testFilter: string;
  setTestFilter: (val: string) => void;
  priorityFilter: string;
  setPriorityFilter: (val: string) => void;
  customFieldsDef: CustomFieldDef[];
  customFilters: Record<string, string>;
  setCustomFilter: (cfId: string, val: string) => void;
  onAddField: () => void;
  onManageFields: () => void;
}

const selectClass =
  'w-full appearance-none px-3 py-2 pr-8 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-700 dark:text-slate-200 transition-all cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 shadow-sm [background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236366f1\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")] [background-repeat:no-repeat] [background-position:right_0.75rem_center]';

export const Filters: React.FC<FiltersProps> = ({
  search,
  setSearch,
  funcFilter,
  setFuncFilter,
  testFilter,
  setTestFilter,
  priorityFilter,
  setPriorityFilter,
  customFieldsDef,
  customFilters,
  setCustomFilter,
  onAddField,
  onManageFields
}) => {
  const resetFilters = () => {
    setSearch('');
    setFuncFilter('');
    setTestFilter('');
    setPriorityFilter('');
    customFieldsDef.forEach((cf) => setCustomFilter(cf.id, ''));
  };

  const isFiltered = search || funcFilter || testFilter || priorityFilter || Object.values(customFilters).some(Boolean);

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/60 mb-6 space-y-3">
      {/* Top row: search & buttons */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search pages, URLs, assigned devs, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100 transition-all"
          />
        </div>

        {/* Dropdowns row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Functionality */}
          <div className="relative min-w-[140px]">
            <select
              value={funcFilter}
              onChange={(e) => setFuncFilter(e.target.value)}
              className={selectClass}
            >
              <option value="">All Statuses</option>
              <option value="Done">Done</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          {/* Testing Status */}
          <div className="relative min-w-[150px]">
            <select
              value={testFilter}
              onChange={(e) => setTestFilter(e.target.value)}
              className={selectClass}
            >
              <option value="">All QA Statuses</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
              <option value="Testing Pending">Testing Pending</option>
              <option value="Testing In Progress">Testing In Progress</option>
            </select>
          </div>

          {/* Priority */}
          <div className="relative min-w-[130px]">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={selectClass}
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Custom field filters */}
          {customFieldsDef
            .filter((cf) => cf.id !== 'cf-bug-id')
            .slice(0, 2)
            .map((cf) => (
              <div key={cf.id} className="relative min-w-[120px]">
                <input
                  type={cf.type === 'number' ? 'number' : cf.type === 'date' ? 'date' : 'text'}
                  placeholder={cf.name}
                  value={customFilters[cf.id] || ''}
                  onChange={(e) => setCustomFilter(cf.id, e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-700 dark:text-slate-200 transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            ))}

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl transition-all"
            >
              <RefreshCw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onAddField}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm hover:shadow transition-all"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Add Custom Column
          </button>
          <button
            onClick={onManageFields}
            title="Manage Custom Columns"
            className="flex items-center justify-center p-2 text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
