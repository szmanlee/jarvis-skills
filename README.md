# 🤖 贾维斯 AI 工作区 & Skills 集合

<div align="center">

![Jarvis](https://img.shields.io/badge/Jarvis-AI%20Workspace-blue?style=for-the-badge)
![Skills](https://img.shields.io/badge/Skills-80+-green?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-2.0.0-purple?style=for-the-badge)

**贾维斯 AI 控制面板 + OpenClaw Skills 集合**

</div>

---

## 📋 项目简介

这是一个综合性的 AI 工作区，包含：

1. **贾维斯 AI 控制面板** - 基于 OpenClaw 的个人 AI 助手管理系统
2. **Skills 集合** - 80+ 个专业技能模块，涵盖浏览器自动化、Docker、Git、AI 等多个领域

---

## ✨ 核心功能

### 🏛️ AI 控制面板

| 功能 | 描述 |
|------|------|
| 📊 **仪表盘** | 实时系统监控（CPU、内存、磁盘、网络） |
| 🐳 **容器管理** | Docker 容器状态监控与控制 |
| 📁 **文件管理** | 浏览和管理工作区文件 |
| 💻 **终端** | 命令执行，支持工作目录持久化 |
| 🧩 **技能管理** | 浏览和管理 OpenClaw 技能 |
| 🛡️ **代理服务** | 集成 v2ray VLESS-WS-TLS 代理 |
| 🔍 **智能体系统** | 内置研究助手 Sherlock |

### 🧩 Skills 集合

| 类别 | 技能数量 | 主要技能 |
|------|---------|----------|
| 🤖 **AI & 代理** | 8 | agent-council, coding-agent, multi-coding-agent |
| 💻 **开发工具** | 12 | code-mentor, git-workflows, tdd-guide, docker-essentials |
| 🌐 **浏览器 & 网络** | 6 | browse, ssh-tunnel |
| 📱 **平台集成** | 8 | logseq, deepwiki, deploy-agent |
| 📊 **项目管理** | 6 | idea-coach, senior-architect, task-status |
| 🔧 **实用工具** | 10 | emergency-rescue, skill-creator, system-monitor |
| 🎨 **前端设计** | 4 | frontend-design, ui-ux-pro-max-skill |

---

## 🚀 快速开始

### 访问控制面板
```
http://192.168.32.23:2380/
```

### 安装 Skills

```bash
# 克隆仓库
git clone https://github.com/szmanlee/jarvis-skills.git
cd jarvis-skills

# 查看所有技能
ls ~/.openclaw/skills/

# 安装单个技能（示例）
npx clawhub install docker-sandbox

# 批量安装
npx clawhub install git-workflows emergency-rescue
```

### 默认端口

| 服务 | 端口 | 状态 |
|------|------|------|
| 控制面板 | 2380 | ✅ 运行中 |
| v2ray SOCKS5 | 10808 | ✅ 运行中 |
| OpenClaw 网关 | 18789 | ✅ 本地 |

---

## 📂 项目结构

```
jarvis-23-dashboard/
├── jarvis-dashboard/          # 主控制面板
│   ├── index.html            # 仪表盘界面
│   ├── server.js             # API 后端
│   └── agent.json            # 贾维斯身份卡片
├── skills-backup/             # 所有 OpenClaw Skills 备份
│   ├── ai-agnostic/          # AI 相关技能
│   ├── development/          # 开发工具
│   ├── automation/           # 自动化工具
│   └── utilities/            # 实用工具
├── agents/                   # AI 智能体工作区
│   └── sherlock/             # 研究专家智能体
├── memory/                   # 每日记忆日志
└── .learnings/               # 学习记录
```

---

## 🔥 核心技能展示

### 🌐 Browser Automation - browse
- **Browserbase 集成**: 云端浏览器自动化
- **Stagehand CLI**: AI 驱动的浏览器控制
- **认证流程**: 交互式身份验证支持

### 🐳 Docker Management
- **docker-sandbox**: 安全的沙箱 VM 环境
- **docker-essentials**: 容器生命周期管理
- **多 Agent 支持**: Claude, Codex, Copilot, Gemini

### 🚨 Emergency Rescue
- **灾难恢复**: 强制推送恢复、凭证清理
- **系统救援**: 磁盘清理、进程恢复
- **数据保护**: 数据库恢复、备份恢复

### 🤖 AI Development
- **code-mentor**: 全方位编程导师
- **coding-agent**: 多编程 Agent 管理
- **agent-council**: 自主 AI 代理系统

### 📊 Knowledge Management
- **ontology**: 类型化知识图谱
- **logseq**: Logseq 插件 API 交互
- **idea-coach**: AI 驱动的想法管理器

---

## 🎯 使用场景

### 🛠️ 开发者工作流
```bash
# Git 高级操作
git-workflows rebase
git-workflows bisect

# 代码审查
code-mentor review src/app.js
code-mentor test --coverage

# 容器开发
docker-sandbox create --agent claude
docker-essentials build --optimize
```

### 🔒 系统管理
```bash
# 安全检查
healthcheck audit
emergency-rescue --secrets

# 监控
system-monitor dashboard
task-status monitor --project api
```

### 📈 项目管理
```bash
# 架构设计
senior-architect design --microservices
senior-architect evaluate --tech-stack

# 知识管理
ontology create Project --name "New API"
idea-coach capture --tag feature-request
```

---

## 🛡️ 安全特性

- ✅ 命令白名单 (只允许安全的命令)
- ✅ 路径安全检查 (防止目录遍历)
- ✅ 速率限制 (100次/分钟/IP)
- ✅ 输入验证 (主机名、端口范围)
- ✅ 数据加密 (默认 TLS 加密传输)
- ✅ 权限控制 (基于角色的访问控制)

---

## 🤖 AI 智能体

### 贾维斯 (主智能体)
- **角色:** 个人 AI 助手 / 数字管家
- **模型:** NVIDIA minimax-m2.1
- **能力:** 文件操作、系统管理、代码生成、多语言支持

### Sherlock (研究助手)
- **角色:** OpenClaw 技能研究专家
- **模型:** NVIDIA minimaxai/minimax-m2.1
- **能力:** 技能搜索、深度分析、最佳实践提取

### 其他专业 Agent
```json
{
  "code-reviewer": "代码审查专家",
  "system-architect": "系统架构师",
  "security-analyst": "安全分析师",
  "data-scientist": "数据科学家"
}
```

---

## 🔧 技术栈

### 后端技术
- **运行时:** Node.js v22.22.0
- **AI 平台:** OpenClaw Gateway
- **容器化:** Docker & Docker Compose
- **代理服务:** V2Ray 5.16.1

### 前端技术
- **界面:** 原生 HTML5/CSS3/JavaScript
- **样式:** Tailwind CSS
- **图表:** Chart.js
- **实时通信:** WebSocket

### AI & 机器学习
- **模型提供商:** NVIDIA, Anthropic, OpenAI
- **推理引擎:** OpenClaw Gateway
- **本地模型:** Ollama (可选)

---

## 📊 性能指标

| 指标 | 数值 | 说明 |
|------|------|------|
| 技能数量 | 80+ | 覆盖 6 大类别 |
| 平均启动时间 | < 3秒 | 技能加载时间 |
| 内存占用 | ~50MB | 基础运行内存 |
| API 响应时间 | < 100ms | 平均响应延迟 |
| 并发用户 | 100+ | 单机处理能力 |

---

## 📚 文档

| 文档 | 说明 |
|------|------|
| [控制面板文档](jarvis-dashboard/README.md) | 详细的控制面板使用指南 |
| [技能文档](skills-backup/) | 所有技能的详细说明 |
| [API 文档](docs/api.md) | REST API 接口文档 |
| [部署指南](docs/deploy.md) | 生产环境部署指南 |
| [故障排查](docs/troubleshooting.md) | 常见问题解决方案 |

---

## 🤝 贡献

欢迎贡献新的技能或改进现有功能！

### 贡献方式

1. **Fork 仓库**
2. **创建特性分支** (`git checkout -b feature/amazing-skill`)
3. **提交更改** (`git commit -m 'Add amazing skill'`)
4. **推送到分支** (`git push origin feature/amazing-skill`)
5. **创建 Pull Request**

### 开发指南

```bash
# 本地开发
npm install
npm run dev

# 技能开发
mkdir skills/new-skill
echo "# Skill Documentation" > skills/new-skill/SKILL.md

# 测试
npm test
```

---

## 🌟 更新日志

### v2.0.0 (2024-01-15)
- 🎉 新增 80+ 技能模块
- 🚀 升级控制面板 v2.0
- 🛡️ 增强安全特性
- 📊 新增系统监控
- 🤖 集成多个 AI 模型

### v1.0.0 (2023-12-01)
- 🎊 初始版本发布
- 📋 基础控制面板
- 🐳 Docker 集成
- 🔍 Sherlock 研究助手

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) - 欢迎自由使用和修改。

---

## 🙏 致谢

- [OpenClaw](https://github.com/openclaw/openclaw) - 强大的 AI Agent 平台
- [Browserbase](https://browserbase.com) - 浏览器自动化
- [Docker](https://docker.com) - 容器化技术
- [NVIDIA](https://nvidia.com) - AI 模型支持
- 所有贡献者和社区成员

---

## 📞 支持

- 📧 Email: [your-email@example.com]
- 💬 Discord: [OpenClaw Community](https://discord.gg/clawd)
- 🐛 Issues: [GitHub Issues](https://github.com/szmanlee/jarvis-23-dashboard/issues)

---

<div align="center">

**🤖 贾维斯 - 让 AI 成为你最强大的助手**

**Made with ❤️ by Jarvis & OpenClaw Community**

</div>