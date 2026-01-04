@echo off
echo ========================================
echo   数字经济博弈模拟器 v2.0 启动脚本
echo ========================================
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [信息] Node.js 已安装
node --version

echo.
echo [启动] 正在启动本地开发服务器...
echo [地址] http://localhost:3000
echo [提示] 按 Ctrl+C 停止服务器
echo.

REM 启动开发服务器
npx serve -s . -l 3000 --cors

pause