import { askLLM } from '../utils/askLLM';
import fs from 'fs/promises';
import path from 'path';

export async function runTool(input: string): Promise<string> {
  const promptPath = path.join(__dirname, '../prompts/dev.txt');
  const prompt = await fs.readFile(promptPath, 'utf-8');
  return askLLM(prompt, input);
}
