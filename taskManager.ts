import fs from 'fs/promises';
import path from 'path';

type TaskStatus = 'pending' | 'completed';

class TaskManager {
  private tasks: Map<string, { status: TaskStatus; result?: string; tool?: string }> = new Map();
  private outputDir = path.join(process.cwd(), 'outputs');

  constructor() {
    fs.mkdir(this.outputDir, { recursive: true }).catch(() => {});
  }

  createTask(tool?: string): string {
    const taskId = Math.random().toString(36).slice(2, 10);
    this.tasks.set(taskId, { status: 'pending', tool });
    return taskId;
  }

  async setResult(taskId: string, result: string) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = 'completed';
      task.result = result;
      const tool = task.tool || 'unknown';
      const dir = path.join(this.outputDir, tool);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, `${taskId}.txt`), result, 'utf-8');
    }
  }

  getResult(taskId: string): string | undefined {
    return this.tasks.get(taskId)?.result;
  }

  getStatus(taskId: string): TaskStatus | undefined {
    return this.tasks.get(taskId)?.status;
  }
}

export const taskManager = new TaskManager();
