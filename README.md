# Agile AI Workflow MCP Server

This project is a fully MCP-compatible VSCode AI workflow server, supporting agile team multi-role collaboration (BA, TL, DEV, QA).

## Features

- MCP server with automatic discovery and invocation of multiple "role tools"
- Role tools include:
  - BA (Business Analyst): Generate user stories (YAML)
  - TL (Tech Lead): Split user stories into technical tasks (YAML)
  - DEV (Developer): Generate pseudocode and implementation suggestions (Markdown)
  - QA (Tester): Generate test cases (YAML)
- Each tool is an independent MCP Tool, supporting concurrent tasks, status, and result queries
- Supports OpenAI GPT-4o (default, requires API Key configuration)
- Supports local Ollama (optional, see askLLM.ts)

## Quick Start

1. **Install dependencies**

```sh
npm install
```

2. **Configure OpenAI Key**

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=sk-your-real-openai-key
```

3. **Start the server**

```sh
npm start
```

or

```sh
npx ts-node server.ts
```

4. **API Endpoints**

- POST `/tools/{tool}`: Submit a task, returns `task_id`
- GET `/tools/{tool}/{task_id}`: Get result
- GET `/tools/{tool}/{task_id}/status`: Query status
- GET `/tools/{tool}`: Get tool metadata
- GET `/manifest.json`: Get all tool metadata

## Project Structure

```text
.
├── tools/         # Implementation of each agile role tool
├── prompts/       # LLM prompts for each role
├── utils/askLLM.ts# LLM call wrapper (supports OpenAI/Ollama)
├── taskManager.ts # Task status and result cache
├── server.ts      # Main server entry
├── manifest.json  # MCP plugin metadata
├── .env           # OpenAI key (ignored by .gitignore)
└── .gitignore
```

## Notes

- Uses OpenAI by default. To use local Ollama, modify `askLLM.ts`
- Compatible with VSCode MCP plugin auto-discovery and invocation
- For learning and agile team automation reference only
