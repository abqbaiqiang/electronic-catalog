@echo off
echo ========================================
echo   电子画册系统 - 一键部署脚本
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未检测到Node.js，请先安装Node.js
    pause
    exit /b 1
)
echo Node.js 已安装

echo.
echo [2/3] 安装Vercel CLI...
call npm install -g vercel

echo.
echo [3/3] 开始部署到Vercel...
echo 请按照提示完成部署
echo.

call vercel --prod

echo.
echo ========================================
echo 部署完成！
echo ========================================
pause
