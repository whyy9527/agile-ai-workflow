---
# try also 'default' to start simple
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://cover.sli.dev
# apply any unocss classes to the current slide
class: 'text-center'
# some information about the slides, markdown enabled
info: |
  ## 让每个 AI 各司其职，完成开发全流程。

  Learn more at [Sli.dev](https://sli.dev)
transition: slide-left
title: agile-ai-workflow
mdc: true
---
# 用 MCP 架构构建 AI 敏捷协作工作流

### 让每个 AI 各司其职，完成开发全流程

---

## 背景：为什么要做这件事？

- 当前通用 AI 助手虽强，但难以胜任多人协作型工作：
  - ❌ 很难理解复杂业务目标
  - ❌ 无法拆解任务并明确边界
  - ❌ 多个任务无法共用上下文
  - ❌ 所有对话都要你来“传话”与协调

---

## 背景：为什么要做这件事？

- 我们希望借助**敏捷实践**这一方法论帮助AI处理这些问题：
  - 小步快跑、快速反馈
  - 明确职责、拆分阶段
  - 可复用流程与模板

---

## 背景：为什么要做这件事？

- 而**MCP（Model Context Protocol）**提供了刚好适合的技术接口：
  - 能在本地定义角色边界、职责与输入输出
  - 支持 VSCode / Copilot 集成调用
  - 我们据此构建了一个“敏捷 AI 协作工作流”

---

## 为什么敏捷实践很重要？

- 敏捷强调**小步快跑 + 快速反馈**，适合 AI 快速试错与迭代
- 分阶段明确职责，让每一位 AI 角色聚焦在专业能力上
- 工作被结构化后，更容易自动化、度量、优化
- 与人类协作更自然：你作为 PO，可以像带团队一样带一组 AI

💡 敏捷不仅是方法论，更是一种高效组织智能体协作的方式

---

## MCP 是什么？

> **Model Context Protocol** 是一个定义 AI 工具标准接口的协议，支持多角色上下文、插件集成与自动调用。

- 本项目遵循 MCP 的 Tool 接口规范
- 每个角色（BA、TL、DEV、QA）是一个 Tool
- 每个 Tool 通过 API 接收输入、返回结果
- MCP 插件可自动识别工具并管理调用流程

---

## MCP 帮我解决了什么痛点？

### 🧠 AI 协作的真实问题

- ⚠️ 和 AI 协作时，要反复解释目标和上下文
- ⚠️ 多个 AI 间信息无法共享，每个都是“新手”
- ⚠️ AI 角色之间无法“传话”，全靠你中转
- ⚠️ 大模型输出不可控，混淆不同角色的边界

### ✅ MCP 解决方案

- 提供“角色上下文 + 职责边界”，不再需要反复讲解
- 每个工具可自动处理输入和输出，像流水线一样衔接
- 你只需要当 PO，回答问题并监督流程
- 整体过程结构化、标准化、自动化

---

## 我们实现的工作流角色

| 角色 | 工具名 | 输入 | 输出 | 格式 |
|------|--------|------|------|------|
| BA   | ba     | 产品目标 | 用户故事 | YAML |
| TL   | tl     | 用户故事 | 技术任务 | YAML |
| DEV  | dev    | 技术任务 | 实现建议 | Markdown |
| QA   | qa     | 用户故事 | 测试用例 | YAML |

---

## 示例流程

1. PO 提供目标：“用户可上传头像”
2. `ba`：产出 User Stories
3. `tl`：拆解为 Tech Tasks
4. `dev`：输出伪代码 + 实现建议
5. `qa`：生成验收用例

🧠 每个步骤独立完成，链式执行

---

## 技术架构（Node.js + TypeScript）

```
mcp-server/
├── tools/           # 各角色逻辑
├── prompts/         # 每个角色的 prompt
├── output/          # 每个角色的输出结果（按任务缓存）
├── server.ts        # Express API 入口
├── manifest.json    # MCP 插件发现入口
├── taskManager.ts   # 缓存任务状态和结果
├── utils/askLLM.ts  # LLM 调用逻辑
```

---

## MCP 接口标准（Tool APIs）

- `POST /tools/{tool}`：提交任务
- `GET /status/{task_id}`：查询状态
- `GET /result/{task_id}`：获取结果
- `GET /manifest.json`：公开工具定义

📦 工具按 manifest 自动被 Copilot MCP 插件识别

---

## 构建 AI 敏捷工作流的核心价值

✅ 明确分工：每个 AI 专注于自己的职责

✅ 可复用：开发流程模板化，可快速复用在不同项目

✅ 本地化：可接入本地模型、私有数据、内部插件

✅ 可扩展：后续加入 UX、PM、CI/CD、Reviewer 等角色

---

# 总结

> 用 MCP，我们让 AI 不再是一个万能助手，而是一个**有组织、有角色、有流程的团队成员**。

💡 AI = 团队，不是个体。

---

# 谢谢

欢迎试用 / 参与构建
