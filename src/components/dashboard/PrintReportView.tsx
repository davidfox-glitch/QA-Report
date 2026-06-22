import React from 'react';
import { useStore, TestRow, ProjectSettings, CustomFieldDef } from '../../store/useStore';
import { Layers, CheckCircle2, ShieldAlert, AlertTriangle, ListChecks, FileText, Sparkles } from 'lucide-react';

interface PrintReportViewProps {
  rows: TestRow[];
  settings: ProjectSettings;
  customFieldsDef: CustomFieldDef[];
  lastAiSummary?: {
    testingSummary: string;
    progressSummary: string;
    riskAssessment: string;
    pendingTasksSummary: string;
  };
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  rows,
  settings,
  customFieldsDef,
  lastAiSummary
}) => {
  const { modules } = useStore();
  const total = rows.length;
  const passed = rows.filter(r => r.testingStatus === 'Passed').length;
  const failed = rows.filter(r => r.testingStatus === 'Failed').length;
  const inProgress = rows.filter(r => r.testingStatus === 'In Progress').length;
  const pending = rows.filter(r => r.testingStatus === 'Pending').length;

  const devWorking = rows.filter(r => r.functionalityStatus === 'Working').length;
  const devPartial = rows.filter(r => r.functionalityStatus === 'Partially Working').length;
  const devNotWorking = rows.filter(r => r.functionalityStatus === 'Not Working').length;

  const passedRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const failedRate = total > 0 ? Math.round((failed / total) * 100) : 0;
  const pendingRate = total > 0 ? Math.round(((pending + inProgress) / total) * 100) : 0;

  // Simple Risk Assessment calculation
  const criticalCount = rows.filter(r => r.priority === 'Critical' && r.testingStatus === 'Failed').length;
  const highCount = rows.filter(r => r.priority === 'High' && r.testingStatus === 'Failed').length;
  const riskStatus = criticalCount > 0 ? 'HIGH' : highCount > 0 ? 'MEDIUM' : 'LOW';

  return (
    <div
      id="pdf-printable-report-root"
      className="p-10 bg-white text-slate-900 font-sans max-w-[820px] mx-auto space-y-8 select-none border border-slate-200 shadow-lg"
      style={{
        color: '#0f172a',
        backgroundColor: '#ffffff'
      }}
    >
      {/* 1. Executive Brand Header */}
      <div className="flex items-center justify-between border-b-2 border-indigo-600 pb-6">
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
            {settings.reportBranding.headerTemplate || 'QAFlow Pro Executive Audit'}
          </h2>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 mt-1">
            {settings.projectName}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Company: <span className="font-semibold text-slate-800">{settings.clientName}</span>
          </p>
          <p className="text-[9px] text-slate-450 mt-1">
            Audit Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>

        {settings.clientLogo && settings.reportBranding.showLogo ? (
          <img
            src={settings.clientLogo}
            alt="Company Logo"
            className="h-16 w-16 object-contain"
          />
        ) : (
          <div className="h-14 w-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              QA
            </span>
          </div>
        )}
      </div>

      {/* 2. Project Information */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 flex items-center gap-1.5 border-b border-slate-100 pb-1">
          <FileText className="h-3.5 w-3.5 text-indigo-500" /> 1. Project Information
        </h3>
        <p className="text-xs text-slate-650 leading-relaxed font-normal">
          {settings.projectDescription || 'No description provided for this testing audit sprint.'}
        </p>
      </div>

      {/* 3. Executive Metrics Dashboard */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 flex items-center gap-1.5 border-b border-slate-100 pb-1">
          <Layers className="h-3.5 w-3.5 text-indigo-500" /> 2. Testing Statistics & Charts
        </h3>

        <div className="grid grid-cols-4 gap-4">
          <div className="border border-slate-200/80 p-3 rounded-xl bg-slate-50/50 text-center">
            <p className="text-[9px] font-bold uppercase text-slate-400">Total Cases</p>
            <h4 className="text-xl font-extrabold text-slate-900 mt-1">{total}</h4>
          </div>
          <div className="border border-slate-200/80 p-3 rounded-xl bg-emerald-500/5 text-center">
            <p className="text-[9px] font-bold uppercase text-emerald-600">Passed</p>
            <h4 className="text-xl font-extrabold text-emerald-600 mt-1">{passed}</h4>
          </div>
          <div className="border border-slate-200/80 p-3 rounded-xl bg-rose-500/5 text-center">
            <p className="text-[9px] font-bold uppercase text-rose-600">Failed</p>
            <h4 className="text-xl font-extrabold text-rose-600 mt-1">{failed}</h4>
          </div>
          <div className="border border-slate-200/80 p-3 rounded-xl bg-amber-500/5 text-center">
            <p className="text-[9px] font-bold uppercase text-amber-600">Completion</p>
            <h4 className="text-xl font-extrabold text-amber-650 mt-1">{passedRate}%</h4>
          </div>
        </div>

        {/* Dynamic SVG Charts for PDF rendering */}
        <div className="grid grid-cols-2 gap-6 pt-2">
          {/* Passed vs Failed Donut */}
          <div className="border border-slate-200/80 p-4 rounded-xl flex flex-col items-center bg-slate-50/30">
            <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-3">Testing Outcome Distribution</h4>
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="absolute transform -rotate-90 h-full w-full" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#10b981" strokeWidth="3" 
                  strokeDasharray={`${passedRate} ${100 - passedRate}`} />
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#ef4444" strokeWidth="3" 
                  strokeDasharray={`${failedRate} ${100 - failedRate}`} strokeDashoffset={-passedRate} />
              </svg>
              <div className="text-center">
                <span className="text-lg font-extrabold text-slate-900">{passedRate}%</span>
                <p className="text-[8px] font-bold uppercase text-slate-400">Passed</p>
              </div>
            </div>
            <div className="flex space-x-3 mt-3 text-[9px] font-semibold text-slate-500">
              <span className="flex items-center gap-1"><span className="h-2 w-2 bg-emerald-500 rounded-full" /> Pass ({passed})</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 bg-rose-500 rounded-full" /> Fail ({failed})</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 bg-amber-500 rounded-full" /> Pending ({pending + inProgress})</span>
            </div>
          </div>

          {/* Module Development Bar Chart */}
          <div className="border border-slate-200/80 p-4 rounded-xl flex flex-col justify-between bg-slate-50/30">
            <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-3">Module Development Integrity</h4>
            <div className="space-y-2.5">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-semibold text-slate-650">
                  <span>Fully Operational</span>
                  <span>{devWorking} / {total}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${total > 0 ? (devWorking/total)*100 : 0}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-semibold text-slate-650">
                  <span>Partially Operational</span>
                  <span>{devPartial} / {total}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${total > 0 ? (devPartial/total)*100 : 0}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-semibold text-slate-650">
                  <span>Non-Operational / Broken</span>
                  <span>{devNotWorking} / {total}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${total > 0 ? (devNotWorking/total)*100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Passed Items Summary */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5 border-b border-emerald-100 pb-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 3. Passed Test Cases
        </h3>
        <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
          {rows.filter(r => r.testingStatus === 'Passed').length === 0 ? (
            <p className="text-[10px] text-slate-400 italic">No passing test cases found in current run.</p>
          ) : (
            rows.filter(r => r.testingStatus === 'Passed').map((row) => (
              <div key={row.id} className="py-2 flex justify-between text-[11px]">
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-800">{row.testPoint}</p>
                  <p className="text-[9px] text-slate-400">Module: {(modules.find(m => m.id === row.moduleId)?.name || 'General')} • URL: {''}</p>
                </div>
                <span className="text-[9px] font-bold text-emerald-650 bg-emerald-50 px-2 py-0.5 rounded h-fit">Passed</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. Failed Items Summary */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5 border-b border-rose-100 pb-1">
          <ShieldAlert className="h-3.5 w-3.5 text-rose-500" /> 4. Failed Test Cases (Active Bugs)
        </h3>
        <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
          {rows.filter(r => r.testingStatus === 'Failed').length === 0 ? (
            <p className="text-[10px] text-slate-400 italic">No active defects found in current build.</p>
          ) : (
            rows.filter(r => r.testingStatus === 'Failed').map((row) => (
              <div key={row.id} className="py-2.5 flex justify-between text-[11px] items-start">
                <div className="space-y-1 max-w-[80%]">
                  <p className="font-semibold text-slate-850">{row.testPoint}</p>
                  <p className="text-[9px] text-slate-400">Module: {(modules.find(m => m.id === row.moduleId)?.name || 'General')} • URL: {''}</p>
                  <p className="text-[9px] text-rose-500 bg-rose-50 p-1.5 rounded-lg border border-rose-100">
                    <span className="font-bold">Actual Outcome:</span> {row.actualResult || 'No outcome documented.'}
                  </p>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <span className="text-[9px] font-bold text-rose-650 bg-rose-50 px-2 py-0.5 rounded block text-center">Failed</span>
                  <span className="text-[8px] font-bold bg-slate-100 text-slate-550 px-1 rounded block text-center">{row.priority}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 6. Pending / In Progress Sprints */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 flex items-center gap-1.5 border-b border-slate-100 pb-1">
          <AlertTriangle className="h-3.5 w-3.5 text-indigo-500" /> 5. Pending & In-Progress Sprints
        </h3>
        <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
          {rows.filter(r => r.testingStatus === 'Pending' || r.testingStatus === 'In Progress').length === 0 ? (
            <p className="text-[10px] text-slate-400 italic">No items pending QA review.</p>
          ) : (
            rows.filter(r => r.testingStatus === 'Pending' || r.testingStatus === 'In Progress').map((row) => (
              <div key={row.id} className="py-2 flex justify-between text-[11px]">
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-800">{row.testPoint}</p>
                  <p className="text-[9px] text-slate-450">Module: {(modules.find(m => m.id === row.moduleId)?.name || 'General')} • Assignees: {row.assignedUsers?.join(', ') || 'Unassigned'}</p>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded h-fit ${
                  row.testingStatus === 'In Progress' ? 'text-sky-650 bg-sky-50' : 'text-slate-650 bg-slate-100'
                }`}>{row.testingStatus}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 7. Risk Assessment */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 flex items-center gap-1.5 border-b border-slate-100 pb-1">
          <ShieldAlert className="h-3.5 w-3.5 text-indigo-500" /> 6. Risk Assessment
        </h3>
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
          riskStatus === 'HIGH' 
            ? 'bg-rose-50/40 border-rose-200 text-rose-800' 
            : riskStatus === 'MEDIUM'
              ? 'bg-amber-50/40 border-amber-200 text-amber-800'
              : 'bg-emerald-50/40 border-emerald-200 text-emerald-800'
        }`}>
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${
            riskStatus === 'HIGH' ? 'bg-rose-100 text-rose-600' : riskStatus === 'MEDIUM' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
          }`}>
            {riskStatus}
          </div>
          <div className="space-y-0.5 text-xs">
            <h4 className="font-bold">Calculated Sprint Risk Level: {riskStatus}</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
              {riskStatus === 'HIGH' && `Critical priority failures exist. Core security or performance validations are failing, presenting launch blocks.`}
              {riskStatus === 'MEDIUM' && `Some High priority issues remain unresolved. Testing timeline should focus on debugging before final sign-off.`}
              {riskStatus === 'LOW' && `All main test points are clear or minor items only. Project metrics are stable.`}
            </p>
          </div>
        </div>
      </div>

      {/* 8. AI Summary (Section 9 in requirement) */}
      {lastAiSummary && (
        <div className="space-y-3 p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl page-break">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5 border-b border-indigo-100/50 pb-1">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> 7. AI Testing Insights
          </h3>
          <div className="text-[10px] text-slate-650 space-y-3 leading-relaxed">
            <div>
              <span className="font-bold text-slate-800">Quality Summary:</span>
              <p className="mt-0.5">{lastAiSummary.testingSummary.replace(/[#*`]/g, '')}</p>
            </div>
            <div>
              <span className="font-bold text-slate-800">Risk Assessment:</span>
              <p className="mt-0.5">{lastAiSummary.riskAssessment.replace(/[#*`]/g, '')}</p>
            </div>
          </div>
        </div>
      )}

      {/* 9. Recommendations & Review Comments (Section 8 & 11 in requirement) */}
      <div className="space-y-4 pt-2 page-break">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 flex items-center gap-1.5 border-b border-slate-100 pb-1">
          <ListChecks className="h-3.5 w-3.5 text-indigo-500" /> 8. Recommendations & Notes
        </h3>

        <div className="grid grid-cols-2 gap-4 items-start">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase">Key Sprints Recommendations</span>
            <ul className="text-[10px] text-slate-600 list-decimal pl-4 space-y-1 font-medium">
              <li>Deploy hotfixes for critical failures immediately to unblock release runs.</li>
              <li>Re-allocate developer resources to resolve active blockers.</li>
              <li>Schedule regression tests for resolved items before the next milestone.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase block">Recent Comments Appendices</span>
            <div className="space-y-2 max-h-[120px] overflow-y-auto">
              {rows.filter(r => r.notes.length > 0).slice(0, 3).map((row) => (
                <div key={row.id} className="text-[9px] text-slate-500">
                  <span className="font-semibold text-slate-700 block">{row.testPoint}</span>
                  <p className="italic">"{row.notes[row.notes.length - 1]?.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
