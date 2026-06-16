import React from 'react';
import { Dialog } from '../ui/Dialog';
import { TestRow, useStore } from '../../store/useStore';

interface DetailsModalProps {
  row: TestRow | null;
  onClose: () => void;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({ row, onClose }) => {
  const { modules } = useStore();
  return (
    <Dialog
      isOpen={!!row}
      onClose={onClose}
      title="Task Details"
      size="lg"
    >
      {row && (
        <div className="space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{row.testPoint}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold">{modules.find(m => m.id === row.moduleId)?.name || 'General Module'}</p>
          </div>

          {row.howToTest && (
            <div>
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">How to Test</h4>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {row.howToTest}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">Expected Result</h4>
            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {row.expectedResult}
            </div>
          </div>

          {row.actualResult && (
            <div>
              <h4 className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-2">Actual Result</h4>
              <div className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-200/60 dark:border-rose-800/40 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {row.actualResult}
              </div>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
};
