@echo off
echo ========================================
echo    NANI 個人學習平台 - MongoDB 設置
echo ========================================
echo.

echo 正在檢查 MongoDB 安裝狀態...
mongod --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ MongoDB 已安裝
    echo.
    echo 正在啟動 MongoDB 服務...
    net start MongoDB >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ MongoDB 服務已啟動
    ) else (
        echo ✗ MongoDB 服務啟動失敗
        echo 請以管理員身份運行此腳本
        pause
        exit /b 1
    )
) else (
    echo ✗ MongoDB 未安裝
    echo.
    echo 請選擇安裝方式：
    echo 1. 使用 MongoDB Atlas（推薦 - 免費雲端數據庫）
    echo 2. 本地安裝 MongoDB
    echo.
    set /p choice="請輸入選擇 (1 或 2): "
    
    if "%choice%"=="1" (
        echo.
        echo 請按照以下步驟設置 MongoDB Atlas：
        echo 1. 前往 https://www.mongodb.com/atlas
        echo 2. 註冊免費帳戶
        echo 3. 創建免費集群
        echo 4. 獲取連接字符串
        echo 5. 更新 .env 文件中的 MONGODB_URI
        echo.
        echo 詳細步驟請參考 mongodb-setup-guide.md
        pause
        exit /b 0
    ) else if "%choice%"=="2" (
        echo.
        echo 請按照以下步驟安裝 MongoDB：
        echo 1. 前往 https://www.mongodb.com/try/download/community
        echo 2. 下載 Windows x64 版本
        echo 3. 運行安裝程序
        echo 4. 選擇 "Complete" 安裝
        echo 5. 勾選 "Install MongoDB as a Service"
        echo.
        echo 安裝完成後，請重新運行此腳本
        pause
        exit /b 0
    ) else (
        echo 無效選擇
        pause
        exit /b 1
    )
)

echo.
echo 正在檢查端口 27017...
netstat -an | findstr :27017 >nul
if %errorlevel% equ 0 (
    echo ✓ MongoDB 正在監聽端口 27017
) else (
    echo ✗ MongoDB 未在端口 27017 監聽
    echo 請檢查 MongoDB 服務狀態
    pause
    exit /b 1
)

echo.
echo 正在創建 .env 文件...
if not exist .env (
    copy env.example .env >nul
    echo ✓ .env 文件已創建
) else (
    echo ✓ .env 文件已存在
)

echo.
echo 正在測試數據庫連接...
node -e "
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-share')
  .then(() => {
    console.log('✓ MongoDB 連接成功！');
    process.exit(0);
  })
  .catch(err => {
    console.log('✗ MongoDB 連接失敗：', err.message);
    process.exit(1);
  });
"

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo    MongoDB 設置完成！
    echo ========================================
    echo.
    echo 現在可以啟動應用程序：
    echo npm start
    echo.
    echo 或者運行 start.bat 腳本
    echo.
) else (
    echo.
    echo ========================================
    echo    MongoDB 設置失敗
    echo ========================================
    echo.
    echo 請檢查：
    echo 1. MongoDB 是否正確安裝
    echo 2. MongoDB 服務是否正在運行
    echo 3. .env 文件中的 MONGODB_URI 是否正確
    echo.
    echo 詳細故障排除請參考 mongodb-setup-guide.md
    echo.
)

pause 