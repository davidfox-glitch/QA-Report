import { NextResponse } from 'next/server';
import { GoogleGenerativeAI as GoogleGenAI } from '@google/genai';

// Initialize Gemini client using the API key from environment variables
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

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

    // Get the Gemini model and generate content
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const summary = await response.text();

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
