# 贾维斯 AI 控制面板 - OpenClaw 工作区

🤖 基于 OpenClaw 的个人 AI 助手工作区

## 📋 项目简介

贾维斯 AI 控制面板是一个自托管的 AI 智能体管理界面，用于统一管理和监控 OpenClaw 系统。

### ✨ 核心功能

| 功能 | 描述 |
|------|------|
| 📊 **仪表盘** | 实时系统监控（CPU、内存、磁盘、网络） |
| 🐳 **容器管理** | Docker 容器状态监控与控制 |
| 📁 **文件管理** | 浏览和管理工作区文件 |
| 💻 **终端** | 命令执行，支持工作目录持久化 |
| 🧩 **技能管理** | 浏览和管理 OpenClaw 技能 |
| 🛡️ **代理服务** | 集成 v2ray VLESS-WS-TLS 代理 |
| 🔍 **智能体系统** | 内置研究助手 Sherlock |

## 🚀 快速开始

### 访问控制面板

```
http://192.168.32.23:2380/
```

### 默认端口

| 服务 | 端口 | 状态 |
|------|------|------|
| 控制面板 | 2380 | ✅ 运行中 |
| v2ray SOCKS5 | 10808 | ✅ 运行中 |
| OpenClaw 网关 | 18789 | ✅ 本地 |

### v2ray 代理使用

```bash
# 设置代理环境变量
export http_proxy=http://127.0.0.1:10808
export https_proxy=http://127.0.0.1:10808

# 测试连接
curl https://api.ipify.org
```

## 📂 项目结构

```
├── jarvis-dashboard/     # 主控制面板 (Node.js + HTML)
│   ├── index.html       # 仪表盘界面
│   ├── server.js        # API 后端
│   ├── agent.json       # 贾维斯身份卡片
│   └── js/, css/        # 前端资源
├── agents/              # AI 智能体工作区
│   └── sherlock/        # 研究专家智能体
├── skills/              # OpenClaw 技能
├── memory/              # 每日记忆日志
└── .learnings/          # 学习记录
```

## 🤖 AI 智能体

### 贾维斯 (主智能体)
- **角色:** 个人 AI 助手 / 数字管家
- **模型:** NVIDIA minimax-m2.1
- **身份:** @jarvis@openclaw.local
- **能力:** 文件操作、系统管理、代码生成、网络搜索、多智能体协调等

### Sherlock (研究助手)
- **角色:** OpenClaw 技能研究专家
- **模型:** NVIDIA minimaxai/minimax-m2.1
- **工作区:** `/root/.openclaw/workspace/agents/sherlock/`

## ⚙️ v2ray 配置

```json
{
  "inbounds": [{
    "port": 10808,
    "protocol": "socks",
    "settings": { "auth": "noauth" }
  }],
  "outbounds": [{
    "protocol": "vless",
    "streamSettings": {
      "network": "ws",
      "security": "tls",
      "wsSettings": { "path": "/?ed=2560" }
    }
  }]
}
```

## 🛠️ 开发指南

### 启动控制面板

```bash
cd jarvis-dashboard
bash start.sh
```

### 查看日志

```bash
tail -f /tmp/jarvis-dashboard.log
```

### 添加新智能体

```bash
cd skills/agent-council
bash scripts/create-agent.sh \
  --name "智能体名称" \
  --id "agent-id" \
  --emoji "🤖" \
  --specialty "智能体专长" \
  --model "nvidia/minimaxai/minimax-m2.1" \
  --workspace "/root/.openclaw/workspace/agents/agent-id"
```

## 🔒 安全特性

- ✅ 命令白名单 (只允许安全的命令)
- ✅ 路径安全检查 (防止目录遍历)
- ✅ 速率限制 (100次/分钟/IP)
- ✅ 输入验证 (主机名、端口范围)

## 🛠️ 技术栈

- **运行时:** Node.js v22
- **框架:** OpenClaw AI
- **代理:** V2Ray 5.16.1
- **模型:** NVIDIA minimax-m2.1
- **界面:** 原生 HTML/CSS/JS

## 📄 许可证

OpenClaw License - 查看 [OpenClaw 文档](https://docs.openclaw.ai)

## 🔗 相关链接

- **OpenClaw:** https://github.com/openclaw/openclaw
- **文档:** https://docs.openclaw.ai
- **技能中心:** https://clawhub.com

---

*用 ❤️ 构建，基于 OpenClaw*
