import { askLLM } from '../utils/askLLM.ts';
import { storyContextManager } from '../utils/storyContextManager.ts';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runTool(input: string, storyId?: string): Promise<string> {
  let contextText = '';
  if (storyId) {
    contextText = await storyContextManager.getAllContextText(storyId);
  }
  const promptPath = path.join(__dirname, '../prompts/qa.txt');
  const prompt = await fs.readFile(promptPath, 'utf-8');
  const llmInput = contextText ? `${contextText}\n\n${input}` : input;
  const output = await askLLM(prompt, llmInput);
  if (storyId && output) {
    await storyContextManager.appendOutput(storyId, 'QA', output);
  }
  return output;
}
