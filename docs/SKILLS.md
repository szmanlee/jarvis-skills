# 📖 Skills 详细说明

本文档详细介绍每个技能的功能、配置和使用方法。

---

## 🌐 browse - 浏览器自动化

### 基本信息

| 属性 | 值 |
|------|-----|
| ID | browse |
| Emoji | 🌐 |
| 领域 | 浏览器自动化 |
| 依赖 | Browserbase, Stagehand CLI |

### 功能特性

#### 1. Browserbase 集成

```bash
# 认证
npx stagehand auth login

# 状态检查
npx stagehand auth status

# 退出登录
npx stagehand auth logout
```

#### 2. 创建自动化脚本

```bash
# 创建新项目
stagehand create --project my-automation

# 指定类型
stagehand create --project crawler --type crawler
stagehand create --project test --type test
```

#### 3. 运行脚本

```bash
# 运行单个脚本
stagehand run script.js

# 使用配置文件
stagehand run --config config.json

# 调试模式
stagehand run --debug script.js
```

### 集成场景

| 场景 | 说明 |
|------|------|
| 数据采集 | 爬取网站数据 |
| 表单填写 | 自动提交表单 |
| UI 测试 | 自动化测试界面 |
| 截图 | 页面截图 |

---

## 🐳 docker-sandbox - Docker 沙箱

### 基本信息

| 属性 | 值 |
|------|-----|
| ID | docker-sandbox |
| Emoji | 🐳 |
| 领域 | 容器沙箱 |
| 依赖 | Docker, docker-compose |

### 功能特性

#### 1. 创建沙箱

```bash
# 创建 Claude 沙箱
docker-sandbox create --agent claude

# 创建 Codex 沙箱
docker-sandbox create --agent codex

# 指定代理
docker-sandbox create --agent claude --proxy http://proxy:8080
```

#### 2. 运行命令

```bash
# 在沙箱中运行命令
docker-sandbox run "npm install"

# 交互模式
docker-sandbox run -it "bash"
```

#### 3. 清理

```bash
# 清理所有沙箱
docker-sandbox cleanup

# 清理特定沙箱
docker-sandbox cleanup --id <container-id>
```

### 支持的 Agent

| Agent | 用途 | 模型 |
|-------|------|------|
| Claude | 通用 AI 编程 | Anthropic |
| Codex | 代码生成 | OpenAI |
| Copilot | 辅助编程 | GitHub |
| Gemini | 多模态 AI | Google |
| Kiro | 创意写作 | 自定义 |

---

## 📦 docker-essentials - Docker 基础

### 基本信息

| 属性 | 值 |
|------|-----|
| ID | docker-essentials |
| Emoji | 📦 |
| 领域 | 容器管理 |
| 依赖 | Docker |

### 常用命令速查

#### 容器操作

| 命令 | 说明 |
|------|------|
| `docker ps` | 列出运行中的容器 |
| `docker ps -a` | 列出所有容器 |
| `docker start <id>` | 启动容器 |
| `docker stop <id>` | 停止容器 |
| `docker restart <id>` | 重启容器 |
| `docker rm <id>` | 删除容器 |
| `docker logs <id>` | 查看日志 |
| `docker exec -it <id> sh` | 进入容器 |

#### 镜像操作

| 命令 | 说明 |
|------|------|
| `docker images` | 列出镜像 |
| `docker build -t name:tag .` | 构建镜像 |
| `docker pull name:tag` | 拉取镜像 |
| `docker push name:tag` | 推送镜像 |
| `docker rmi <id>` | 删除镜像 |

#### 网络和卷

| 命令 | 说明 |
|------|------|
| `docker network ls` | 列出网络 |
| `docker volume ls` | 列出卷 |
| `docker network inspect <net>` | 检查网络 |

---

## 🔧 git-workflows - Git 工作流

### 基本信息

| 属性 | 值 |
|------|-----|
| ID | git-workflows |
| Emoji | 🔧 |
| 领域 | 版本控制 |
| 依赖 | Git |

