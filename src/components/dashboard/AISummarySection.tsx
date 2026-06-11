import React, { useState } from 'react';
import { generateTestingSummary } from '../../utils/aiSummary';
import { TestRow, ProjectSettings, useStore } from '../../store/useStore';
import { Sparkles, Clipboard, Check, RefreshCw } from 'lucide-react';

interface AISummarySectionProps {
  rows: TestRow[];
  settings: ProjectSettings;
}

export const AISummarySection: React.FC<AISummarySectionProps> = ({ rows, settings }) => {
  const { lastAiSummary, setAiSummary } = useStore();
  const [loading, setLoading] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateTestingSummary(rows, settings);
      setAiSummary(result);
    } catch (err) {
      console.error(err);
      alert('Failed to generate summary: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const copyAll = () => {
    if (!lastAiSummary) return;
    const fullText = `${lastAiSummary.testingSummary}\n\n${lastAiSummary.progressSummary}\n\n${lastAiSummary.riskAssessment}\n\n${lastAiSummary.pendingTasksSummary}`;
    copyToClipboard(fullText, 'all');
  };

  return (
    <div className="glass-panel border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 mb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
          <div>
            <h4 className="text-sm font-bold font-display text-slate-800 dark:text-slate-200">
              AI-Powered Report Analyst
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Provider: <span className="font-semibold text-indigo-500 uppercase">{settings.apiKey ? settings.aiProvider : 'Local Rule Engine'}</span> • Real-time audit metrics & launch readiness feedback.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastAiSummary && (
            <button
              onClick={copyAll}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-xl transition-all"
            >
              {copiedSection === 'all' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Copied All</span>
                </>
              ) : (
                <>
                  <Clipboard className="h-3.5 w-3.5" />
                  <span>Copy Full Report</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-350 dark:disabled:bg-slate-800 disabled:cursor-not-allowed rounded-xl shadow-sm hover:shadow transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Analyzing Data...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>{lastAiSummary ? 'Recalculate Summary' : 'Generate Testing Summary'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main summary container */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400 animate-pulse font-medium">
            Reviewing test points, compiling expected vs actual criteria, and generating executive brief...
          </p>
        </div>
      ) : lastAiSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-fade-in">
          {/* Box 1: Testing Summary */}
          <div className="relative border border-slate-200/50 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-900/10 p-4 rounded-xl space-y-1">
            <button
              onClick={() => copyToClipboard(lastAiSummary.testingSummary, 'test')}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250"
              title="Copy Section"
            >
              {copiedSection === 'test' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Clipboard className="h-3.5 w-3.5" />}
            </button>
            <div className="prose prose-xs dark:prose-invert max-w-none text-slate-700 dark:text-slate-350 text-xs leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: formatMarkdown(lastAiSummary.testingSummary) }} />
            </div>
          </div>

          {/* Box 2: Progress Summary */}
          <div className="relative border border-slate-200/50 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-900/10 p-4 rounded-xl space-y-1">
            <button
              onClick={() => copyToClipboard(lastAiSummary.progressSummary, 'prog')}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250"
              title="Copy Section"
            >
              {copiedSection === 'prog' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Clipboard className="h-3.5 w-3.5" />}
            </button>
            <div className="prose prose-xs dark:prose-invert max-w-none text-slate-700 dark:text-slate-350 text-xs leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: formatMarkdown(lastAiSummary.progressSummary) }} />
            </div>
          </div>

          {/* Box 3: Risk Assessment */}
          <div className="relative border border-slate-200/50 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-900/10 p-4 rounded-xl space-y-1">
            <button
              onClick={() => copyToClipboard(lastAiSummary.riskAssessment, 'risk')}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250"
              title="Copy Section"
            >
              {copiedSection === 'risk' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Clipboard className="h-3.5 w-3.5" />}
            </button>
            <div className="prose prose-xs dark:prose-invert max-w-none text-slate-700 dark:text-slate-350 text-xs leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: formatMarkdown(lastAiSummary.riskAssessment) }} />
            </div>
          </div>

          {/* Box 4: Action Queue */}
          <div className="relative border border-slate-200/50 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-900/10 p-4 rounded-xl space-y-1">
            <button
              onClick={() => copyToClipboard(lastAiSummary.pendingTasksSummary, 'tasks')}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250"
              title="Copy Section"
            >
              {copiedSection === 'tasks' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Clipboard className="h-3.5 w-3.5" />}
            </button>
            <div className="prose prose-xs dark:prose-invert max-w-none text-slate-700 dark:text-slate-350 text-xs leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: formatMarkdown(lastAiSummary.pendingTasksSummary) }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="py-6 border border-dashed border-slate-250 dark:border-slate-800 rounded-xl text-center">
          <p className="text-xs text-slate-500 dark:text-slate-450">
            Click "Generate Testing Summary" above to let AI analyze development pipelines and project readiness.
          </p>
        </div>
      )}
    </div>
  );
};

// Simple helper to convert markdown lists & headers to HTML inline for visualization
const formatMarkdown = (md: string): string => {
  return md
    .replace(/### (.*)/g, '<h5 class="font-bold text-slate-850 dark:text-white mb-2 text-xs uppercase tracking-wide flex items-center">$1</h5>')
    .replace(/#### (.*)/g, '<h6 class="font-semibold text-slate-800 dark:text-slate-200 mb-1 text-xs">$1</h6>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-slate-100">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-200/60 dark:bg-slate-850 px-1 py-0.5 rounded text-[10px] font-mono text-slate-900 dark:text-slate-100">$1</code>')
    .replace(/\* (.*)/g, '<li class="ml-2.5 list-disc text-slate-600 dark:text-slate-400">$1</li>')
    .replace(/- (.*)/g, '<div class="text-slate-650 dark:text-slate-400 py-0.5">• $1</div>')
    .replace(/\n/g, '<br />');
};
