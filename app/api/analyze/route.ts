import { NextResponse } from 'next/server';
import { generateAIContent } from '../aiHelper';

/**
 * POST /api/analyze
 * Expects JSON body: { excelData: any[] }
 * Returns: { summary: string }
 */
export async function POST(request: Request) {
  try {
    const { excelData } = await request.json();
    if (!excelData || !Array.isArray(excelData) || excelData.length === 0) {
      return NextResponse.json({ error: 'Spreadsheet dataset is empty.' }, { status: 400 });
    }

    // Prepare a concise prompt for Gemini 2.5 flash model
    const prompt = `You are an elite QA Automation & Operations Analyst for QAFlow Pro.
Analyze the provided spreadsheet data and generate a premium executive summary.
Format the response using markdown headings and bullet points.
## 📊 Executive Summary
- High-level overview of insights.
## 🔍 Key Insights & Test Metrics
- Highlight major patterns, failures, or passes.
## 💡 Actionable Next Steps
- Recommendations for the testing team.
Raw Data:\n${JSON.stringify(excelData)}`;

    // Generate content using dynamic AI helper (Gemini or Groq fallback)
    const summary = await generateAIContent([prompt]);

    return NextResponse.json({ summary });
  } catch (error: unknown) {
    console.error('Gemini API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
