import { GoogleGenAI } from '@google/genai';

/**
 * Helper to generate AI content. If the GEMINI_API_KEY is a Groq key (starts with gsk_),
 * it falls back to using the Groq OpenAI-compatible endpoint. Otherwise, it uses the Google GenAI SDK.
 */
export async function generateAIContent(contents: any[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable.');
  }

  // Detect Groq API Key and use its OpenAI-compatible completions endpoint
  if (apiKey.startsWith('gsk_')) {
    const messages: any[] = [];
    let textContent = '';
    const imageUrls: string[] = [];

    const parts = Array.isArray(contents) ? contents : [contents];
    for (const part of parts) {
      if (typeof part === 'string') {
        textContent += (textContent ? '\n' : '') + part;
      } else if (part && typeof part === 'object') {
        if ('text' in part) {
          textContent += (textContent ? '\n' : '') + part.text;
        } else if ('inlineData' in part) {
          const mimeType = part.inlineData.mimeType || 'image/jpeg';
          const data = part.inlineData.data;
          imageUrls.push(`data:${mimeType};base64,${data}`);
        }
      }
    }

    let model = 'llama-3.3-70b-versatile';
    let messageContent: any = textContent;

    if (imageUrls.length > 0) {
      model = 'llama-3.2-11b-vision-preview';
      messageContent = [
        { type: 'text', text: textContent },
        ...imageUrls.map(url => ({
          type: 'image_url',
          image_url: { url }
        }))
      ];
    }

    messages.push({
      role: 'user',
      content: messageContent
    });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.1,
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // Default Gemini API implementation
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contents,
  });
  return response.text ?? '';
}
