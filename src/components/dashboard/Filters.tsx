import React from 'react';
import { useStore, CustomFieldDef } from '../../store/useStore';
import { Search, RefreshCw, Plus, Download, Settings } from 'lucide-react';

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

const selectClass = "bg-transparent border-none text-body-sm focus:ring-0 cursor-pointer outline-none w-full text-on-surface-variant focus:text-primary transition-colors";

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
    <section className="mb-6 flex flex-col xl:flex-row xl:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-2 duration-500">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Test Report: {activeProjectName}</h1>
        <p className="text-on-surface-variant font-body-lg text-body-lg mt-2">Detailed validation summary for the current module.</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-surface-container-high px-3 py-2 rounded-lg border border-white/5 flex-grow">
            <Search className="h-4 w-4 text-primary" />
            <input
              type="text"
              placeholder="Search points..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none text-body-sm focus:ring-0 outline-none w-full text-on-surface"
            />
          </div>

          {/* Functionality */}
          <div className="flex items-center gap-2 bg-surface-container-high px-3 py-2 rounded-lg border border-white/5">
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 0" }}>filter_list</span>
            <select
              value={funcFilter}
              onChange={(e) => setFuncFilter(e.target.value)}
              className={selectClass}
            >
              <option value="" className="bg-surface-container">All Functionalities</option>
              <option value="Working" className="bg-surface-container">Working</option>
              <option value="Partially Working" className="bg-surface-container">Partially Working</option>
              <option value="Not Working" className="bg-surface-container">Not Working</option>
              <option value="Pending" className="bg-surface-container">Pending</option>
            </select>
          </div>

          {/* QA Status */}
          <div className="flex items-center gap-2 bg-surface-container-high px-3 py-2 rounded-lg border border-white/5">
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 0" }}>bolt</span>
            <select
              value={testFilter}
              onChange={(e) => setTestFilter(e.target.value)}
              className={selectClass}
            >
              <option value="" className="bg-surface-container">All QA Statuses</option>
              <option value="Passed" className="bg-surface-container">Passed</option>
              <option value="Failed" className="bg-surface-container">Failed</option>
              <option value="Pending" className="bg-surface-container">Pending</option>
              <option value="In Progress" className="bg-surface-container">In Progress</option>
            </select>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-2 bg-surface-container-high px-3 py-2 rounded-lg border border-white/5">
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 0" }}>priority</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={selectClass}
            >
              <option value="" className="bg-surface-container">All Priorities</option>
              <option value="Critical" className="bg-surface-container">Critical</option>
              <option value="High" className="bg-surface-container">High</option>
              <option value="Medium" className="bg-surface-container">Medium</option>
              <option value="Low" className="bg-surface-container">Low</option>
            </select>
          </div>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 bg-error-container/20 border border-error/30 text-error px-4 py-2 rounded-lg hover:bg-error-container/40 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-body-sm font-medium">Reset</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={onAddField}
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors text-body-sm"
          >
            <Plus className="h-4 w-4" /> Add Field
          </button>
          <button
            onClick={onManageFields}
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors text-body-sm"
          >
            <Settings className="h-4 w-4" /> Manage Fields
          </button>
          <button
            onClick={onAddTestPoint}
            className="bg-primary text-on-primary-container px-4 py-2 rounded-lg font-bold text-body-sm hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Test Point
          </button>
          <button className="bg-surface-container-highest border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-surface-bright transition-colors text-on-surface">
            <Download className="h-4 w-4 text-primary" />
            <span className="text-body-sm font-medium">Export CSV</span>
          </button>
        </div>
      </div>
    </section>
  );
};
