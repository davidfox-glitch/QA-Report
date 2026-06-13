import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Trash2, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { PermanentDeleteModal } from './PermanentDeleteModal';

export const TrashView: React.FC = () => {
  const trashRows = useStore((state) => state.trashRows);
  const restoreRow = useStore((state) => state.restoreRow);
  const setCurrentView = useStore((state) => state.setCurrentView);
  
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const groupedTrash = useMemo(() => {
    const groups: { [key: string]: typeof trashRows } = {};
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
    
    trashRows.forEach(row => {
      const deletedTime = row.deletedAt ? new Date(row.deletedAt).getTime() : 0;
      if (deletedTime === 0) {
        if (!groups['Previously Deleted']) groups['Previously Deleted'] = [];
        groups['Previously Deleted'].push(row);
      } else {
        const bucketStart = Math.floor(deletedTime / TWO_HOURS_MS) * TWO_HOURS_MS;
        const bucketStartDate = new Date(bucketStart);
        const bucketEndDate = new Date(bucketStart + TWO_HOURS_MS);
        const label = `${bucketStartDate.toLocaleDateString()} ${bucketStartDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})} - ${bucketEndDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}`;
        
        if (!groups[label]) groups[label] = [];
        groups[label].push(row);
      }
    });
    
    // Sort keys so newer buckets appear first
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === 'Previously Deleted') return 1;
      if (b === 'Previously Deleted') return -1;
      return new Date(b.split(' - ')[0]).getTime() - new Date(a.split(' - ')[0]).getTime();
    });

    return sortedKeys.map(key => ({
      label: key,
      items: groups[key]
    }));
  }, [trashRows]);

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
        <div className="space-y-6">
          {groupedTrash.map(group => (
            <div key={group.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800/80 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{group.label}</h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {group.items.map(row => (
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
          ))}
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
