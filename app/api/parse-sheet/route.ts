import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/**
 * POST /api/parse-sheet
 * Expects JSON body: { rawJson: any[][], availableUsers: string[] }
 * Returns: { testPoints: any[] }
 */
export async function POST(request: Request) {
  try {
    const { rawJson, availableUsers } = await request.json();
    if (!rawJson || !Array.isArray(rawJson) || rawJson.length === 0) {
      return NextResponse.json({ error: 'Spreadsheet dataset is empty.' }, { status: 400 });
    }

    const prompt = `You are an elite QA Automation & Operations AI.
I have extracted raw rows from a spreadsheet. Your job is to parse these rows into a strict JSON array of test points.
There are NO manual mapping steps. You must automatically deduce the meaning of the columns.

For each valid row in the raw data, output an object with these exact keys:
- "testPoint" (string) The title or main point of the test.
- "moduleName" (string) The feature or section name.
- "url" (string) URL if applicable.
- "howToTest" (string) Execution steps.
- "expectedResult" (string) Expected outcome.
- "actualResult" (string) Any actual outcome provided.
- "functionalityStatus" (string) MUST BE exactly one of: "Pending", "Working", "Partially Working", "Not Working".
- "testingStatus" (string) MUST BE exactly one of: "Pending", "Passed", "Failed", "In Progress".
- "priority" (string) MUST BE exactly one of: "Low", "Medium", "High", "Critical".
- "assignedUser" (string | null) Choose a user from the provided Available Users list who seems best fit, or pick one randomly to balance the load, or null if none fit.

Available Users: ${availableUsers.join(', ')}

Raw Spreadsheet Rows (JSON):
${JSON.stringify(rawJson)}

Respond ONLY with valid JSON. The root must be a JSON array of objects. Do not include markdown code blocks around the JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: prompt }],
    });
    let text = response.text ?? '';
    
    // Clean up markdown formatting if Gemini included it
    text = text.trim();
    if (text.startsWith('```json')) {
      text = text.substring(7);
      if (text.endsWith('```')) {
        text = text.substring(0, text.length - 3);
      }
    } else if (text.startsWith('```')) {
      text = text.substring(3);
      if (text.endsWith('```')) {
        text = text.substring(0, text.length - 3);
      }
    }

    let parsedTestPoints = [];
    try {
      parsedTestPoints = JSON.parse(text.trim());
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", text);
      throw new Error("AI returned invalid JSON format.");
    }

    return NextResponse.json({ testPoints: parsedTestPoints });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
