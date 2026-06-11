import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Trash2, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { PermanentDeleteModal } from './PermanentDeleteModal';

export const TrashView: React.FC = () => {
  const trashRows = useStore((state) => state.trashRows);
  const restoreRow = useStore((state) => state.restoreRow);
  const setCurrentView = useStore((state) => state.setCurrentView);
  
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-red-500" />
            Trash Bin
          </h1>
        </div>
      </div>

      {trashRows.length === 0 ? (
        <div className="text-center py-20">
          <Trash2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Trash is Empty</h3>
          <p className="text-gray-500 dark:text-gray-400">Items moved to the trash will appear here.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {trashRows.map(row => (
              <div key={row.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors gap-4">
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">{row.testPoint}</h3>
                  <p className="text-sm text-gray-500">Module: {row.moduleName} • Status: {row.testingStatus}</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                   <button onClick={() => restoreRow(row.id)} className="flex-1 md:flex-none px-3 py-1.5 text-sm bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center gap-1">
                     <RefreshCw className="w-4 h-4" /> Restore
                   </button>
                   <button onClick={() => setDeletingId(row.id)} className="flex-1 md:flex-none px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-1">
                     <AlertTriangle className="w-4 h-4" /> Delete Permanently
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {deletingId && (
        <PermanentDeleteModal 
          rowId={deletingId} 
          onClose={() => setDeletingId(null)}
        />
      )}
    </div>
  );
};
