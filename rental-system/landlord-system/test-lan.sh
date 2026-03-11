#!/bin/bash

echo "📱 局域网访问实时测试"
echo "======================"

# 获取IP地址
IP="192.168.32.23"
PORT="8082"
ADDRESS="http://$IP:$PORT"

echo "🌐 测试地址: $ADDRESS"
echo ""

# 测试服务器连接
echo "🔍 正在测试服务器连接..."
curl -s "$ADDRESS" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ 服务器连接正常！"
    echo ""
    echo "📱 现在可以在手机上访问："
    echo "   1. 打开手机浏览器"
    echo "   2. 输入: $ADDRESS"
    echo "   3. 登录: admin / admin123"
    echo ""
    echo "💡 快捷方法："
    echo "   - 微信发送地址给自己"
    echo "   - 扫描二维码生成器: https://cli.im/qr"
    echo "   - 手机浏览器书签收藏"
    echo ""
    echo "🚀 支持的设备："
    echo "   - Android手机 + Chrome浏览器"
    echo "   - iPhone + Safari浏览器" 
    echo "   - iPad + Safari浏览器"
    echo "   - 平板电脑 + 任意浏览器"
    echo "   - 其他电脑 + 浏览器"
    echo ""
    echo "⚠️ 注意事项："
    echo "   - 必须连接到同一个WiFi"
    echo "   - 确保防火墙允许连接"
    echo "   - 不要使用VPN或代理"
else
    echo "❌ 服务器连接失败！"
    echo "请检查："
    echo "1. 服务器是否正在运行"
    echo "2. 端口8082是否被占用"
    echo "3. 防火墙设置"
fi

echo "======================"