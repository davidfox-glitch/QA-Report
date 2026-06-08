import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { parseSpreadsheet } from '../../utils/importers';
import { 
  Download, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  FileSpreadsheet,
  FileCode,
  Loader2
} from 'lucide-react';

interface SmartImportModalProps {
  onClose: () => void;
}

export const SmartImportModal: React.FC<SmartImportModalProps> = ({ onClose }) => {
  const { importRows } = useStore();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<any>(null);

  const downloadSampleExcel = () => {
    const data = [
      {
        'Module Name': 'User Auth',
        'Page URL': 'https://qaflow.teamofgenus.com/beta/auth/login',
        'Test Point': 'Verify Google Login authentication redirect',
        'How To Test': '1. Click Google Login button\n2. Enter valid account\n3. Verify session',
        'Expected Result': 'User is authenticated and redirected with JWT cookie.',
        'Actual Result': 'Redirects successfully, but secure cookie attribute missing.',
        'Functionality Status': 'Partially Working',
        'Testing Status': 'Failed',
        'Notes': 'Needs priority SSL enforcement.'
      },
      {
        'Module Name': 'Dashboard Portal',
        'Page URL': 'https://qaflow.teamofgenus.com/beta/dashboard',
        'Test Point': 'Verify quick stats reload on data socket sync',
        'How To Test': '1. Load dashboard\n2. Trigger updates in bg\n3. Confirm stat cards update',
        'Expected Result': 'Cards update state reactively without manual reloading.',
        'Actual Result': 'Cards update state in 120ms.',
        'Functionality Status': 'Working',
        'Testing Status': 'Passed',
        'Notes': 'WebSockets verified on Chrome.'
      }
    ];

    import('xlsx').then((XLSX) => {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'QAFlow_Sample');
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qaflow_sample_sheet.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const downloadSampleCsv = () => {
    const csvContent = 
      `Module Name,Page URL,Test Point,How To Test,Expected Result,Actual Result,Functionality Status,Testing Status,Notes\n` +
      `User Auth,https://qaflow.teamofgenus.com/beta/auth/login,Verify Google Login authentication redirect,"1. Click Google Login button\n2. Enter valid account\n3. Verify session",User is authenticated and redirected with JWT cookie.,Redirects successfully but secure cookie attribute missing.,Partially Working,Failed,Needs priority SSL enforcement.\n` +
      `Dashboard Portal,https://qaflow.teamofgenus.com/beta/dashboard,Verify quick stats reload on data socket sync,"1. Load dashboard\n2. Trigger updates in bg\n3. Confirm stat cards update",Cards update state reactively without manual reloading.,Cards update state in 120ms.,Working,Passed,WebSockets verified on Chrome.`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qaflow_sample_sheet.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const ext = droppedFile.name.split('.').pop()?.toLowerCase();
      if (['xlsx', 'xls', 'csv'].includes(ext || '')) {
        setFile(droppedFile);
        setStep(3);
        validateUploadedFile(droppedFile);
      } else {
        alert('Please upload a valid .xlsx, .xls, or .csv spreadsheet file.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setStep(3);
      validateUploadedFile(selectedFile);
    }
  };

  const validateUploadedFile = async (targetFile: File) => {
    setIsValidating(true);
    setValidationErrors([]);
    try {
      const result = await parseSpreadsheet(targetFile);
      // Validate structure - check if at least testPoint or moduleName is mapped
      // Or search XLSX sheet headers directly
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          import('xlsx').then((XLSX) => {
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            const headers = json[0] ? json[0].map(h => String(h).toLowerCase().replace(/[^a-z0-9]/g, '')) : [];
            
            const requiredSynonyms = {
              'Test Point': ['testpoint', 'testcase', 'point', 'description', 'title', 'test'],
              'Module Name': ['modulename', 'module', 'feature', 'page', 'pagename', 'section']
            };

            const missing: string[] = [];
            for (const [key, synonyms] of Object.entries(requiredSynonyms)) {
              const hasMatch = headers.some(header => synonyms.includes(header));
              if (!hasMatch) {
                missing.push(key);
              }
            }

            if (missing.length > 0) {
              setValidationErrors(missing.map(m => `Missing required column mapping for: "${m}"`));
            }

            setParsedData(result);
            setIsValidating(false);
          });
        } catch (err) {
          setValidationErrors(['Could not read sheet headers. Verify the file format.']);
          setIsValidating(false);
        }
      };
      reader.readAsBinaryString(targetFile);

    } catch (err: any) {
      setValidationErrors([`Parsing failed: ${err.message || err}`]);
      setIsValidating(false);
    }
  };

  const executeImport = () => {
    if (parsedData) {
      importRows(parsedData.rows, parsedData.customFields);
      setStep(4);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Progress Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4].map((num) => (
            <React.Fragment key={num}>
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === num 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-110' 
                  : step > num 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
                    : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400'
              }`}>
                {num}
              </div>
              {num < 4 && (
                <div className={`h-[2px] w-8 rounded transition-all ${
                  step > num ? 'bg-emerald-500/30' : 'bg-slate-200 dark:bg-slate-800'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {step === 1 && 'Sample Sheet'}
          {step === 2 && 'Upload'}
          {step === 3 && 'Validation'}
          {step === 4 && 'Complete'}
        </span>
      </div>

      {/* Step 1: Download Sample Sheet */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="p-4 border border-indigo-100 dark:border-indigo-950/40 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-2xl space-y-2">
            <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Step 1: Download Sample Testing Sheet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Ensure your test cases map perfectly by starting with a pre-validated sample sheet. Choose your preferred spreadsheet type below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <button
              onClick={downloadSampleExcel}
              className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/50 dark:hover:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all text-left group"
            >
              <div className="flex items-center space-x-3.5">
                <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-xl">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Microsoft Excel (.xlsx)</h5>
                  <p className="text-[10px] text-slate-400">Standard rich worksheet format</p>
                </div>
              </div>
              <Download className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </button>

            <button
              onClick={downloadSampleCsv}
              className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/50 dark:hover:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all text-left group"
            >
              <div className="flex items-center space-x-3.5">
                <div className="h-10 w-10 bg-blue-500/10 text-blue-500 flex items-center justify-center rounded-xl">
                  <FileCode className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">CSV Sheet (.csv)</h5>
                  <p className="text-[10px] text-slate-400">Comma-separated flat text data</p>
                </div>
              </div>
              <Download className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </button>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm hover:shadow transition-all"
            >
              Proceed to Upload <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Upload Completed Sheet */}
      {step === 2 && (
        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center space-y-4 bg-slate-50/30 dark:bg-slate-950/10 hover:bg-slate-100/20 dark:hover:bg-slate-950/20 transition-all cursor-pointer relative"
          >
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="h-14 w-14 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center rounded-2xl shadow-sm">
              <UploadCloud className="h-7 w-7 animate-bounce" />
            </div>
            <div className="text-center space-y-1">
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Drag and drop your spreadsheet here</h5>
              <p className="text-[10px] text-slate-400">Supports .xlsx, .xls, or .csv formats up to 10MB</p>
            </div>
            <span className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-450 hover:bg-slate-50 transition-colors pointer-events-none">
              Browse Files
            </span>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Validate Sheet Structure */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 bg-indigo-500/10 text-indigo-500 flex items-center justify-center rounded-lg">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{file?.name}</h5>
                <p className="text-[10px] text-slate-400">{file ? (file.size / 1024).toFixed(1) : 0} KB</p>
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600"
            >
              Change File
            </button>
          </div>

          {isValidating ? (
            <div className="py-10 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Validating columns mapping schema...</p>
            </div>
          ) : validationErrors.length > 0 ? (
            <div className="space-y-3">
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold">Sheet validation failed</h5>
                  <p className="text-[10px] text-rose-500/90 leading-relaxed">
                    Some mandatory columns are missing or formatted incorrectly. Standardize your header rows.
                  </p>
                </div>
              </div>
              <ul className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 pl-5 list-disc space-y-1.5 max-h-[120px] overflow-y-auto">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-xs font-bold">Validation Passed</h5>
                <p className="text-[10px] text-emerald-500/90 leading-relaxed">
                  All headers mapped successfully! Found <span className="font-bold">{parsedData?.rows.length} records</span> and <span className="font-bold">{parsedData?.customFields.length} custom fields</span>. Ready to import.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>

            <button
              onClick={executeImport}
              disabled={isValidating || validationErrors.length > 0}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import Records <CheckCircle2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Import Complete */}
      {step === 4 && (
        <div className="space-y-6 py-4 flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center rounded-full shadow-lg shadow-emerald-500/15">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Import Completed Successfully</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your test cases are fully integrated into QAFlow Pro. Assigned users will receive alert logs.
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Close Dialog
          </button>
        </div>
      )}
    </div>
  );
};
