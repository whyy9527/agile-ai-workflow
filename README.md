# Agile AI Workflow MCP Server

本项目是一个完全兼容 MCP 插件的 VSCode AI 工作流服务，支持敏捷团队多角色自动协作（BA、TL、DEV、QA）。

## 功能简介

- MCP Server，支持自动发现和调用多个“角色工具”
- 角色工具包括：
  - BA（业务分析师）：生成 user stories（YAML）
  - TL（技术负责人）：拆分技术任务（YAML）
  - DEV（开发）：生成伪代码与实现建议（Markdown）
  - QA（测试）：生成测试用例（YAML）
- 每个工具均为独立 MCP Tool，支持多任务并发、任务状态与结果查询
- 支持 OpenAI GPT-4o（默认，需配置 API Key）
- 支持本地 Ollama（可选，见 askLLM.ts）

## 快速开始

1. **安装依赖**

```sh
npm install
```

2. **配置 OpenAI Key**

在根目录新建 `.env` 文件：

```
OPENAI_API_KEY=sk-你的真实OpenAI密钥
```

3. **启动服务**

```sh
npx ts-node server.ts
```

4. **接口说明**

- POST `/tools/{tool}` 提交任务，返回 task_id
- GET `/tools/{tool}/{task_id}` 获取结果
- GET `/tools/{tool}/{task_id}/status` 查询状态
- GET `/tools/{tool}` 获取工具元数据
- GET `/manifest.json` 获取所有工具元数据

## 目录结构

```
.
├── tools/         # 各敏捷角色工具实现
├── prompts/       # 各角色 LLM prompt
├── utils/askLLM.ts# LLM 调用封装（支持 OpenAI/Ollama）
├── taskManager.ts # 任务状态与结果缓存
├── server.ts      # 主服务入口
├── manifest.json  # MCP 插件元数据
├── .env           # OpenAI 密钥（已被 .gitignore 忽略）
└── .gitignore
```

## 说明

- 默认只用 OpenAI，如需 Ollama 本地模型请修改 `askLLM.ts`
- 适配 VSCode MCP 插件自动发现与调用
- 仅供学习与团队敏捷协作自动化参考
