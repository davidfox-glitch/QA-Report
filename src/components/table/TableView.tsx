import React, { useState } from 'react';
import { useStore, TestRow, CustomFieldDef, FunctionalityStatus, TestingStatus, Priority } from '../../store/useStore';
import { Edit, Trash2, StickyNote, Paperclip, ChevronDown } from 'lucide-react';
import { FilesModal } from './FilesModal';
import { Dropdown } from '../ui/Dropdown';

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

  const totalRows = rows.length;
  const passedRows = rows.filter(r => r.testingStatus === 'Passed').length;
  const coveragePercent = totalRows > 0 ? ((passedRows / totalRows) * 100).toFixed(1) : '0.0';

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
    <section className="glass-panel rounded-xl overflow-hidden mb-8 shadow-2xl border border-white/5">
      <div className="overflow-x-auto custom-scrollbar w-full min-h-[400px] pb-40">
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
                      <div className={`inline-flex items-center rounded-md ${getStatusColorClass(row.functionalityStatus)}`}>
                        <Dropdown
                          value={row.functionalityStatus}
                          onChange={(val) => onQuickUpdate(row.id, { functionalityStatus: val as FunctionalityStatus })}
                          options={[
                            { value: 'Working', label: 'Working' },
                            { value: 'Partially Working', label: 'Partially Working' },
                            { value: 'Not Working', label: 'Not Working' },
                            { value: 'Pending', label: 'Pending' }
                          ]}
                          triggerClassName="text-[11px] font-bold tracking-wider uppercase pl-2 pr-1 py-1 hover:brightness-110"
                        />
                      </div>
                    </td>

                    {/* Testing Status (Dropdown inline editable) */}
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center rounded-md ${getStatusColorClass(row.testingStatus)}`}>
                        <Dropdown
                          value={row.testingStatus}
                          onChange={(val) => onQuickUpdate(row.id, { testingStatus: val as TestingStatus })}
                          options={[
                            { value: 'Passed', label: 'Passed' },
                            { value: 'Failed', label: 'Failed' },
                            { value: 'Pending', label: 'Pending' },
                            { value: 'In Progress', label: 'In Progress' }
                          ]}
                          triggerClassName="text-[11px] font-bold tracking-wider uppercase pl-2 pr-1 py-1 hover:brightness-110"
                        />
                      </div>
                    </td>

                    {/* Priority (Dropdown inline editable) */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 group/priority">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityDotColor(row.priority)}`}></span>
                        <Dropdown
                          value={row.priority}
                          onChange={(val) => onQuickUpdate(row.id, { priority: val as Priority })}
                          options={[
                            { value: 'Critical', label: 'P0 - Critical' },
                            { value: 'High', label: 'P1 - High' },
                            { value: 'Medium', label: 'P2 - Medium' },
                            { value: 'Low', label: 'P3 - Low' }
                          ]}
                          triggerClassName="text-body-sm text-on-surface hover:text-primary transition-colors py-1"
                        />
                      </div>
                    </td>

                    {/* Assigned Role selection */}
                    <td className="px-4 py-3">
                      <div className="w-full max-w-[130px]">
                        <Dropdown
                          value={row.assignedRole || ''}
                          placeholder="Any Role"
                          onChange={(val) => onQuickUpdate(row.id, { assignedRole: val, assignedUsers: [] })}
                          options={[
                            { value: '', label: 'Any Role' },
                            ...uniqueRoles.map(role => ({ value: role, label: role }))
                          ]}
                          triggerClassName="text-body-sm text-on-surface-variant hover:text-primary transition-colors py-1"
                        />
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
                        <div className="w-full max-w-[150px]">
                          <Dropdown
                            value=""
                            placeholder={row.assignedUsers?.length ? "Add another..." : "Add Assignee..."}
                            onChange={(val) => {
                              if (val) {
                                const newUsers = [...(row.assignedUsers || []), val];
                                onQuickUpdate(row.id, { assignedUsers: Array.from(new Set(newUsers)) });
                              }
                            }}
                            options={[
                              { value: '', label: 'Add Assignee...' },
                              ...(row.assignedRole ? users.filter(u => u.role === row.assignedRole) : users)
                                .filter(u => !(row.assignedUsers || []).includes(u.name))
                                .map(u => ({
                                  value: u.name,
                                  label: `${u.name} (${u.role})`
                                }))
                            ]}
                            triggerClassName={`text-body-sm py-1 ${!row.assignedUsers?.length ? 'text-on-surface-variant' : 'text-primary'}`}
                          />
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

    {/* Summary & Metrics Grid */}
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Regression Coverage */}
      <div className="glass-card premium-stroke p-6 rounded-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-body-lg font-bold text-on-surface">Regression Coverage</h3>
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>data_usage</span>
        </div>
        <div className="flex items-end gap-3">
          <span className="text-4xl font-bold text-on-background">{coveragePercent}%</span>
          <span className="text-green-400 text-body-sm pb-1">+2.4% vs last build</span>
        </div>
        <div className="w-full bg-surface-container rounded-full h-2 mt-2">
          <div className="bg-primary h-full rounded-full violet-glow" style={{ width: `${coveragePercent}%` }}></div>
        </div>
        <p className="text-body-sm text-on-surface-variant mt-2">
          {passedRows} cases passed, {totalRows - passedRows} manual checks remaining for release sign-off.
        </p>
      </div>

      {/* Ready for Deployment Card */}
      <div className="glass-card p-6 rounded-xl col-span-1 lg:col-span-2 flex items-center relative overflow-hidden">
        <div className="flex-1 z-10 relative">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full mb-4">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <span className="text-label-caps font-bold">READY FOR DEPLOYMENT</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-white">Stability Index: 9.8/10</h3>
          <p className="text-body-lg text-on-surface-variant mt-2 max-w-md">The current build satisfies all P0 and P1 criteria. Regression suite is healthy with no new critical blockers identified.</p>
          <div className="flex gap-4 mt-6">
            <button className="bg-primary text-on-primary font-bold px-6 py-2 rounded-lg text-body-sm shadow-[0_0_15px_rgba(208,188,255,0.3)] hover:scale-[1.02] transition-all">Sign Off & Deploy</button>
            <button className="bg-surface-variant text-on-surface font-bold px-6 py-2 rounded-lg text-body-sm border border-white/10 hover:bg-surface-bright transition-all">View Audit Log</button>
          </div>
        </div>
        <div className="hidden md:block w-48 h-48 relative z-0">
          <div className="absolute inset-0 bg-primary/10 blur-[60px] rounded-full"></div>
          <div className="w-full h-full rounded-2xl border border-white/20 bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center backdrop-blur-sm overflow-hidden">
             <div className="w-32 h-32 rounded-full border border-primary/30 animate-[spin_10s_linear_infinite] absolute"></div>
             <div className="w-24 h-24 rounded-full border border-secondary/30 animate-[spin_15s_linear_infinite_reverse] absolute"></div>
             <span className="material-symbols-outlined text-6xl text-primary drop-shadow-[0_0_10px_rgba(208,188,255,0.8)]" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
};
