/*
MIT License
Copyright (c) 2025
*/

import express, { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import manifest from './manifest.json' with { type: "json" };
import { runTool as runBA } from './tools/ba.tool.ts';
import { runTool as runTL } from './tools/tl.tool.ts';
import { runTool as runQA } from './tools/qa.tool.ts';
import { runTool as runCoach } from './tools/coach.tool.ts';
import { outputLogger } from './utils/outputLogger.ts';

const app = express();
app.use(express.json());

// 健康检查或欢迎页，防止 404
app.get('/', (req, res) => {
  res.status(200).send('MCP server is running. Use /mcp for API requests.');
});

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// Handle POST requests for client-to-server communication
app.post('/mcp', async (req: Request, res: Response) => {
  // Check for existing session ID
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports[sessionId]) {
    // Reuse existing transport
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest(req.body)) {
    // New initialization request
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sessionId) => {
        // Store the transport by session ID
        transports[sessionId] = transport;
      }
    });

    // Clean up transport when closed
    transport.onclose = () => {
      if (transport.sessionId) {
        delete transports[transport.sessionId];
      }
    };
    
    // Create and set up MCP server
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

    server.tool(
      'coach',
      { input: z.string() },
      async ({ input }) => {
        const output = await runCoach(input);
        await outputLogger.saveOutput('coach', output);
        return {
          content: [{ type: 'text', text: output }]
        };
      }
    );

    // Connect to the MCP server
    await server.connect(transport);
  } else {
    // Invalid request
    res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Bad Request: No valid session ID provided',
      },
      id: null,
    });
    return;
  }

  // Handle the request
  await transport.handleRequest(req, res, req.body);
});

// Reusable handler for GET and DELETE requests
const handleSessionRequest = async (req: Request, res: Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }
  
  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
};

// Handle GET requests for server-to-client notifications via SSE
app.get('/mcp', handleSessionRequest);

// Handle DELETE requests for session termination
app.delete('/mcp', handleSessionRequest);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP server running on http://localhost:${PORT}`);
  console.log(`Output files will be saved to ${process.cwd()}/outputs`);
});
