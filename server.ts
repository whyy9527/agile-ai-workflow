/*
MIT License
Copyright (c) 2025
*/

import express, { Request, Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import manifest from './manifest.json';
import { runTool as runBA } from './tools/ba.tool';
import { runTool as runTL } from './tools/tl.tool';
import { runTool as runDEV } from './tools/dev.tool';
import { runTool as runQA } from './tools/qa.tool';
import { outputLogger } from './utils/outputLogger';

const app = express();
app.use(express.json());

// Set up MCP server
const server = new McpServer({
  name: manifest.name,
  version: manifest.version,
  description: manifest.description
});

// Register tools (all take a string input)
server.tool(
  'ba',
  { input: z.string() },
  async ({ input }) => {
    const output = await runBA(input);
    await outputLogger.saveOutput('ba', output);
    return {
      content: [{ type: 'text', text: output }]
    };
  }
);
server.tool(
  'tl',
  { input: z.string() },
  async ({ input }) => {
    const output = await runTL(input);
    await outputLogger.saveOutput('tl', output);
    return {
      content: [{ type: 'text', text: output }]
    };
  }
);
server.tool(
  'dev',
  { input: z.string() },
  async ({ input }) => {
    const output = await runDEV(input);
    await outputLogger.saveOutput('dev', output);
    return {
      content: [{ type: 'text', text: output }]
    };
  }
);
server.tool(
  'qa',
  { input: z.string() },
  async ({ input }) => {
    const output = await runQA(input);
    await outputLogger.saveOutput('qa', output);
    return {
      content: [{ type: 'text', text: output }]
    };
  }
);

// MCP Streamable HTTP endpoint
app.post('/mcp', async (req: Request, res: Response) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on('close', () => {
    transport.close();
    server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

// Health check
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'MCP server is running.' });
});

// List all outputs endpoint
app.get('/outputs', async (req: Request, res: Response) => {
  try {
    const outputs: Record<string, string[]> = {};
    const toolNames = ['ba', 'tl', 'dev', 'qa'];
    
    for (const tool of toolNames) {
      try {
        const toolDir = `${process.cwd()}/outputs/${tool}`;
        const files = await import('fs/promises').then(fs => fs.readdir(toolDir).catch(() => []));
        outputs[tool] = files.map(file => `${toolDir}/${file}`);
      } catch (error) {
        outputs[tool] = [];
      }
    }
    
    res.json({ outputs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list outputs' });
  }
});

// Manifest endpoint
app.get('/manifest.json', (req: Request, res: Response) => {
  res.json(manifest);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP server running on http://localhost:${PORT}`);
  console.log(`Output files will be saved to ${process.cwd()}/outputs`);
});
