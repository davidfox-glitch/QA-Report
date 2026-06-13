import React, { useState, useRef } from 'react';
import { UploadCloud, File, FileText, FileArchive, X, ZoomIn } from 'lucide-react';
import { Attachment } from '../../store/useStore';

interface FileUploadProps {
  attachments: Attachment[];
  onAdd: (file: Attachment) => void;
  onDelete: (id: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ attachments, onAdd, onDelete }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true);
    else if (e.type === 'dragleave') setIsDragActive(false);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onAdd({
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type || file.name.split('.').pop() || '',
        date: new Date().toISOString().replace('T', ' ').substring(0, 10),
        url: dataUrl
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) Array.from(e.dataTransfer.files).forEach(processFile);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) Array.from(e.target.files).forEach(processFile);
  };

  const getFileIcon = (type: string, name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'zip' || ext === 'rar' || ext === '7z') return <FileArchive className="h-6 w-6 text-purple-400" />;
    if (ext === 'pdf') return <FileText className="h-6 w-6 text-rose-400" />;
    if (ext === 'xlsx' || ext === 'csv' || ext === 'xls') return <FileText className="h-6 w-6 text-emerald-400" />;
    if (ext === 'docx' || ext === 'doc') return <File className="h-6 w-6 text-blue-400" />;
    return <File className="h-6 w-6 text-slate-400" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const images = attachments.filter(a => a.type.startsWith('image/'));
  const others = attachments.filter(a => !a.type.startsWith('image/'));

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10'
            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
        }`}
      >
        <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleChange} />
        <UploadCloud className={`h-9 w-9 mb-2 transition-colors ${isDragActive ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-500'}`} />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Drop files here, or <span className="text-indigo-500 hover:underline">browse</span>
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Images, PDF, DOCX, XLSX, ZIP</p>
      </div>

      {/* Image Grid Previews */}
      {images.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Images ({images.length})</p>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img) => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-square">
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setLightboxSrc(img.url); }}
                    className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white transition-colors"
                    title="Preview"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete(img.id); }}
                    className="p-1.5 rounded-lg bg-rose-500/90 text-white hover:bg-rose-600 transition-colors"
                    title="Delete"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                {/* Filename below */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                  <p className="text-[9px] text-white/90 truncate font-medium">{img.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Files List */}
      {others.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Files ({others.length})</p>
          <div className="space-y-2">
            {others.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-center space-x-3 overflow-hidden mr-3">
                  {getFileIcon(file.type, file.name)}
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {formatSize(file.size)} · {file.date}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete(file.id); }}
                  title="Delete"
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-colors shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxSrc(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxSrc}
              alt="Preview"
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
            />
            <button
              onClick={() => setLightboxSrc(null)}
              className="absolute -top-3 -right-3 p-2 rounded-full bg-white dark:bg-slate-800 shadow-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
