#!/bin/bash
# 自动安装必备 Git Skills
# 时间: 每 5 分钟尝试一次，直到成功

SKILLS=("git-essentials" "git-helper")
LOG="/root/.openclaw/workspace/logs/git-skills-install.log"

echo "=== $(date '+%Y-%m-%d %H:%M:%S') ===" >> "$LOG"

for skill in "${SKILLS[@]}"; do
  if [ -d "/root/.openclaw/skills/$skill" ]; then
    echo "✅ $skill 已安装" >> "$LOG"
  else
    echo "📦 尝试安装: $skill" >> "$LOG"
    RESULT=$(npx clawhub@latest install "$skill" --force 2>&1)
    
    if echo "$RESULT" | grep -q "✔"; then
      echo "✅ $skill 安装成功" >> "$LOG"
    else
      echo "❌ $skill 安装失败: $(echo "$RESULT" | grep -i "error\|rate" | head -1)" >> "$LOG"
    fi
    
    sleep 5
  fi
done

echo "📊 当前 Skills: $(ls -1 /root/.openclaw/skills/ | wc -l)" >> "$LOG"
echo "" >> "$LOG"
