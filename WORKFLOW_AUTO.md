# WORKFLOW_AUTO.md - 自动工作流配置

_此文件定义了启动时自动执行的任务和后置审计规则_

## 📋 启动检查清单

每次启动时必须读取以下文件：

### 必需文件
| 文件 | 说明 | 必须读取 |
|------|------|----------|
| `AGENTS.md` | Agent 工作区配置 | ✅ |
| `SOUL.md` | 身份与原则 | ✅ |
| `USER.md` | 用户信息 | ✅ |
| `memory/YYYY-MM-DD.md` | 当日记忆 | ✅ |
| `MEMORY.md` | 长期记忆 (仅主会话) | ✅ (主会话) |

### 可选文件
| 文件 | 说明 | 必须读取 |
|------|------|----------|
| `HEARTBEAT.md` | 心跳检查清单 | ⚠️ (心跳时) |
| `TOOLS.md` | 工具配置 | ❌ (按需) |

---

## 🔄 自动工作流

### 启动后自动执行

```yaml
startup:
  - task: "读取项目上下文文件"
    files:
      - "AGENTS.md"
      - "SOUL.md"
      - "USER.md"
    priority: "high"

  - task: "检查待办事项"
    when: "每次会话开始"
    priority: "medium"
```

### 心跳检查

```yaml
heartbeat:
  enabled: true
  interval_minutes: 30
  tasks:
    - "检查待办事项"
    - "检查项目进度"
    - "检查未完成的后台任务"
```

---

## 🔍 后置审计规则

### 必须读取的文件 (启动后)

```yaml
audit:
  required_startup_files:
    - pattern: "memory/\\d{4}-\\d{2}-\\d{2}\\.md"
      description: "每日记忆文件"
      required: true

    - pattern: "AGENTS.md"
      description: "Agent 工作区配置"
      required: true

    - pattern: "SOUL.md"
      description: "身份与原则"
      required: true

    - pattern: "USER.md"
      description: "用户信息"
      required: true

  optional_startup_files:
    - pattern: "HEARTBEAT.md"
      description: "心跳检查清单"
      required: false

    - pattern: "TOOLS.md"
      description: "工具配置"
      required: false
```

### 审计动作

```yaml
audit_actions:
  on_missing_required:
    - level: "warning"
      message: "缺少必需文件: {file}"
      action: "提示用户"

  on_missing_optional:
    - level: "info"
      message: "可选文件未找到: {file}"
      action: "静默忽略"
```

---

## 🤖 Agent 特定配置

### sherlock Agent

```yaml
sherlock:
  learning:
    enabled: true
    files:
      - "agents/sherlock/memory/learning-capabilities.md"
      - "agents/sherlock/memory/learning-progress.md"
      - "agents/sherlock/memory/openclaw-skills-research.md"
```

### 通用 Agent

```yaml
agents:
  default:
    startup:
      - "读取 AGENTS.md"
      - "读取 SOUL.md"
      - "读取 USER.md"
      - "读取当日 memory 文件"
```

---

## 📊 统计与监控

### 启动统计

```yaml
startup_stats:
  track:
    - "启动时间"
    - "读取文件数量"
    - "缺失文件列表"
    - "会话持续时间"
```

---

## 📝 更新日志

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-02-25 | 1.0.0 | 初始版本 |

---

**文件路径**: `/root/.openclaw/workspace/WORKFLOW_AUTO.md`
**最后更新**: 2026-02-25 08:40 UTC
