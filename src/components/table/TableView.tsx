import React, { useState } from 'react';
import { useStore, TestRow, CustomFieldDef, FunctionalityStatus, TestingStatus, Priority } from '../../store/useStore';
import { Edit, Trash2, StickyNote, Paperclip, ChevronDown } from 'lucide-react';
import { FilesModal } from './FilesModal';

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
  onOpenDetails: (row: TestRow) => void;
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
  onQuickUpdate,
  onOpenDetails
}) => {
  const { users, modules } = useStore();
  const [activeFilesRowId, setActiveFilesRowId] = useState<string | null>(null);
  const rowIdsInView = rows.map((r) => r.id);
  const allSelected = rowIdsInView.length > 0 && rowIdsInView.every((id) => selectedRowIds.includes(id));
  const uniqueRoles = Array.from(new Set(users.map(u => u.role)));

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'Passed':
      case 'Working':
        return 'status-passed text-[#4ade80] bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)]';
      case 'Failed':
      case 'Not Working':
        return 'status-failed text-[#f87171] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]';
      case 'In Progress':
      case 'Partially Working':
        return 'status-pill text-[#60a5fa] bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)]';
      case 'Pending':
      default:
        return 'status-pending text-[#d0bcff] bg-[rgba(160,120,255,0.1)] border border-[rgba(160,120,255,0.2)]';
    }
  };

  const getPriorityDotColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]';
      case 'High': return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]';
      case 'Medium': return 'bg-blue-500';
      case 'Low': return 'bg-slate-400';
      default: return 'bg-slate-500';
    }
  };

  return (
    <section className="glass-panel rounded-xl overflow-hidden mb-8 shadow-2xl animate-fade-in border border-white/5">
      <div className="overflow-x-auto custom-scrollbar w-full">
        <table className="w-full text-left border-collapse">
          {/* Table Headers */}
          <thead>
            <tr className="bg-surface-container-lowest/80 border-b border-white/10 backdrop-blur-md">
              <th className="px-4 py-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => toggleSelectAllRows(rowIdsInView)}
                  className="rounded border-white/20 bg-surface-container text-primary focus:ring-primary/50 h-3.5 w-3.5 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider min-w-[180px]">Test Point / Module</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider min-w-[130px]">Expected vs Actual</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Functionality</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">QA Status</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Priority</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Assignee</th>
              
              {/* Custom Field Columns */}
              {customFieldsDef.map((field) => (
                <th key={field.id} className="px-4 py-3 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider truncate max-w-[120px]">
                  {field.name}
                </th>
              ))}
              
              <th className="px-4 py-3 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider text-center">Notes</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider text-center">Files</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Updated</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider text-center w-20">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-white/5">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={11 + customFieldsDef.length}
                  className="text-center py-16 text-on-surface-variant text-body-sm"
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
                    className={`interactive-row transition-colors group ${
                      isSelected ? 'bg-primary/10' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(row.id)}
                        className="rounded border-white/20 bg-surface-container text-primary focus:ring-primary/50 h-4 w-4 cursor-pointer opacity-30 group-hover:opacity-100 transition-opacity"
                        style={{ opacity: isSelected ? 1 : undefined }}
                      />
                    </td>

                    {/* Test Point */}
                    <td className="px-4 py-3 max-w-[280px]">
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-body-sm font-medium text-primary block truncate" title={row.testPoint}>
                          {row.testPoint}
                        </span>
                        <span className="text-[11px] text-on-surface-variant block">
                          {modules.find(m => m.id === row.moduleId)?.name || 'General Module'}
                        </span>
                      </div>
                    </td>

                    {/* How to test, expected, actual */}
                    <td 
                      className="px-4 py-3 max-w-[300px] cursor-pointer hover:bg-white/5 transition-colors rounded-lg"
                      onClick={() => onOpenDetails(row)}
                      title="Click to view full details"
                    >
                      <div className="flex flex-col space-y-1 text-body-sm">
                        {row.howToTest && (
                          <p className="text-on-surface-variant line-clamp-2">
                            <span className="font-medium text-on-surface">Test:</span> {row.howToTest}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Functionality Status (Dropdown inline editable) */}
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center relative rounded-md ${getStatusColorClass(row.functionalityStatus)}`}>
                        <select
                          value={row.functionalityStatus}
                          onChange={(e) => onQuickUpdate(row.id, { functionalityStatus: e.target.value as FunctionalityStatus })}
                          className="bg-transparent border-none focus:ring-0 cursor-pointer outline-none appearance-none hover:brightness-110 text-[11px] font-bold tracking-wider uppercase pl-2 pr-6 py-1"
                        >
                          <option value="Working" className="bg-surface text-on-surface normal-case">Working</option>
                          <option value="Partially Working" className="bg-surface text-on-surface normal-case">Partially Working</option>
                          <option value="Not Working" className="bg-surface text-on-surface normal-case">Not Working</option>
                          <option value="Pending" className="bg-surface text-on-surface normal-case">Pending</option>
                        </select>
                        <ChevronDown className="absolute right-1.5 w-3 h-3 pointer-events-none opacity-60" />
                      </div>
                    </td>

                    {/* Testing Status (Dropdown inline editable) */}
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center relative rounded-md ${getStatusColorClass(row.testingStatus)}`}>
                        <select
                          value={row.testingStatus}
                          onChange={(e) => onQuickUpdate(row.id, { testingStatus: e.target.value as TestingStatus })}
                          className="bg-transparent border-none focus:ring-0 cursor-pointer outline-none appearance-none hover:brightness-110 text-[11px] font-bold tracking-wider uppercase pl-2 pr-6 py-1"
                        >
                          <option value="Passed" className="bg-surface text-on-surface normal-case">Passed</option>
                          <option value="Failed" className="bg-surface text-on-surface normal-case">Failed</option>
                          <option value="Pending" className="bg-surface text-on-surface normal-case">Pending</option>
                          <option value="In Progress" className="bg-surface text-on-surface normal-case">In Progress</option>
                        </select>
                        <ChevronDown className="absolute right-1.5 w-3 h-3 pointer-events-none opacity-60" />
                      </div>
                    </td>

                    {/* Priority (Dropdown inline editable) */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 relative group/priority pr-4">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityDotColor(row.priority)}`}></span>
                        <select
                          value={row.priority}
                          onChange={(e) => onQuickUpdate(row.id, { priority: e.target.value as Priority })}
                          className="bg-transparent border-none text-body-sm p-0 focus:ring-0 cursor-pointer text-on-surface outline-none appearance-none hover:text-primary transition-colors flex-grow"
                        >
                          <option value="Critical" className="bg-surface text-on-surface">P0 - Critical</option>
                          <option value="High" className="bg-surface text-on-surface">P1 - High</option>
                          <option value="Medium" className="bg-surface text-on-surface">P2 - Medium</option>
                          <option value="Low" className="bg-surface text-on-surface">P3 - Low</option>
                        </select>
                        <ChevronDown className="absolute right-0 w-3 h-3 pointer-events-none opacity-50 text-on-surface-variant group-hover/priority:text-primary transition-colors" />
                      </div>
                    </td>

                    {/* Assigned Role selection */}
                    <td className="px-4 py-3">
                      <div className="relative inline-flex items-center w-full">
                        <select
                          value={row.assignedRole || ''}
                          onChange={(e) => {
                            onQuickUpdate(row.id, { assignedRole: e.target.value, assignedUsers: [] });
                          }}
                          className="bg-transparent border-none text-body-sm p-0 pr-6 focus:ring-0 cursor-pointer text-on-surface-variant outline-none hover:text-primary transition-colors appearance-none w-full"
                        >
                          <option value="" className="bg-surface text-on-surface">Any Role</option>
                          {uniqueRoles.map(role => (
                            <option key={role} value={role} className="bg-surface text-on-surface">
                              {role}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1 w-3 h-3 pointer-events-none opacity-50 text-on-surface-variant" />
                      </div>
                    </td>

                    {/* Assignee selection */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        {row.assignedUsers && row.assignedUsers.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {row.assignedUsers.map(user => (
                              <div key={user} className="flex items-center gap-1 text-[10px] bg-tertiary-container/30 text-on-tertiary-container border border-tertiary-container/50 px-1.5 py-0.5 rounded-md">
                                <span>{user}</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onQuickUpdate(row.id, { assignedUsers: row.assignedUsers!.filter(u => u !== user) });
                                  }}
                                  className="text-on-tertiary-container/60 hover:text-error transition-colors"
                                  title="Remove Assignee"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="relative inline-flex items-center w-full max-w-[150px]">
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                const newUsers = [...(row.assignedUsers || []), e.target.value];
                                onQuickUpdate(row.id, { assignedUsers: Array.from(new Set(newUsers)) });
                              }
                            }}
                            className={`bg-transparent border-none text-body-sm p-0 pr-6 focus:ring-0 cursor-pointer outline-none hover:text-primary transition-colors appearance-none w-full ${!row.assignedUsers?.length ? 'text-on-surface-variant' : 'text-on-surface'}`}
                          >
                            <option value="" className="bg-surface text-on-surface">Add Assignee...</option>
                            {(row.assignedRole ? users.filter(u => u.role === row.assignedRole) : users)
                              .filter(u => !(row.assignedUsers || []).includes(u.name))
                              .map(u => (
                              <option key={u.id} value={u.name} className="bg-surface text-on-surface">
                                {u.name} ({u.email}) - {u.role}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-1 w-3 h-3 pointer-events-none opacity-50 text-on-surface-variant" />
                        </div>
                      </div>
                    </td>

                    {/* Custom Fields values */}
                    {customFieldsDef.map((field) => {
                      const val = row.customFields[field.id];
                      return (
                        <td key={field.id} className="px-4 py-3 text-body-sm text-on-surface-variant truncate max-w-[120px]">
                          {val !== undefined && val !== null ? String(val) : '-'}
                        </td>
                      );
                    })}

                    {/* Notes Trigger */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onOpenNotes(row.id)}
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                          row.notes.length > 0
                            ? 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20 shadow-sm shadow-primary/10'
                            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface border border-transparent'
                        }`}
                        title="Manage Notes"
                      >
                        <StickyNote className="h-3.5 w-3.5" />
                        <span>{row.notes.length}</span>
                      </button>
                    </td>

                    {/* Files Trigger */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setActiveFilesRowId(row.id)}
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                          (row.files?.length || 0) > 0
                            ? 'bg-indigo-500/20 text-indigo-500 hover:bg-indigo-500/30 border border-indigo-500/20 shadow-sm shadow-indigo-500/10'
                            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface border border-transparent'
                        }`}
                        title="Manage Files"
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                        <span>{row.files?.length || 0}</span>
                      </button>
                    </td>

                    {/* Last Updated */}
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-on-surface-variant whitespace-nowrap block">
                        {row.lastUpdated}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditRow(row.id)}
                          className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface-variant hover:text-primary transition-colors border border-white/5"
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
                          className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface-variant hover:text-error transition-colors border border-white/5"
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
      {activeFilesRowId && (
        <FilesModal rowId={activeFilesRowId} onClose={() => setActiveFilesRowId(null)} />
      )}
    </section>
  );
};
