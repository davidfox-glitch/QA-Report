import React, { useMemo } from 'react';
import { useStore, TestRow } from '../../store/useStore';
import { Archive, ArrowLeft, RefreshCw, Trash2, CheckCircle, XCircle, FileText, Image as ImageIcon, Users, FileDown } from 'lucide-react';

export const ArchiveView: React.FC = () => {
  const archivedRows = useStore((state) => state.archivedRows);
  const restoreRow = useStore((state) => state.restoreRow);
  const trashRow = useStore((state) => state.trashRow);
  const setCurrentView = useStore((state) => state.setCurrentView);
  const modules = useStore((state) => state.modules);

  // Basic grouping by month (e.g. "June 2026")
  const groupedTasks = useMemo(() => {
    const groups: Record<string, TestRow[]> = {};
    archivedRows.forEach(row => {
      const d = new Date(row.lastUpdated || Date.now());
      const key = d.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });
    return groups;
  }, [archivedRows]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Archive className="w-6 h-6 text-primary" />
            Archived Tasks
          </h1>
        </div>
      </div>

      {Object.keys(groupedTasks).length === 0 ? (
        <div className="text-center py-20">
          <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Archived Tasks</h3>
          <p className="text-gray-500 dark:text-gray-400">Completed tasks will appear here.</p>
        </div>
      ) : (
        Object.entries(groupedTasks).map(([month, rows]) => {
          const passed = rows.filter(r => r.testingStatus === 'Passed').length;
          const failed = rows.filter(r => r.testingStatus === 'Failed').length;
          const notesCount = rows.reduce((acc, r) => acc + r.notes.length, 0);
          const users = new Set(rows.flatMap(r => r.assignedUsers || []).filter(Boolean));

          return (
            <div key={month} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{month}</h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500"/> {passed} Passed</span>
                  <span className="flex items-center gap-1"><XCircle className="w-4 h-4 text-red-500"/> {failed} Failed</span>
                  <span className="flex items-center gap-1"><FileText className="w-4 h-4 text-blue-500"/> {notesCount} Notes</span>
                  <span className="flex items-center gap-1"><Users className="w-4 h-4 text-orange-500"/> {users.size} Users</span>
                  <span className="font-medium bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">Total: {rows.length}</span>
                </div>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {rows.map(row => (
                  <div key={row.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white">{row.testPoint}</h3>
                      <p className="text-sm text-gray-500">Module: {(modules.find(m => m.id === row.moduleId)?.name || 'General')} • Completed: {row.lastUpdated}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <button className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg flex items-center gap-1">
                         <FileDown className="w-4 h-4" /> Export
                       </button>
                       <button onClick={() => restoreRow(row.id)} className="px-3 py-1.5 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-lg flex items-center gap-1">
                         <RefreshCw className="w-4 h-4" /> Restore
                       </button>
                       <button onClick={() => trashRow(row.id)} className="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-1">
                         <Trash2 className="w-4 h-4" /> Trash
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
