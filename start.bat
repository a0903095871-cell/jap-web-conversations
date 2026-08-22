@echo off
echo ========================================
echo    學習分享平台 - 啟動腳本
echo ========================================
echo.

echo 檢查 Node.js 安裝...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安裝！
    echo 請先安裝 Node.js: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js 已安裝
echo.

echo 檢查 npm 安裝...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm 未安裝！
    echo 請重新安裝 Node.js
    echo.
    pause
    exit /b 1
)

echo ✅ npm 已安裝
echo.

echo 檢查 .env 文件...
if not exist .env (
    echo ⚠️  .env 文件不存在，正在創建...
    copy env.example .env
    echo ✅ .env 文件已創建
    echo 請編輯 .env 文件配置數據庫連接
    echo.
)

echo 安裝依賴包...
npm install
if %errorlevel% neq 0 (
    echo ❌ 依賴安裝失敗！
    echo.
    pause
    exit /b 1
)

echo ✅ 依賴安裝完成
echo.

echo 啟動服務器...
echo 服務器將在 http://localhost:3000 啟動
echo 按 Ctrl+C 停止服務器
echo.

npm start

pause 