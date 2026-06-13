// Smart Import Modal Component
import React, { useState } from 'react';
import { useStore, TestRow, CustomFieldDef } from '../../store/useStore';
import { supabase } from '../../lib/supabase';
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
  const { importRows, users } = useStore();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<{ rows: TestRow[]; customFields: CustomFieldDef[] } | null>(null);

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
        setStep(5);
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
      setStep(5);
      validateUploadedFile(selectedFile);
    }
  };

  const validateUploadedFile = async (targetFile: File) => {
    setIsValidating(true);
    setValidationErrors([]);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawJson: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);
        
        if (!rawJson || rawJson.length === 0) {
          throw new Error('Spreadsheet is empty.');
        }

        // 1. Map and clean headers
        const cleanedRows = rawJson.map(row => {
          const standardizedRow: Record<string, unknown> = {};
          Object.keys(row).forEach(key => {
            const standardKey = key.trim()
              .replace(/PageUrl/i, 'Page URL')
              .replace(/ModuleName/i, 'Module Name')
              .replace(/TestPoint/i, 'Test Point')
              .replace(/HowToTest/i, 'How To Test')
              .replace(/ExpectedResult/i, 'Expected Result')
              .replace(/ActualResult/i, 'Actual Result')
              .replace(/FunctionalityStatus/i, 'Functionality Status')
              .replace(/TestingStatus/i, 'Testing Status');
            
            standardizedRow[standardKey] = row[key];
          });
          return standardizedRow;
        });

        // 2. Define your strict list of mandatory columns
        const mandatoryColumns = [
          'Module Name', 'Page URL', 'Test Point', 'How To Test', 
          'Expected Result', 'Actual Result', 'Functionality Status', 
          'Testing Status'
        ]; // Removing 'Notes' from mandatory because users might leave notes blank or omit it

        // 3. Verify against the cleaned keys of the first row
        const currentKeys = Object.keys(cleanedRows[0]);
        const missingColumns = mandatoryColumns.filter(col => !currentKeys.includes(col));

        if (missingColumns.length > 0) {
          throw new Error(`Sheet validation failed. Missing columns: ${missingColumns.join(', ')}`);
        }

        // Call AI backend safely
        const response = await fetch('/api/parse-sheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawJson: cleanedRows.slice(0, 50), // Limit to 50 rows for token limits
            availableUsers: users.map(u => u.name)
          })
        });

        // Read raw text response first to protect against empty strings crashing the app
        const rawText = await response.text();
        if (!rawText) {
          throw new Error("Server returned an empty response. Check server logs (missing GEMINI_API_KEY).");
        }

        const result = JSON.parse(rawText);

        if (!response.ok) {
          throw new Error(result.error || 'AI parsing failed');
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserEmail = session?.user?.email;
        let currentUserName = undefined;
        if (currentUserEmail) {
          const userObj = users.find(u => u.email === currentUserEmail);
          if (userObj) currentUserName = userObj.name;
        }

        // Ensure each row gets a unique ID and matches structure
        const finalRows = (result.testPoints || []).map((tp: Record<string, unknown>, index: number) => ({
          id: `row-${Date.now()}-${index}`,
          testPoint: (tp.testPoint as string) || 'Unnamed Test Point',
          moduleName: (tp.moduleName as string) || 'General Module',
          url: (tp.url as string) || '',
          howToTest: (tp.howToTest as string) || '',
          expectedResult: (tp.expectedResult as string) || '',
          actualResult: (tp.actualResult as string) || '',
          functionalityStatus: 'Pending',
          testingStatus: 'Pending',
          priority: (tp.priority as any) || 'Medium',
          assignedUser: currentUserName || (tp.assignedUser as string) || undefined,
          notes: [],
          attachments: [],
          customFields: {},
          lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16)
        })) as TestRow[];

        setParsedData({ rows: finalRows, customFields: [] });
        setIsValidating(false);

      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setValidationErrors([`AI Parsing failed: ${errorMessage}`]);
        setIsValidating(false);
      }
    };
    reader.onerror = () => {
      setValidationErrors(['File read error']);
      setIsValidating(false);
    };
    reader.readAsBinaryString(targetFile);
  };

  const executeImport = () => {
    if (parsedData) {
      importRows(parsedData.rows, parsedData.customFields);
      setStep(6);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Progress Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <React.Fragment key={num}>
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shrink-0 ${
                step === num 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-110' 
                  : step > num 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
                    : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400'
              }`}>
                {num}
              </div>
              {num < 6 && (
                <div className={`h-[2px] w-4 sm:w-6 rounded transition-all shrink-0 ${
                  step > num ? 'bg-emerald-500/30' : 'bg-slate-200 dark:bg-slate-800'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden sm:block">
          {step === 1 && 'Sample Sheet'}
          {step === 2 && 'AI Prompt'}
          {step === 3 && 'Prepare'}
          {step === 4 && 'Upload'}
          {step === 5 && 'Validation'}
          {step === 6 && 'Complete'}
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

      {/* Step 2: AI Prompt */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="p-4 border border-indigo-100 dark:border-indigo-950/40 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-2xl space-y-2">
            <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Step 2: AI Prompt Generator</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Use this prompt in ChatGPT or Gemini to automatically generate a correctly formatted test case table.
            </p>
          </div>
          <div className="p-4 bg-slate-900 rounded-2xl relative group">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`I am building a QA tracking system. I need to write test cases. Please generate test cases in a tabular format with the following exact columns: 'Module Name', 'Page URL', 'Test Point', 'How To Test', 'Expected Result', 'Actual Result', 'Functionality Status', 'Testing Status', 'Notes'.`);
                alert('Prompt copied!');
              }}
              className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
            >
              Copy Prompt
            </button>
            <p className="text-xs text-emerald-400 font-mono leading-relaxed pr-16">
              "I am building a QA tracking system. I need to write test cases. Please generate test cases in a tabular format with the following exact columns: 'Module Name', 'Page URL', 'Test Point', 'How To Test', 'Expected Result', 'Actual Result', 'Functionality Status', 'Testing Status', 'Notes'."
            </p>
          </div>
          <div className="flex justify-between pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
            <button onClick={() => setStep(1)} className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-all">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button onClick={() => setStep(3)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm hover:shadow transition-all">
              Next Step <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Prepare Data */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="p-4 border border-indigo-100 dark:border-indigo-950/40 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-2xl space-y-2">
            <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Step 3: Prepare Your Spreadsheet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Once AI generates the table, copy it and paste it into Excel or Google Sheets. Save the file as a .xlsx or .csv file.
            </p>
          </div>
          <div className="flex justify-between pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
            <button onClick={() => setStep(2)} className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-all">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button onClick={() => setStep(4)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm hover:shadow transition-all">
              Ready to Upload <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Upload Completed Sheet */}
      {step === 4 && (
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
              onClick={() => setStep(3)}
              className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Validate Sheet Structure */}
      {step === 5 && (
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
              onClick={() => setStep(4)}
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
              onClick={() => setStep(4)}
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

      {/* Step 6: Import Complete */}
      {step === 6 && (
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
