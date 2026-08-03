import { GoogleGenerativeAI } from '@google/generative-ai';

const model = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)
  .getGenerativeModel({ model: 'gemini-flash-latest', generationConfig: { responseMimeType: 'application/json' } });

export async function askAI<T>(prompt: string, retries = 2): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await model.generateContent(prompt);
      const text = res.response.text().trim().replace(/^```json\s*|```$/g, '');
      return JSON.parse(text);
    } catch (err: any) {
      const isOverloaded = err.status === 503;
      if (isOverloaded && attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); // backoff: 1s, 2s
        continue;
      }
      throw err;
    }
  }
  throw new Error('askAI: unreachable');
}