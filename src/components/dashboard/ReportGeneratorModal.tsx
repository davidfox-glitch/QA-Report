import React, { useState } from 'react';
import { exportToExcel, exportToDocx, exportToPdf } from '../../utils/exporters';
import { useStore, TestRow } from '../../store/useStore';
import { FileSpreadsheet, FileText, FileDown } from 'lucide-react';

interface ReportGeneratorModalProps {
  onClose: () => void;
  filteredRows: TestRow[];
}

export const ReportGeneratorModal: React.FC<ReportGeneratorModalProps> = ({ onClose, filteredRows }) => {
  const { settings, customFieldsDef, lastAiSummary } = useStore();
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);

  const handleExportExcel = () => {
    exportToExcel(filteredRows, settings, customFieldsDef);
    onClose();
  };

  const handleExportDocx = async () => {
    await exportToDocx(filteredRows, settings, customFieldsDef, lastAiSummary);
    onClose();
  };

  const handleExportPdf = async () => {
    setLoadingPdf(true);
    // Let the DOM update and render the print element
    setTimeout(async () => {
      try {
        await exportToPdf('pdf-printable-report-root', settings.projectName);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPdf(false);
        onClose();
      }
    }, 500);
  };

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Choose your desired export format. All settings (project description, client logo, notes, custom fields) will automatically be parsed and formatted.
      </p>

      {/* Export Options Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Excel Card */}
        <button
          onClick={handleExportExcel}
          className="flex flex-col items-center justify-center p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:shadow transition-all group cursor-pointer text-center"
        >
          <div className="p-3 bg-emerald-500/15 text-emerald-600 rounded-xl mb-3 group-hover:scale-105 transition-transform">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Excel Spreadsheet
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            Data, cell colors & notes references
          </span>
        </button>

        {/* DOCX Card */}
        <button
          onClick={handleExportDocx}
          className="flex flex-col items-center justify-center p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:shadow transition-all group cursor-pointer text-center"
        >
          <div className="p-3 bg-blue-500/15 text-blue-600 rounded-xl mb-3 group-hover:scale-105 transition-transform">
            <FileText className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Word Document
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            Formatted summary, tables & review notes
          </span>
        </button>

        {/* PDF Card */}
        <button
          onClick={handleExportPdf}
          disabled={loadingPdf}
          className="flex flex-col items-center justify-center p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 hover:shadow transition-all group cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="p-3 bg-rose-500/15 text-rose-600 rounded-xl mb-3 group-hover:scale-105 transition-transform">
            <FileDown className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {loadingPdf ? 'Generating PDF...' : 'PDF Status Report'}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            Executive layout, charts & statistics
          </span>
        </button>
      </div>

      {/* PDF Export Section Settings */}
      <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-4 space-y-3">
        <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-400 dark:text-slate-500">
          PDF Report Details
        </h4>
        
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Include Summary Stats</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Display Total/Passed/Failed count cards</span>
          </div>
          <input
            type="checkbox"
            checked={includeStats}
            onChange={(e) => setIncludeStats(e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500/30 h-4 w-4 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Include Review Comments</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Append notes timeline details under matrix table</span>
          </div>
          <input
            type="checkbox"
            checked={includeNotes}
            onChange={(e) => setIncludeNotes(e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500/30 h-4 w-4 cursor-pointer"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end border-t border-slate-200/50 dark:border-slate-800/50 pt-4 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition-colors"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
};
