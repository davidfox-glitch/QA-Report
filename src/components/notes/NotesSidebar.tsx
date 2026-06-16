import React, { useState, useRef } from 'react';
import { useStore, Note } from '../../store/useStore';
import { Plus, Trash2, Edit2, Check, X, Calendar, AlignLeft, Sparkles, Image as ImageIcon, Send, Loader2 } from 'lucide-react';

interface NotesSidebarProps {
  rowId: string;
  onClose: () => void;
}

export const NotesSidebar: React.FC<NotesSidebarProps> = ({ rowId, onClose }) => {
  const { rows, addNote, updateNote, deleteNote, addNotification, logActivity, modules } = useStore();
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // AI Chat State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponses, setAiResponses] = useState<{ role: 'user'|'ai', text: string, img?: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const row = rows.find((r) => r.id === rowId);
  if (!row) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const text = newNoteText.trim();
    
    addNote(rowId, text);
    if (logActivity) logActivity('Added Note', `Note added to ${row.testPoint}`);
    
    // Process mentions
    const mentionRegex = /@(\w+)/g;
    const mentions = [...text.matchAll(mentionRegex)].map(m => m[1]);
    if (mentions.length > 0 && addNotification) {
      mentions.forEach(username => {
         addNotification(`@${username} You were mentioned on task "${row.testPoint}"`, 'general');
      });
    }

    setNewNoteText('');
  };

  const renderNoteText = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => 
      part.startsWith('@') ? <span key={i} className="text-indigo-500 font-semibold bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded">{part}</span> : part
    );
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() && !selectedImage) return;

    const userMessage = aiPrompt;
    const userImg = selectedImage;
    setAiResponses(prev => [...prev, { role: 'user', text: userMessage, img: userImg || undefined }]);
    setAiPrompt('');
    setSelectedImage(null);
    setAiLoading(true);
    try {
      const resp = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Context: Module "${modules.find(m => m.id === row.moduleId)?.name || 'General Module'}", Expected Result: "${row.expectedResult}". \n\nUser Question: ${userMessage}`,
          imageBase64: userImg 
        })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);

      setAiResponses(prev => [...prev, { role: 'ai', text: data.text }]);
    } catch (err: any) {
      setAiResponses(prev => [...prev, { role: 'ai', text: `Error: ${err.message}` }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[70vh] gap-6">
      
      {/* LEFT COLUMN: NOTES TIMELINE */}
      <div className="flex-1 flex flex-col h-full space-y-4 md:border-r border-slate-200 dark:border-slate-800 md:pr-4 overflow-hidden">
        {/* Target Page Details */}
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-3.5 space-y-1 shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Selected Module
          </p>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {modules.find(m => m.id === row.moduleId)?.name || 'General Module'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={row.testPoint}>
            {row.testPoint}
          </p>
        </div>

        {/* Add Note Form */}
        <form onSubmit={handleAdd} className="flex gap-2 shrink-0">
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
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
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
                  <div className="flex items-center text-[10px] text-slate-400 dark:text-slate-500 mb-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {note.timestamp}
                  </div>

                  {editingNoteId === note.id ? (
                    <div className="space-y-2 mt-1.5">
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        rows={2}
                        className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-100"
                      />
                      <div className="flex justify-end space-x-1">
                        <button type="button" onClick={handleCancelEdit} className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 rounded-md transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => handleSaveEdit(note.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-500 rounded-md transition-colors">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-700 dark:text-slate-300 break-words leading-relaxed whitespace-pre-wrap">
                      {renderNoteText(note.text)}
                    </p>
                  )}

                  {editingNoteId !== note.id && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity bg-white dark:bg-slate-900 pl-1 rounded">
                      <button onClick={() => handleStartEdit(note)} className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors" title="Edit Note">
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button onClick={() => { if (confirm('Delete this note?')) deleteNote(rowId, note.id); }} className="p-1 rounded text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-colors" title="Delete Note">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: AI ASSISTANT */}
      <div className="flex-1 flex flex-col h-full space-y-4 overflow-hidden relative bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
        
        {/* AI Header */}
        <div className="flex items-center space-x-2 p-3 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 shrink-0">
          <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Gemini Vision AI</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Context-aware structural analysis</p>
          </div>
        </div>

        {/* AI Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {aiResponses.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
              <Sparkles className="h-10 w-10 text-slate-400" />
              <p className="text-xs text-slate-500 max-w-[250px]">
                Ask me questions about this test point or upload a screenshot to check for structural bugs.
              </p>
            </div>
          ) : (
            aiResponses.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'
                }`}>
                  {msg.img && (
                    <img src={msg.img} alt="Uploaded screenshot" className="w-full max-h-48 object-contain rounded-lg mb-2 border border-white/20" />
                  )}
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            ))
          )}
          {aiLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none p-3 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* AI Input Area */}
        <form onSubmit={handleAiSubmit} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          {selectedImage && (
            <div className="relative inline-block mb-2 group">
              <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded-lg border-2 border-indigo-500" />
              <button 
                type="button" 
                onClick={() => setSelectedImage(null)} 
                className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageSelect}
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all shrink-0"
              title="Attach Screenshot"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask AI or attach screenshot..."
              className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={aiLoading || (!aiPrompt.trim() && !selectedImage)}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-sm hover:shadow transition-all shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
