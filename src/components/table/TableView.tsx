import React from 'react';
import { useStore, TestRow, CustomFieldDef, FunctionalityStatus, TestingStatus, Priority } from '../../store/useStore';
import { Badge } from '../ui/Badge';
import { Edit, Trash2, StickyNote, Paperclip, ExternalLink, User } from 'lucide-react';

interface TableViewProps {
  rows: TestRow[];
  selectedRowIds: string[];
  customFieldsDef: CustomFieldDef[];
  toggleSelectRow: (id: string) => void;
  toggleSelectAllRows: (ids: string[]) => void;
  onEditRow: (id: string) => void;
  onDeleteRow: (id: string) => void;
  onOpenNotes: (id: string) => void;
  onQuickUpdate: (id: string, updates: Partial<TestRow>) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  rows,
  selectedRowIds,
  customFieldsDef,
  toggleSelectRow,
  toggleSelectAllRows,
  onEditRow,
  onDeleteRow,
  onOpenNotes,
  onQuickUpdate
}) => {
  const { users } = useStore();
  const rowIdsInView = rows.map((r) => r.id);
  const allSelected = rowIdsInView.length > 0 && rowIdsInView.every((id) => selectedRowIds.includes(id));

  return (
    <div className="glass-panel border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          {/* Table Headers */}
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold font-display uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <th className="px-4 py-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => toggleSelectAllRows(rowIdsInView)}
                  className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500/30 h-4 w-4 cursor-pointer"
                />
              </th>
              <th className="px-5 py-3.5 min-w-[200px]">Test Point / Module</th>
              <th className="px-5 py-3.5 min-w-[150px]">Expected vs Actual</th>
              <th className="px-5 py-3.5">Functionality</th>
              <th className="px-5 py-3.5">QA Status</th>
              <th className="px-5 py-3.5">Priority</th>
              <th className="px-5 py-3.5">Assignee</th>
              
              {/* Custom Field Columns */}
              {customFieldsDef.map((field) => (
                <th key={field.id} className="px-5 py-3.5 truncate max-w-[120px]">
                  {field.name}
                </th>
              ))}
              
              <th className="px-5 py-3.5 text-center">Notes</th>
              <th className="px-5 py-3.5 text-center">Files</th>
              <th className="px-5 py-3.5">Updated</th>
              <th className="px-5 py-3.5 text-center w-24">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={11 + customFieldsDef.length}
                  className="text-center py-16 text-slate-500 dark:text-slate-400 text-sm"
                >
                  No QA records found. Try clearing filters or importing a sheet.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const isSelected = selectedRowIds.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors ${
                      isSelected ? 'bg-indigo-500/5 dark:bg-indigo-500/10' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(row.id)}
                        className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500/30 h-4 w-4 cursor-pointer"
                      />
                    </td>

                    {/* Test Point & URL */}
                    <td className="px-5 py-3 max-w-[280px]">
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-xs font-semibold text-slate-850 dark:text-slate-200 block truncate" title={row.testPoint}>
                          {row.testPoint}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          {row.moduleName || 'General Module'}
                        </span>
                        {row.url && (
                          <a
                            href={row.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 truncate flex items-center gap-0.5"
                          >
                            {row.url}
                            <ExternalLink className="h-2 w-2" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* How to test, expected, actual */}
                    <td className="px-5 py-3 max-w-[250px]">
                      <div className="flex flex-col space-y-1 text-[10px]">
                        {row.howToTest && (
                          <p className="text-slate-500 dark:text-slate-400 line-clamp-1">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Test:</span> {row.howToTest}
                          </p>
                        )}
                        <p className="text-slate-650 dark:text-slate-400 truncate">
                          <span className="font-bold text-slate-700 dark:text-slate-300">Exp:</span> {row.expectedResult}
                        </p>
                        {row.actualResult && (
                          <p className="text-rose-500/90 truncate">
                            <span className="font-bold">Act:</span> {row.actualResult}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Functionality Status (Dropdown inline editable) */}
                    <td className="px-5 py-3">
                      <select
                        value={row.functionalityStatus}
                        onChange={(e) => onQuickUpdate(row.id, { functionalityStatus: e.target.value as FunctionalityStatus })}
                        className="bg-transparent border-none text-xs font-semibold p-0.5 focus:ring-0 cursor-pointer text-slate-800 dark:text-slate-200 outline-none hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-1.5 py-0.5"
                      >
                        <option value="Working" className="dark:bg-slate-900">🟢 Working</option>
                        <option value="Partially Working" className="dark:bg-slate-900">🟡 Partially</option>
                        <option value="Not Working" className="dark:bg-slate-900">🔴 Broken</option>
                        <option value="Pending" className="dark:bg-slate-900">⚪ Pending</option>
                      </select>
                    </td>

                    {/* Testing Status (Dropdown inline editable) */}
                    <td className="px-5 py-3">
                      <select
                        value={row.testingStatus}
                        onChange={(e) => onQuickUpdate(row.id, { testingStatus: e.target.value as TestingStatus })}
                        className="bg-transparent border-none text-xs font-semibold p-0.5 focus:ring-0 cursor-pointer text-slate-800 dark:text-slate-200 outline-none hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-1.5 py-0.5"
                      >
                        <option value="Passed" className="dark:bg-slate-900">🟢 Passed</option>
                        <option value="Failed" className="dark:bg-slate-900">🔴 Failed</option>
                        <option value="Pending" className="dark:bg-slate-900">⚪ Pending</option>
                        <option value="In Progress" className="dark:bg-slate-900">🟡 In Progress</option>
                      </select>
                    </td>

                    {/* Priority (Dropdown inline editable) */}
                    <td className="px-5 py-3">
                      <select
                        value={row.priority}
                        onChange={(e) => onQuickUpdate(row.id, { priority: e.target.value as Priority })}
                        className="bg-transparent border-none text-xs font-semibold p-0.5 focus:ring-0 cursor-pointer text-slate-800 dark:text-slate-200 outline-none hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-1.5 py-0.5"
                      >
                        <option value="Critical" className="dark:bg-slate-900">🔥 Critical</option>
                        <option value="High" className="dark:bg-slate-900">🟠 High</option>
                        <option value="Medium" className="dark:bg-slate-900">🔵 Medium</option>
                        <option value="Low" className="dark:bg-slate-900">⚪ Low</option>
                      </select>
                    </td>

                    {/* Assignee selection */}
                    <td className="px-5 py-3">
                      <select
                        value={row.assignedUser || ''}
                        onChange={(e) => onQuickUpdate(row.id, { assignedUser: e.target.value })}
                        className="bg-transparent border-none text-xs font-semibold p-0.5 focus:ring-0 cursor-pointer text-slate-805 dark:text-slate-250 outline-none hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-1.5 py-0.5"
                      >
                        <option value="" className="dark:bg-slate-900">👤 Unassigned</option>
                        {users.map(u => (
                          <option key={u.id} value={u.name} className="dark:bg-slate-900">
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Custom Fields values */}
                    {customFieldsDef.map((field) => {
                      const val = row.customFields[field.id];
                      return (
                        <td key={field.id} className="px-5 py-3 text-xs text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                          {val !== undefined && val !== null ? String(val) : '-'}
                        </td>
                      );
                    })}

                    {/* Notes Trigger */}
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => onOpenNotes(row.id)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                          row.notes.length > 0
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-650 dark:hover:text-slate-300'
                        }`}
                        title="Manage Notes"
                      >
                        <StickyNote className="h-3.5 w-3.5" />
                        <span>{row.notes.length}</span>
                      </button>
                    </td>

                    {/* Attachments Trigger */}
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => onEditRow(row.id)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                          row.attachments.length > 0
                            ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-650 dark:hover:text-slate-300'
                        }`}
                        title="Upload/View Attachments"
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                        <span>{row.attachments.length}</span>
                      </button>
                    </td>

                    {/* Last Updated */}
                    <td className="px-5 py-3">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap block">
                        {row.lastUpdated}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => onEditRow(row.id)}
                          className="p-1 rounded-lg text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          title="Edit Row"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete this test record?`)) {
                              onDeleteRow(row.id);
                            }
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-colors"
                          title="Delete Row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
