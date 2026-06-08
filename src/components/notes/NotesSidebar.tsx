import React, { useState } from 'react';
import { useStore, Note } from '../../store/useStore';
import { Plus, Trash2, Edit2, Check, X, Calendar, AlignLeft } from 'lucide-react';

interface NotesSidebarProps {
  rowId: string;
  onClose: () => void;
}

export const NotesSidebar: React.FC<NotesSidebarProps> = ({ rowId, onClose }) => {
  const { rows, addNote, updateNote, deleteNote } = useStore();
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const row = rows.find((r) => r.id === rowId);
  if (!row) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addNote(rowId, newNoteText.trim());
    setNewNoteText('');
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingText(note.text);
  };

  const handleSaveEdit = (noteId: string) => {
    if (!editingText.trim()) return;
    updateNote(rowId, noteId, editingText.trim());
    setEditingNoteId(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingText('');
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Target Page Details */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-3.5 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Selected Module
        </p>
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          {row.pageName}
        </h4>
        <p className="text-xs text-indigo-500 truncate" title={row.url}>
          {row.url}
        </p>
      </div>

      {/* Add Note Form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          placeholder="Add a new QA note/bug update..."
          className="flex-1 px-3 py-2 text-xs bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-slate-100"
        />
        <button
          type="submit"
          className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm hover:shadow transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[350px] space-y-3 pr-1">
        {row.notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
            <AlignLeft className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-xs">No notes added to this page yet.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {row.notes.map((note) => (
              <div
                key={note.id}
                className="group relative p-3 border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900/30 rounded-xl transition-all hover:shadow-sm"
              >
                {/* Note Header (date) */}
                <div className="flex items-center text-[10px] text-slate-400 dark:text-slate-500 mb-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  {note.timestamp}
                </div>

                {/* Note Content / Edit Box */}
                {editingNoteId === note.id ? (
                  <div className="space-y-2 mt-1.5">
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-100"
                    />
                    <div className="flex justify-end space-x-1">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 rounded-md transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(note.id)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-500 rounded-md transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 dark:text-slate-300 break-words leading-relaxed">
                    {note.text}
                  </p>
                )}

                {/* Floating Actions on Hover */}
                {editingNoteId !== note.id && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity bg-white dark:bg-slate-900 pl-1 rounded">
                    <button
                      onClick={() => handleStartEdit(note)}
                      className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                      title="Edit Note"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this note?')) {
                          deleteNote(rowId, note.id);
                        }
                      }}
                      className="p-1 rounded text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Closing button */}
      <div className="flex justify-end border-t border-slate-200/50 dark:border-slate-800/50 pt-3 mt-auto">
        <button
          onClick={onClose}
          className="px-4 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition-colors"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
};
