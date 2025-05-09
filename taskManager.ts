type TaskStatus = 'pending' | 'completed';

class TaskManager {
  private tasks: Map<string, { status: TaskStatus; result?: string }> = new Map();

  createTask(): string {
    const taskId = Math.random().toString(36).slice(2, 10);
    this.tasks.set(taskId, { status: 'pending' });
    return taskId;
  }

  setResult(taskId: string, result: string) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = 'completed';
      task.result = result;
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
