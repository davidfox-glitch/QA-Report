import React, { useRef } from 'react';
import { X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface FilesModalProps {
  rowId: string;
  onClose: () => void;
}

export const FilesModal: React.FC<FilesModalProps> = ({ rowId, onClose }) => {
  const { rows, updateRow } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const row = rows.find(r => r.id === rowId);
  if (!row) return null;

  const files = row.files || [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateRow(rowId, { files: [...files, reader.result as string] });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (index: number) => {
    if (confirm('Delete this file?')) {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      updateRow(rowId, { files: newFiles });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-indigo-500" />
              Attached Files
            </h2>
            <p className="text-xs text-slate-500">{row.testPoint}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {files.map((file, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-square bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <img src={file} alt={`Attachment ${idx}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleDelete(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-rose-500/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-rose-600"
                  title="Delete image"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            
            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-500 hover:text-indigo-600 transition-all aspect-square"
            >
              <Upload className="h-6 w-6" />
              <span className="text-xs font-semibold">Upload File</span>
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
          </div>
          
          {files.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500 dark:text-slate-400">No files attached yet. Click the upload button to add images.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