### 高级操作

#### Rebase

```bash
# 变基到 main 分支
git rebase main

# 交互式变基
git rebase -i HEAD~5

# 解决冲突后继续
git add .
git rebase --continue

# 中止变基
git rebase --abort
```

#### Bisect (二分查找)

```bash
# 开始二分
git bisect start

# 标记有问题
git bisect bad

# 标记正常的提交
git bisect good <commit-hash>

# 自动二分查找
git bisect run test.sh

# 结束
git bisect reset
```

#### Worktree

```bash
# 添加工作树
git worktree add ../feature-branch main

# 列出工作树
git worktree list

# 移除工作树
git worktree remove ../feature-branch
```

#### Reflog 恢复

```bash
# 查看 reflog
git reflog

# 恢复误删的提交
git checkout HEAD@{1}

# 恢复分支
git branch recovery-branch HEAD@{2}
```

---

## 📊 ontology - 知识图谱

### 基本信息

| 属性 | 值 |
|------|-----|
| ID | ontology |
| Emoji | 📊 |
| 领域 | 知识管理 |
| 依赖 | 无 |

### 实体类型

| 实体 | 说明 | 示例字段 |
|------|------|----------|
| Person | 人物 | name, email, role |
| Project | 项目 | name, status, timeline |
| Task | 任务 | title, status, priority |
| Event | 事件 | name, date, participants |
| Document | 文档 | title, type, content |

### 使用示例

```bash
# 创建实体
ontology create Person --name "John" --email "john@example.com"

# 链接关系
ontology link Person Project --relation "works_on"

# 查询
ontology query --type Project --status active
```

---

## 🧪 tdd-guide - TDD 指南

### 基本信息

| 属性 | 值 |
|------|-----|
| ID | tdd-guide |
| Emoji | 🧪 |
| 领域 | 测试开发 |
| 依赖 | Node.js, 测试框架 |

### TDD 循环

```
1. 🔴 红色: 编写失败的测试
2. 🟢 绿色: 编写最少代码使测试通过
3. 🟡 重构: 优化代码，测试保护
```

### 常用命令

```bash
# 生成测试
tdd generate --file src/math.js

# 运行测试
tdd test --coverage

# 生成报告
tdd report --format html --output ./reports
```

### 框架支持

| 框架 | 语言 | 命令 |
|------|------|------|
| Jest | JavaScript | `tdd test --framework jest` |
| Mocha | JavaScript | `tdd test --framework mocha` |
| pytest | Python | `tdd test --framework pytest` |
| Go test | Go | `tdd test --framework go` |

---

## 📋 Skills 对比

| Skill | 复杂度 | 学习曲线 | 主要依赖 |
|-------|--------|----------|----------|
| browse | ⭐⭐⭐ | 中等 | Browserbase |
| docker-sandbox | ⭐⭐⭐ | 中等 | Docker |
| docker-essentials | ⭐⭐ | 简单 | Docker |
| coding-agent | ⭐⭐⭐ | 中等 | Node.js |
| git-workflows | ⭐⭐⭐ | 中等 | Git |
| emergency-rescue | ⭐⭐ | 简单 | Git |
| tdd-guide | ⭐⭐⭐ | 中等 | Node.js |
| ontology | ⭐⭐ | 简单 | 无 |
| ssh-tunnel | ⭐⭐ | 简单 | SSH |
| healthcheck | ⭐⭐⭐ | 中等 | 系统工具 |
| regex-patterns | ⭐⭐ | 简单 | 无 |
| self-improving-agent | ⭐⭐⭐ | 中等 | OpenClaw |
| github | ⭐⭐ | 简单 | gh CLI |
| gh-issues | ⭐⭐ | 简单 | gh CLI |
| oracle | ⭐⭐ | 简单 | 无 |
| bat-cat | ⭐ | 简单 | bat |
| weather | ⭐ | 简单 | curl |
| agent-council | ⭐⭐⭐ | 中等 | Discord |
