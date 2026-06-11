import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface PermanentDeleteModalProps {
  rowId: string;
  onClose: () => void;
}

export const PermanentDeleteModal: React.FC<PermanentDeleteModalProps> = ({ rowId, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const hardDeleteRow = useStore((state) => state.hardDeleteRow);

  const handleDelete = () => {
    if (inputValue === 'DELETE') {
      hardDeleteRow(rowId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            WARNING: Permanent Deletion
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            This will permanently delete:
          </p>
          <ul className="list-disc list-inside text-red-600 dark:text-red-400 space-y-1 font-medium">
            <li>Task</li>
            <li>Notes</li>
            <li>Screenshots</li>
            <li>Attachments</li>
            <li>Activity Logs</li>
            <li>Notifications</li>
            <li>AI Conversations</li>
          </ul>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone.
          </p>

          <div className="pt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type <strong>DELETE</strong> to confirm
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="DELETE"
            />
          </div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button 
            onClick={handleDelete}
            disabled={inputValue !== 'DELETE'}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Permanently Delete
          </button>
        </div>
      </div>
    </div>
  );
};
