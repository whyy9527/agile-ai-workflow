import { askLLM } from '../utils/askLLM.ts';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runTool(input: string): Promise<string> {
  const promptPath = path.join(__dirname, '../prompts/ba.txt');
  const prompt = await fs.readFile(promptPath, 'utf-8');
  return askLLM(prompt, input);
}
