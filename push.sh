#!/bin/bash
# Jarvis Workspace Git Push Script
# 使用方法: bash push.sh

set -e

# 从环境变量或配置文件读取仓库信息
REPO=${GITHUB_REPO:-"origin"}
BRANCH=${GITHUB_BRANCH:-"main"}

echo "📦 准备推送到 GitHub..."
echo "仓库: $REPO"
echo "分支: $BRANCH"
echo ""

# 检查更改
echo "📋 更改的文件:"
git status --short

echo ""
echo "📝 请输入提交描述 (直接回车使用默认值):"
read -r commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="$(date '+%Y-%m-%d %H:%M'): Workspace update"
fi

echo ""
echo "🔄 添加所有更改..."
git add .

echo ""
echo "📝 提交: $commit_msg"
git commit -m "$commit_msg"

echo ""
echo "🚀 推送到 GitHub..."
git push "$REPO" "$BRANCH"

echo ""
echo "✅ 完成!"