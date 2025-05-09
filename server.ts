import 'dotenv/config';
import express, { Request, Response } from 'express';
import { runTool as runBA } from './tools/ba.tool';
import { runTool as runTL } from './tools/tl.tool';
import { runTool as runDEV } from './tools/dev.tool';
import { runTool as runQA } from './tools/qa.tool';
import { taskManager } from './taskManager';
import manifest from './manifest.json';

const app = express();
app.use(express.json());

const tools = {
  ba: runBA,
  tl: runTL,
  dev: runDEV,
  qa: runQA,
};

Object.entries(tools).forEach(([toolName, runTool]) => {
  app.post(`/tools/${toolName}`, async (req: Request, res: Response): Promise<void> => {
    const input = JSON.stringify(req.body);
    const taskId = taskManager.createTask(toolName);
    runTool(input)
      .then(result => taskManager.setResult(taskId, result))
      .catch(err => taskManager.setResult(taskId, `Error: ${err}`));
    res.json({ task_id: taskId });
  });

  app.get(`/tools/${toolName}/:task_id`, (req: Request, res: Response): void => {
    const result = taskManager.getResult(req.params.task_id);
    if (result === undefined) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ result });
  });

  app.get(`/tools/${toolName}/:task_id/status`, (req: Request, res: Response): void => {
    const status = taskManager.getStatus(req.params.task_id);
    if (status === undefined) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ status });
  });

  app.get(`/tools/${toolName}`,(req: Request, res: Response): void => {
    const toolMeta = manifest.tools.find((t: any) => t.name === toolName);
    res.json(toolMeta || {});
  });
});

app.get('/manifest.json', (req: Request, res: Response): void => {
  res.json(manifest);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});
