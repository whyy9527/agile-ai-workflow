---
# 用 MCP 架构构建 AI 敏捷协作工作流

### 让每个 AI 各司其职，完成开发全流程

---

## 背景：为什么要做这件事？

- 大模型虽然强大，但“通用助手”难以拆解复杂任务
- 敏捷开发需要团队协作，而非一个通才AI
- 我们需要：**角色分工 + 协同交互 + 自动产出**

---

## MCP 是什么？

> **Model Context Protocol**：为 AI 提供“身份”“任务”和“协作能力”的标准协议

- 每个角色是一个 Tool（如 BA、DEV、QA）
- 每个 Tool 定义输入、输出、上下文
- 通过标准 API 与 VSCode、Copilot 插件集成

---

## MCP 接口标准（Tool APIs）

- `POST /tools/{tool}`：提交任务
- `GET /status/{task_id}`：查询状态
- `GET /result/{task_id}`：获取结果
- `GET /manifest.json`：公开工具定义

📦 工具按 manifest 自动被 Copilot MCP 插件识别

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
├── server.ts        # Express API 入口
├── manifest.json    # MCP 插件发现入口
├── taskManager.ts   # 缓存任务状态和结果
├── utils/askLLM.ts  # LLM 调用逻辑
```

---

## 调用演示（curl）

```bash
curl -X POST http://localhost:7078/tools/ba \
  -H "Content-Type: application/json" \
  -d '{ "product_goal": "用户上传头像" }'

# 然后轮询状态并获取结果
```

🔌 可接入 Copilot MCP 插件，自动发现工具

---

## 为什么这很重要？

✅ 明确分工：每个 AI 专注于自己的职责

✅ 可复用：开发流程模板化，可快速复用在不同项目

✅ 本地化：可接入本地模型、私有数据、内部插件

✅ 可扩展：后续加入 UX、PM、CI/CD、Reviewer 等角色

---

## 下一步：持续扩展与落地

- 添加 UX 和 UI Agent，实现从需求到设计
- 引入状态持久化，实现上下文记忆与多轮协作
- 连接 Git 工具链，支持自动创建分支 / PR / test

---

# 总结

> 用 MCP，我们让 AI 不再是一个万能助手，而是一个**有组织、有角色、有流程的团队成员**。

💡 AI = 团队，不是个体。

---

# 谢谢

欢迎试用 / 参与构建
Github / Slack / Copilot Plugin
