# MongoDB 設置指南

## 方法1：使用 MongoDB Atlas（推薦）

### 步驟1：註冊 MongoDB Atlas 帳戶
1. 前往 https://www.mongodb.com/atlas
2. 點擊 "Try Free" 註冊免費帳戶
3. 選擇 "Shared" 計劃（免費）

### 步驟2：創建數據庫集群
1. 選擇雲端提供商（AWS、Google Cloud 或 Azure）
2. 選擇地區（建議選擇離您最近的）
3. 選擇 "M0 Sandbox"（免費層）
4. 點擊 "Create"

### 步驟3：設置數據庫用戶
1. 創建數據庫用戶名和密碼
2. 記下這些憑證

### 步驟4：設置網絡訪問
1. 在 "Network Access" 中點擊 "Add IP Address"
2. 選擇 "Allow Access from Anywhere"（開發用）
3. 點擊 "Confirm"

### 步驟5：獲取連接字符串
1. 點擊 "Connect"
2. 選擇 "Connect your application"
3. 複製連接字符串

### 步驟6：更新 .env 文件
將連接字符串更新到 .env 文件中：
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/learning-share?retryWrites=true&w=majority
```

## 方法2：本地安裝 MongoDB

### 步驟1：下載 MongoDB Community Server
1. 前往 https://www.mongodb.com/try/download/community
2. 選擇 Windows x64 版本
3. 下載 .msi 安裝包

### 步驟2：安裝 MongoDB
1. 運行下載的 .msi 文件
2. 選擇 "Complete" 安裝
3. 勾選 "Install MongoDB as a Service"
4. 完成安裝

### 步驟3：驗證安裝
打開新的 PowerShell 窗口，運行：
```powershell
mongod --version
```

### 步驟4：啟動 MongoDB 服務
```powershell
# 啟動 MongoDB 服務
Start-Service MongoDB

# 檢查服務狀態
Get-Service MongoDB
```

### 步驟5：創建數據目錄
```powershell
# 創建數據目錄
New-Item -ItemType Directory -Path "C:\data\db" -Force
```

## 驗證連接

安裝完成後，運行以下命令測試連接：

```powershell
# 停止當前服務器（如果正在運行）
taskkill /F /IM node.exe

# 重新啟動服務器
npm start
```

## 常見問題解決

### 問題1：MongoDB 服務無法啟動
解決方案：
```powershell
# 以管理員身份運行 PowerShell
# 重新安裝 MongoDB 服務
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --install --serviceName "MongoDB"
Start-Service MongoDB
```

### 問題2：端口被佔用
解決方案：
```powershell
# 檢查端口使用情況
netstat -an | findstr :27017

# 終止佔用端口的進程
taskkill /F /PID <進程ID>
```

### 問題3：權限問題
解決方案：
```powershell
# 以管理員身份運行 PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 下一步

完成 MongoDB 設置後：
1. 重新啟動應用程序
2. 檢查控制台是否顯示 "MongoDB connected successfully"
3. 開始使用您的 NANI 個人學習平台！ 
