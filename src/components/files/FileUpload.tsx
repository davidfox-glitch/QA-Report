import React, { useState, useRef } from 'react';
import { UploadCloud, File, FileText, Image, FileArchive, X, Download } from 'lucide-react';
import { Attachment } from '../../store/useStore';

interface FileUploadProps {
  attachments: Attachment[];
  onAdd: (file: Attachment) => void;
  onDelete: (id: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ attachments, onAdd, onDelete }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const attachment: Attachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type || file.name.split('.').pop() || '',
        date: new Date().toISOString().replace('T', ' ').substring(0, 10),
        url: dataUrl
      };
      onAdd(attachment);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      Array.from(e.dataTransfer.files).forEach(processFile);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      Array.from(e.target.files).forEach(processFile);
    }
  };

  const triggerInputClick = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (type: string, name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (type.startsWith('image/')) return <Image className="h-5 w-5 text-emerald-500" />;
    if (ext === 'zip' || ext === 'rar' || ext === '7z') return <FileArchive className="h-5 w-5 text-purple-500" />;
    if (ext === 'pdf') return <FileText className="h-5 w-5 text-rose-500" />;
    if (ext === 'xlsx' || ext === 'csv' || ext === 'xls') return <FileText className="h-5 w-5 text-emerald-600" />;
    if (ext === 'docx' || ext === 'doc') return <File className="h-5 w-5 text-blue-500" />;
    return <File className="h-5 w-5 text-slate-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerInputClick}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
          isDragActive 
            ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10' 
            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleChange}
        />
        <UploadCloud className="h-10 w-10 text-slate-400 dark:text-slate-500 mb-2" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Drag & drop files here, or <span className="text-indigo-500 hover:underline">browse</span>
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Supports Images, PDF, DOCX, XLSX, ZIP up to 5MB
        </p>
      </div>

      {/* File Previews */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
          {attachments.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-center space-x-3 overflow-hidden mr-4">
                {getFileIcon(file.type, file.name)}
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {formatSize(file.size)} • {file.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <a
                  href={file.url}
                  download={file.name}
                  title="Download File"
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(file.id);
                  }}
                  title="Delete File"
                  className="p-1 rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
