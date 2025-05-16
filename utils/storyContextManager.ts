import fs from 'fs/promises';
import path from 'path';

export interface RoleOutput {
  role: string;
  content: string;
  timestamp: string;
}

export class StoryContextManager {
  private storyDir: string;

  constructor(storyDir: string = path.join(process.cwd(), 'story')) {
    this.storyDir = storyDir;
  }

  private getStoryPath(storyId: string) {
    return path.join(this.storyDir, `${storyId}.json`);
  }

  async readContext(storyId: string): Promise<RoleOutput[]> {
    const storyPath = this.getStoryPath(storyId);
    try {
      const data = await fs.readFile(storyPath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  async appendOutput(storyId: string, role: string, content: string) {
    const outputs = await this.readContext(storyId);
    outputs.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
    const storyPath = this.getStoryPath(storyId);
    await fs.mkdir(this.storyDir, { recursive: true });
    await fs.writeFile(storyPath, JSON.stringify(outputs, null, 2), 'utf-8');
  }

  async getLatestByRole(storyId: string, role: string): Promise<string | undefined> {
    const outputs = await this.readContext(storyId);
    const found = outputs.reverse().find(o => o.role === role);
    return found?.content;
  }

  async getAllContextText(storyId: string): Promise<string> {
    const outputs = await this.readContext(storyId);
    return outputs.map(o => `## ${o.role}\n${o.content}`).join('\n\n');
  }
}

export const storyContextManager = new StoryContextManager();
