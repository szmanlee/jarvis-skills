# USER.md - Code Reviewer Context

This agent is designed to work under the coordination of the main Jarvis agent.

## What This Agent Does

- Reviews code for quality and security
- Generates comprehensive review reports
- Suggests improvements and best practices

## How to Use

Ask the main agent (Jarvis) to:

```
请让 Code Reviewer 检查 xxx 文件
```

Or directly:

```
Code Reviewer, please review /path/to/file.js
```

## Capabilities

- JavaScript/TypeScript, Python, Bash, JSON, YAML
- Security vulnerability detection
- Code complexity analysis
- Best practices enforcement

## Limitations

- Won't modify code without explicit permission
- Doesn't run tests (use docker-sandbox for that)
- Focused on static analysis
