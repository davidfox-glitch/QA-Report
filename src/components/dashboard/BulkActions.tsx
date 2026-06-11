import React from 'react';
import { Trash2, Download, X } from 'lucide-react';
import { FunctionalityStatus, TestingStatus, Priority } from '../../store/useStore';

interface BulkActionsProps {
  selectedCount: number;
  onClear: () => void;
  onDeleteSelected: () => void;
  onBulkUpdate: (functionality?: FunctionalityStatus, testing?: TestingStatus, priority?: Priority) => void;
  onExportSelected: () => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onClear,
  onDeleteSelected,
  onBulkUpdate,
  onExportSelected
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 dark:bg-slate-950/90 border border-slate-700/50 backdrop-blur px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-6 animate-fade-in text-white">
      <div className="flex items-center space-x-2 border-r border-slate-700/80 pr-4">
        <button
          onClick={onClear}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <span className="text-xs font-bold font-display tracking-wide uppercase">
          {selectedCount} Selected
        </span>
      </div>

      <div className="flex items-center space-x-3 text-xs font-semibold">
        {/* Change Functionality */}
        <div className="flex flex-col">
          <label className="text-[9px] uppercase text-slate-400 font-bold mb-1">Functionality</label>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                onBulkUpdate(e.target.value as FunctionalityStatus, undefined, undefined);
                e.target.value = '';
              }
            }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="" disabled>Set Status</option>
            <option value="Done">Done</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending">Pending</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>

        {/* Change Testing */}
        <div className="flex flex-col">
          <label className="text-[9px] uppercase text-slate-400 font-bold mb-1">Testing Status</label>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                onBulkUpdate(undefined, e.target.value as TestingStatus, undefined);
                e.target.value = '';
              }
            }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="" disabled>Set QA Status</option>
            <option value="Passed">Passed</option>
            <option value="Failed">Failed</option>
            <option value="Testing Pending">Testing Pending</option>
            <option value="Testing In Progress">Testing In Progress</option>
          </select>
        </div>

        {/* Change Priority */}
        <div className="flex flex-col">
          <label className="text-[9px] uppercase text-slate-400 font-bold mb-1">Priority</label>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                onBulkUpdate(undefined, undefined, e.target.value as Priority);
                e.target.value = '';
              }
            }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="" disabled>Set Priority</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Export Selected */}
        <button
          onClick={onExportSelected}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 rounded-xl text-white transition-all self-end h-[28px] mt-auto"
        >
          <Download className="h-3 w-3" />
          Export
        </button>

        {/* Delete Selected */}
        <button
          onClick={onDeleteSelected}
          className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-750 rounded-xl text-white transition-all self-end h-[28px] mt-auto"
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </button>
      </div>
    </div>
  );
};
