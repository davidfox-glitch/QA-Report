import React from 'react';
import { useStore, CustomFieldDef } from '../../store/useStore';
import { Search, RefreshCw, Plus, Download, Settings, ListFilter, Activity, SlidersHorizontal } from 'lucide-react';

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
  onAddTestPoint: () => void;
}

const selectClass = "bg-transparent border-none text-body-sm focus:ring-0 cursor-pointer outline-none w-full text-slate-500 dark:text-slate-400 focus:text-primary transition-colors";

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
  onManageFields,
  onAddTestPoint
}) => {
  const { settings, projects, activeProjectId } = useStore();
  const activeProjectName = projects.find(p => p.id === activeProjectId)?.name || settings.projectName;

  const resetFilters = () => {
    setSearch('');
    setFuncFilter('');
    setTestFilter('');
    setPriorityFilter('');
    customFieldsDef.forEach((cf) => setCustomFilter(cf.id, ''));
  };

  const isFiltered = search || funcFilter || testFilter || priorityFilter || Object.values(customFilters).some(Boolean);

  return (
    <section className="mb-6 bg-white/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 sm:p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
      
      {/* Top Row: Title/Subtitle (Left) + Action Buttons (Right) */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Test Report: {activeProjectName}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-body-lg text-body-lg mt-1">Detailed validation summary for the current module.</p>
        </div>

        <div className="flex flex-wrap items-center lg:justify-end gap-2">
          <button
            onClick={onAddField}
            className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-[11px] font-semibold px-2.5 py-1.5 bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg"
          >
            <Plus className="h-3.5 w-3.5" /> Add Field
          </button>
          <button
            onClick={onManageFields}
            className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-[11px] font-semibold px-2.5 py-1.5 bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg"
          >
            <Settings className="h-3.5 w-3.5" /> Manage Fields
          </button>
          <button
            onClick={onAddTestPoint}
            className="bg-primary text-on-primary-container px-3 py-1.5 rounded-lg font-bold text-[11px] hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md shadow-primary/20 border border-primary/20"
          >
            <Plus className="h-3.5 w-3.5" /> Add Test Point
          </button>
          <button className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-slate-100 dark:bg-slate-700 transition-colors text-slate-800 dark:text-slate-100">
            <Download className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-bold">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Search Bar (Left) + Dropdown Filters (Right) */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        
        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 w-full lg:max-w-xs xl:max-w-md">
          <Search className="h-4 w-4 text-primary" />
          <input
            type="text"
            placeholder="Search points..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-body-sm focus:ring-0 outline-none w-full text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap lg:flex-nowrap gap-3 w-full lg:w-auto">
          {/* Functionality */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 flex-1 lg:w-48">
            <ListFilter className="h-4 w-4 text-primary" />
            <select
              value={funcFilter}
              onChange={(e) => setFuncFilter(e.target.value)}
              className={selectClass}
            >
              <option value="" className="bg-white dark:bg-slate-800">All Functionalities</option>
              <option value="Working" className="bg-white dark:bg-slate-800">Working</option>
              <option value="Partially Working" className="bg-white dark:bg-slate-800">Partially Working</option>
              <option value="Not Working" className="bg-white dark:bg-slate-800">Not Working</option>
              <option value="Pending" className="bg-white dark:bg-slate-800">Pending</option>
            </select>
          </div>

          {/* QA Status */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 flex-1 lg:w-48">
            <Activity className="h-4 w-4 text-primary" />
            <select
              value={testFilter}
              onChange={(e) => setTestFilter(e.target.value)}
              className={selectClass}
            >
              <option value="" className="bg-white dark:bg-slate-800">All QA Statuses</option>
              <option value="Passed" className="bg-white dark:bg-slate-800">Passed</option>
              <option value="Failed" className="bg-white dark:bg-slate-800">Failed</option>
              <option value="Pending" className="bg-white dark:bg-slate-800">Pending</option>
              <option value="In Progress" className="bg-white dark:bg-slate-800">In Progress</option>
            </select>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 flex-1 lg:w-40">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={selectClass}
            >
              <option value="" className="bg-white dark:bg-slate-800">All Priorities</option>
              <option value="Critical" className="bg-white dark:bg-slate-800">Critical</option>
              <option value="High" className="bg-white dark:bg-slate-800">High</option>
              <option value="Medium" className="bg-white dark:bg-slate-800">Medium</option>
              <option value="Low" className="bg-white dark:bg-slate-800">Low</option>
            </select>
          </div>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center justify-center gap-1.5 bg-error-container/20 border border-error/30 text-error px-4 py-2.5 rounded-xl hover:bg-error-container/40 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
