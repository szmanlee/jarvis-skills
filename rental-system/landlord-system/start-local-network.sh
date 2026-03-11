#!/bin/bash

# 房东收租管理系统 - 局域网启动脚本
echo "🏠 房东收租管理系统 - 局域网启动"
echo "=================================="

# 获取本机IP地址
echo "📍 正在获取本机IP地址..."
IP=$(hostname -I | awk '{print $1}')

if [ -z "$IP" ]; then
    # 备用方法获取IP
    IP=$(ip route get 1 | awk '{print $7}' | head -1)
fi

if [ -z "$IP" ]; then
    echo "❌ 无法获取IP地址，请手动检查网络设置"
    exit 1
fi

echo "✅ 检测到本机IP地址: $IP"

# 检查Python环境
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    echo "✅ 检测到 Python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
    echo "✅ 检测到 Python"
else
    echo "❌ 未检测到Python环境，请先安装Python"
    exit 1
fi

# 进入系统目录
cd "$(dirname "$0")"

# 检查文件完整性
if [ ! -f "index.html" ]; then
    echo "❌ 找不到 index.html 文件"
    exit 1
fi

if [ ! -f "management.html" ]; then
    echo "❌ 找不到 management.html 文件"
    exit 1
fi

echo "✅ 系统文件检查通过"

# 启动HTTP服务器
PORT=8080
echo ""
echo "🚀 正在启动局域网服务器..."
echo "📍 本地访问地址: http://localhost:$PORT"
echo "🌐 局域网访问地址: http://$IP:$PORT"
echo ""
echo "📱 同一局域网内的设备（手机、平板、其他电脑）可以通过以下地址访问："
echo "   http://$IP:$PORT"
echo ""
echo "🔑 登录信息："
echo "   用户名: admin"
echo "   密码: admin123"
echo ""
echo "⏹️  按 Ctrl+C 停止服务器"
echo "=================================="

# 启动服务器
$PYTHON_CMD -m http.server $PORT --bind 0.0.0.0