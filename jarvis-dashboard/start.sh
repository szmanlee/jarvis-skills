#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "    🚀 贾维斯 AI 控制面板启动器"
echo "=========================================="
echo ""
echo "🌐 访问地址: http://192.168.32.23:2380"
echo ""

# 检查是否已运行
if pgrep -f "node.*server.js" > /dev/null; then
    echo "⚠️  服务已在运行中"
    echo "🔄 重启服务..."
    pkill -f "node.*server.js"
    sleep 1
fi

echo "✅ 启动中..."
nohup node server.js > /tmp/jarvis-dashboard.log 2>&1 &
sleep 2

if pgrep -f "node.*server.js" > /dev/null; then
    echo "✅ 启动成功！访问: http:192.168.32.23:2380"
    echo "📝 日志: tail -f /tmp/jarvis-dashboard.log"
else
    echo "❌ 启动失败，查看日志: cat /tmp/jarvis-dashboard.log"
fi
echo "=========================================="
