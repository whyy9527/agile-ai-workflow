import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { runTool as runBA } from './tools/ba.tool.ts';
import { runTool as runTL } from './tools/tl.tool.ts';
import { runTool as runQA } from './tools/qa.tool.ts';
import { runTool as runFacilitator } from './tools/facilitator.tool.ts';
import { outputLogger } from './utils/outputLogger.ts';
import manifest from './manifest.json' with { type: "json" };

// Create an MCP server
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
    const output = await runBA(input, '001');
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
    const output = await runTL(input, '001');
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
    const output = await runQA(input, '001');
    await outputLogger.saveOutput('qa', output);
    return {
      content: [{ type: 'text', text: output }]
    };
  }
);

server.tool(
  'facilitator',
  { input: z.string() },
  async ({ input }) => {
    const output = await runFacilitator(input, '001');
    await outputLogger.saveOutput('facilitator', output);
    return {
      content: [{ type: 'text', text: output }]
    };
  }
);

// Add a dynamic greeting resource
server.resource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  async (uri, { name }) => ({
    contents: [{
      uri: uri.href,
      text: `Hello, ${name}!`
    }]
  })
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
