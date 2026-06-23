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
    <div className="glass-card p-6 rounded-xl premium-border mb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_10px_rgba(208,188,255,0.2)]">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div>
            <h4 className="text-body-lg font-bold text-slate-800 dark:text-slate-100">
              AI-Powered Report Analyst
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Provider: <span className="font-bold text-primary uppercase">{settings.apiKey ? settings.aiProvider : 'Local Rule Engine'}</span> • Real-time audit metrics & launch readiness feedback
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastAiSummary && (
            <button
              onClick={copyAll}
              className="flex items-center gap-1.5 px-4 py-2 text-body-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg transition-all"
            >
              {copiedSection === 'all' ? (
                <>
                  <Check className="h-4 w-4 text-secondary" />
                  <span>Copied All</span>
                </>
              ) : (
                <>
                  <Clipboard className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span>Copy Full Report</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-body-sm font-bold text-on-primary-container bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-primary/20 transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>{lastAiSummary ? 'Recalculate Summary' : 'Generate Summary'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main summary container */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[20px] rounded-full"></div>
            <RefreshCw className="h-10 w-10 text-primary animate-spin relative" />
          </div>
          <p className="text-body-sm text-slate-500 dark:text-slate-400 animate-pulse font-medium">
            Reviewing test points, compiling criteria, and generating executive brief...
          </p>
        </div>
      ) : lastAiSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 animate-fade-in">
          {/* Box 1: Testing Summary */}
          <div className="relative border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/30 hover:bg-white dark:bg-slate-800/50 transition-colors p-5 rounded-xl">
            <button
              onClick={() => copyToClipboard(lastAiSummary.testingSummary, 'test')}
              className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
              title="Copy Section"
            >
              {copiedSection === 'test' ? <Check className="h-4 w-4 text-secondary" /> : <Clipboard className="h-4 w-4" />}
            </button>
            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-500 dark:text-slate-400 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: formatMarkdown(lastAiSummary.testingSummary) }} />
            </div>
          </div>

          {/* Box 2: Progress Summary */}
          <div className="relative border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/30 hover:bg-white dark:bg-slate-800/50 transition-colors p-5 rounded-xl">
            <button
              onClick={() => copyToClipboard(lastAiSummary.progressSummary, 'prog')}
              className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
              title="Copy Section"
            >
              {copiedSection === 'prog' ? <Check className="h-4 w-4 text-secondary" /> : <Clipboard className="h-4 w-4" />}
            </button>
            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-500 dark:text-slate-400 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: formatMarkdown(lastAiSummary.progressSummary) }} />
            </div>
          </div>

          {/* Box 3: Risk Assessment */}
          <div className="relative border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/30 hover:bg-white dark:bg-slate-800/50 transition-colors p-5 rounded-xl">
            <button
              onClick={() => copyToClipboard(lastAiSummary.riskAssessment, 'risk')}
              className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
              title="Copy Section"
            >
              {copiedSection === 'risk' ? <Check className="h-4 w-4 text-error" /> : <Clipboard className="h-4 w-4" />}
            </button>
            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-500 dark:text-slate-400 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: formatMarkdown(lastAiSummary.riskAssessment) }} />
            </div>
          </div>

          {/* Box 4: Action Queue */}
          <div className="relative border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/30 hover:bg-white dark:bg-slate-800/50 transition-colors p-5 rounded-xl">
            <button
              onClick={() => copyToClipboard(lastAiSummary.pendingTasksSummary, 'tasks')}
              className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
              title="Copy Section"
            >
              {copiedSection === 'tasks' ? <Check className="h-4 w-4 text-secondary" /> : <Clipboard className="h-4 w-4" />}
            </button>
            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-500 dark:text-slate-400 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: formatMarkdown(lastAiSummary.pendingTasksSummary) }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center bg-white dark:bg-slate-800/10">
          <p className="text-body-sm text-slate-500 dark:text-slate-400">
            Click "Generate Summary" above to let AI analyze development pipelines and project readiness.
          </p>
        </div>
      )}
    </div>
  );
};

// Simple helper to convert markdown lists & headers to HTML inline for visualization
const formatMarkdown = (md: string): string => {
  return md
    .replace(/### (.*)/g, '<h5 class="font-bold text-slate-800 dark:text-slate-100 mb-3 text-label-caps uppercase tracking-wider flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-primary"></span>$1</h5>')
    .replace(/#### (.*)/g, '<h6 class="font-semibold text-slate-800 dark:text-slate-100 mb-2 text-body-sm">$1</h6>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-800 dark:text-slate-100">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px] font-mono text-primary border border-slate-200 dark:border-slate-700/50">$1</code>')
    .replace(/\* (.*)/g, '<li class="ml-4 list-disc text-slate-500 dark:text-slate-400 py-0.5">$1</li>')
    .replace(/- (.*)/g, '<div class="text-slate-500 dark:text-slate-400 py-0.5 pl-2 border-l-2 border-slate-200 dark:border-slate-700 ml-1 my-1">$1</div>')
    .replace(/\n/g, '<br />');
};
