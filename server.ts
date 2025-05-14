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
  async ({ input }) => ({
    content: [{ type: 'text', text: await runBA(input) }]
  })
);
server.tool(
  'tl',
  { input: z.string() },
  async ({ input }) => ({
    content: [{ type: 'text', text: await runTL(input) }]
  })
);
server.tool(
  'dev',
  { input: z.string() },
  async ({ input }) => ({
    content: [{ type: 'text', text: await runDEV(input) }]
  })
);
server.tool(
  'qa',
  { input: z.string() },
  async ({ input }) => ({
    content: [{ type: 'text', text: await runQA(input) }]
  })
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

// Manifest endpoint
app.get('/manifest.json', (req: Request, res: Response) => {
  res.json(manifest);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP server running on http://localhost:${PORT}`);
});
