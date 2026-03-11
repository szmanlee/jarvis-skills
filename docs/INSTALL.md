# 📖 安装指南

本指南介绍如何安装和使用 Jarvis Skills 集合。

## 前置要求

### 必需软件

| 软件 | 最低版本 | 说明 |
|------|----------|------|
| Node.js | 18+ | JavaScript 运行时 |
| Git | 2.0+ | 版本控制 |
| OpenClaw | latest | AI Agent 平台 |

### 验证安装

```bash
# 检查 Node.js
node --version  # 应显示 v18+

# 检查 Git
git --version   # 应显示 2.x+

# 检查 OpenClaw
openclaw --version
```

---

## 📦 安装方法

### 方法一：从源码安装（推荐）

```bash
# 1. 克隆仓库
git clone https://github.com/szmanlee/jarvis-skills.git
cd jarvis-skills

# 2. 安装依赖
npm install

# 3. 安装所有技能
npm run install

# 4. 验证安装
npm run list
```

### 方法二：安装单个技能

```bash
# 导航到项目目录
cd jarvis-skills

# 安装特定技能
node scripts/install-skill.js browse          # 浏览器自动化
node scripts/install-skill.js docker-sandbox  # Docker 沙箱
node scripts/install-skill.js git-workflows   # Git 工作流

# 列出所有可用的技能
npm run list
```

### 方法三：手动安装

```bash
# 1. 克隆仓库
git clone https://github.com/szmanlee/jarvis-skills.git

# 2. 复制技能文件
cp -r jarvis-skills/skills/{skill_name} /root/.openclaw/skills/

# 3. 验证安装
ls /root/.openclaw/skills/{skill_name}/
```

---

## ⚙️ OpenClaw 配置

### 自动注册

大多数技能会自动注册到 OpenClaw。安装后查看：

```bash
# 检查已注册的 skills
openclaw gateway config.get | jq '.skills'
```

### 手动注册

如果需要手动注册：

```bash
openclaw gateway config.patch --raw '{
  "skills": {
    "list": [
      {
        "name": "browse",
        "location": "/root/.openclaw/skills/browse"
      }
    ]
  }
}'
```

---

## 🚀 使用技能

### 在 Agent 中使用

```bash
# 发送消息给 Agent，Agent 会自动使用相关技能
sessions_send --label "devops" --message "检查 Docker 容器状态"

# Agent 会自动调用 docker-essentials 技能
```

### 独立使用

```bash
# Docker 技能
docker-sandbox create --agent claude

# Git 技能
git-workflows rebase main

# 紧急救援
emergency-rescue --disk
```

---

## 📁 目录结构

安装后的目录结构：

```
/root/.openclaw/skills/
├── browse/             # 浏览器自动化
│   ├── SKILL.md       # 技能文档（必需）
│   └── ...
├── docker-sandbox/     # Docker 沙箱
├── docker-essentials/  # Docker 基础
└── ...其他技能
```

---

## 🧩 技能依赖

### docker-sandbox 依赖

- Docker
- docker-compose

### coding-agent 依赖

- Node.js
- npx

### emergency-rescue 依赖

- Git
- 足够的磁盘空间

### ssh-tunnel 依赖

- SSH
- SSH 密钥配置

---

## ❓ 常见问题

### Q: 安装失败怎么办？

1. 检查 Node.js 版本（需要 v18+）
2. 检查目录权限
3. 查看错误日志
4. 尝试手动安装

### Q: 技能没有响应？

1. 检查 OpenClaw 是否运行
2. 检查 skill 是否正确安装
3. 查看日志：`openclaw logs`

### Q: 如何更新技能？

```bash
cd jarvis-skills
git pull
node scripts/install-skill.js {skill-name}
```

### Q: 如何卸载技能？

```bash
# 删除目录
rm -rf /root/.openclaw/skills/{skill-name}
```

---

## 📞 获取帮助

- **GitHub Issues**: https://github.com/szmanlee/jarvis-skills/issues
- **文档**: 查看 [README.md](README.md)
- **问题排查**: 查看 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
