import { askLLM } from '../utils/askLLM.ts';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runTool(input: string, storyId?: string): Promise<string> {
  let storyMarkdown = '';
  let storyPath = '';
  if (storyId) {
    storyPath = path.join(__dirname, '../story', `${storyId}.md`);
    try {
      storyMarkdown = await fs.readFile(storyPath, 'utf-8');
    } catch (e) {
      storyMarkdown = `# User Story: ${storyId}\n\n`;
      await fs.writeFile(storyPath, storyMarkdown, 'utf-8');
    }
  }
  const promptPath = path.join(__dirname, '../prompts/tl.txt');
  const prompt = await fs.readFile(promptPath, 'utf-8');
  const llmInput = storyMarkdown ? `${storyMarkdown}\n\n${input}` : input;
  const output = await askLLM(prompt, llmInput);
  if (storyId && output && output !== storyMarkdown) {
    await fs.writeFile(storyPath, output, 'utf-8');
  }
  return output;
}
