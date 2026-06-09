import { NextResponse } from 'next/server';
import { GoogleGenerativeAI as GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: Request) {
  try {
    const { prompt, imageBase64 } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    let parts: any[] = [{ text: prompt }];

    if (imageBase64) {
      // Expecting base64 string without data:image prefix, or we strip it
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg'
        }
      });
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = await response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Gemini Vision API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
