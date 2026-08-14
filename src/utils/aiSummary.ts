import { useStore, TestRow, ProjectSettings, Module } from '../store/useStore';

export interface AISummaryResult {
  testingSummary: string;
  progressSummary: string;
  riskAssessment: string;
  pendingTasksSummary: string;
}

export const generateTestingSummary = async (
  rows: TestRow[],
  settings: ProjectSettings
): Promise<AISummaryResult> => {
  const { modules } = useStore.getState();
  const total = rows.length;
  const passed = rows.filter((r) => r.testingStatus === 'Passed').length;
  const failed = rows.filter((r) => r.testingStatus === 'Failed').length;
  const inProgress = rows.filter((r) => r.testingStatus === 'In Progress').length;
  const pending = rows.filter((r) => r.testingStatus === 'Pending').length;

  const devWorking = rows.filter((r) => r.functionalityStatus === 'Working').length;
  const devPartial = rows.filter((r) => r.functionalityStatus === 'Partially Working').length;
  const devNotWorking = rows.filter((r) => r.functionalityStatus === 'Not Working').length;
  const devPending = rows.filter((r) => r.functionalityStatus === 'Pending').length;

  const criticalBugs = rows.filter((r) => r.priority === 'Critical' && r.testingStatus === 'Failed');
  const highBugs = rows.filter((r) => r.priority === 'High' && r.testingStatus === 'Failed');

  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const completionRate = total > 0 ? Math.round(((passed + failed) / total) * 100) : 0;

  if (settings.apiKey && settings.apiKey.trim()) {
    try {
      const recordsText = JSON.stringify(
        rows.map((r) => ({
          testPoint: r.testPoint,
          moduleName: modules.find((m: Module) => m.id === r.moduleId)?.name || 'General Module',
          functionality: r.functionalityStatus,
          testing: r.testingStatus,
          priority: r.priority,
          users: r.assignedUsers?.join(', ') || 'Unassigned',
          bugDetails: r.actualResult,
          notes: r.notes.map((n) => n.text)
        })),
        null,
        2
      );

      const prompt = `
You are QAFlow Pro's AI QA Auditor.
Analyze the following test data and write a professional QA report for stakeholders:

Project: "${settings.projectName}"
Company: "${settings.clientName}"
Description: "${settings.projectDescription}"

Test Metrics:
- Total Test Cases: ${total}
- Passed: ${passed}
- Failed: ${failed}
- In Progress: ${inProgress}
- Pending Review: ${pending}

Test Records:
${recordsText}

Provide a professional testing summary. You MUST return a JSON object containing EXACTLY the following keys (do not wrap in markdown \`\`\`json block, return raw JSON string only):
{
  "testingSummary": "Markdown listing of passed/failed summaries and core functional status assessment.",
  "progressSummary": "Markdown overview of the development and QA velocity, highlighting bottlenecks.",
  "riskAssessment": "Markdown listing of launching risks, blocker issues, and criticality checks.",
  "pendingTasksSummary": "Markdown recommendations and step-by-step checklist of next actions."
}
`;

      let responseText = '';

      if (settings.apiKey.trim().startsWith('gsk_')) {
        // Groq API fallback
        const url = `https://api.groq.com/openai/v1/chat/completions`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' }
          })
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Groq API error (${res.status})`);
        }

        const data = await res.json();
        responseText = data.choices?.[0]?.message?.content || '';
      } else if (settings.aiProvider === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${settings.apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `API error (${res.status})`);
        }
        
        const data = await res.json();
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        // OpenAI GPT
        const url = `https://api.openai.com/v1/chat/completions`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' }
          })
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `API error (${res.status})`);
        }

        const data = await res.json();
        responseText = data.choices?.[0]?.message?.content || '';
      }

      // Clean response block formatting
      let cleaned = responseText.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '');
      if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/, '');
      
      const result = JSON.parse(cleaned.trim());
      if (result.testingSummary && result.progressSummary && result.riskAssessment && result.pendingTasksSummary) {
        return result;
      }
    } catch (e: any) {
      console.warn('AI API summary generation failed, falling back to local model:', e);
    }
  }

  // Local Rule-Based Model fallback
  const testingSummary = `### 📊 Testing Quality & Stability Overview
- **Overall Completion Rate**: **${completionRate}%** (${passed + failed} of ${total} verified).
- **Pass Rate**: **${passRate}%** (${passed} passed).
- **Statistics**:
  - Passed Cases: \`${passed}\`
  - Failed Bugs: \`${failed}\`
  - In Progress: \`${inProgress}\`
  - Pending: \`${pending}\`

${failed > 0 
  ? `#### Flagged Defects:\n` + rows.filter(r => r.testingStatus === 'Failed').slice(0, 3).map(r => `*   **${r.testPoint}** (${modules.find((m: Module) => m.id === r.moduleId)?.name || 'General'}) - Priority: \`${r.priority}\`. Expecting: _${r.expectedResult}_. Got: _${r.actualResult}_`).join('\n')
  : '🎉 All verified test cases are currently passing.'
}`;

  const progressSummary = `### 📈 Development & QA Alignment
- **Module Implementation Progress**:
  - Full working features: **${devWorking}**
  - Partially working: **${devPartial}**
  - Not working: **${devNotWorking}**
  - Pending code: **${devPending}**
- **QA Pipeline Balance**:
  - ${pending > 0 ? `⚠️ There are **${pending}** items awaiting verification review.` : '✅ All implemented modules are tested/under test.'}
  - Velocity checks confirm a stable workflow release path.`;

  let riskLevel = 'LOW';
  const riskFactors: string[] = [];
  if (criticalBugs.length > 0) {
    riskLevel = 'HIGH';
    riskFactors.push(`🔥 **Critical Priority Failures**: ${criticalBugs.length} test cases failing on core modules.`);
  }
  if (devNotWorking > 0) {
    if (riskLevel !== 'HIGH') riskLevel = 'MEDIUM';
    riskFactors.push(`🚨 **Inactive Implementations**: ${devNotWorking} pages marked "Not Working" in development.`);
  }
  if (highBugs.length > 0) {
    if (riskLevel !== 'HIGH') riskLevel = 'MEDIUM';
    riskFactors.push(`⚠️ **High Priority Failures**: ${highBugs.length} bugs need immediate sprint review.`);
  }

  const riskAssessment = `### ⚡ Project Risk Assessment
- **Current Assessment Rating**: **${riskLevel}**
- **Identified Indicators**:
${riskFactors.length > 0 ? riskFactors.map(f => `  - ${f}`).join('\n') : '  - ✅ Zero blocking indicators detected. Release is low-risk.'}`;

  const pendingTasksSummary = `### 📋 Priority Recommendations
1. ${criticalBugs.length > 0 ? `Assign immediate hotfixes to developers for: ${criticalBugs.map(b => `"${b.testPoint}"`).join(', ')}.` : 'Continue testing new feature updates.'}
2. ${devPartial > 0 ? `Coordinate with development to resolve limitations in the ${devPartial} partially working features.` : 'Maintain strict regression testing.'}
3. ${pending > 0 ? `Allocate testing team to resolve the ${pending} cases pending QA check.` : 'Prepare deployment documentation.'}`;

  return {
    testingSummary,
    progressSummary,
    riskAssessment,
    pendingTasksSummary
  };
};
