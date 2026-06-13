import React from 'react';
import { Dialog } from '../ui/Dialog';
import { useStore, Attachment } from '../../store/useStore';
import { FileUpload } from '../files/FileUpload';

interface FilesModalProps {
  rowId: string | null;
  onClose: () => void;
}

export const FilesModal: React.FC<FilesModalProps> = ({ rowId, onClose }) => {
  const { rows, updateRow } = useStore();
  const row = rows.find(r => r.id === rowId);

  const handleAddFile = (file: Attachment) => {
    if (!row) return;
    updateRow(row.id, { attachments: [...row.attachments, file] });
  };

  const handleDeleteFile = (fileId: string) => {
    if (!row) return;
    updateRow(row.id, {
      attachments: row.attachments.filter(a => a.id !== fileId)
    });
  };

  return (
    <Dialog
      isOpen={!!rowId && !!row}
      onClose={onClose}
      title="Upload Files"
      size="md"
    >
      {row && (
        <>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4 truncate">
            {row.testPoint}
          </p>
          <FileUpload
            attachments={row.attachments}
            onAdd={handleAddFile}
            onDelete={handleDeleteFile}
          />
        </>
      )}
    </Dialog>
  );
};
