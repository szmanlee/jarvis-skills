#!/bin/bash
# 自动重试安装 Skills
SKILLS=("backup" "mcp-builder" "work-report" "sandboxer" "git-sync")
LOG="/root/.openclaw/workspace/logs/skills-install.log"

echo "=== $(date '+%Y-%m-%d %H:%M:%S') ===" >> "$LOG"

for skill in "${SKILLS[@]}"; do
  echo "尝试安装: $skill" >> "$LOG"
  npx clawhub@latest install "$skill" --force 2>&1 | grep -E "(✔|✗)" >> "$LOG"
  sleep 2
done

echo "完成: $(ls -1 /root/.openclaw/skills/ | wc -l) 个 Skills" >> "$LOG"
echo "" >> "$LOG"
