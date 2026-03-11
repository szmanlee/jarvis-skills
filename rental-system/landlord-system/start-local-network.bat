@echo off
chcp 65001 >nul
echo 🏠 房东收租管理系统 - 局域网启动
echo ==================================

echo 📍 正在获取本机IP地址...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do set IP=%%a
set IP=%IP: =%

if "%IP%"=="" (
    echo ❌ 无法获取IP地址，请检查网络设置
    pause
    exit /b 1
)

echo ✅ 检测到本机IP地址: %IP%

echo ✅ 检测到 Windows 系统
echo ✅ 正在查找Python环境...

where python >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=python
    echo ✅ 检测到 Python
) else (
    where python3 >nul 2>&1
    if %errorlevel% equ 0 (
        set PYTHON_CMD=python3
        echo ✅ 检测到 Python3
    ) else (
        echo ❌ 未检测到Python环境，请先安装Python
        echo 📥 下载地址: https://www.python.org/downloads/
        pause
        exit /b 1
    )
)

if not exist "index.html" (
    echo ❌ 找不到 index.html 文件
    pause
    exit /b 1
)

if not exist "management.html" (
    echo ❌ 找不到 management.html 文件
    pause
    exit /b 1
)

echo ✅ 系统文件检查通过

set PORT=8080
echo.
echo 🚀 正在启动局域网服务器...
echo 📍 本地访问地址: http://localhost:%PORT%
echo 🌐 局域网访问地址: http://%IP%:%PORT%
echo.
echo 📱 同一局域网内的设备（手机、平板、其他电脑）可以通过以下地址访问：
echo    http://%IP%:%PORT%
echo.
echo 🔑 登录信息：
echo    用户名: admin
echo    密码: admin123
echo.
echo ⏹️  按 Ctrl+C 停止服务器
echo ==================================

%PYTHON_CMD% -m http.server %PORT% --bind 0.0.0.0

pause