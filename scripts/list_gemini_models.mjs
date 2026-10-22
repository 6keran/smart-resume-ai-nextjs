import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/^GEMINI_API_KEY=(.+)$/m);
if (!match) {
  console.log('No key found in .env.local');
  process.exit(1);
}
const key = match[1].trim().replace(/^["']|["']$/g, '');
const ai = new GoogleGenAI({ apiKey: key });

async function main() {
  const candidates = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];
  for (const m of candidates) {
    try {
      console.log(`Testing model: ${m}...`);
      const res = await ai.models.generateContent({
        model: m,
        contents: 'What is the capital of Japan? Answer in 5 words or less.'
      });
      console.log(`✓ SUCCESS with ${m}:`, res.text.trim());
      break;
    } catch (err) {
      console.log(`✗ Error with ${m}:`, err.message.slice(0, 120));
    }
  }
}

main();
