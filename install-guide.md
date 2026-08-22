# 學習分享平台 - 安裝指南

## 🚀 快速安裝步驟

### 1. 安裝 Node.js

#### Windows 用戶：
1. 前往 [Node.js 官網](https://nodejs.org/)
2. 下載 LTS 版本（推薦）
3. 運行安裝程序，按照提示完成安裝
4. 重新啟動命令提示符或PowerShell

#### 驗證安裝：
```bash
node --version
npm --version
```

### 2. 安裝 MongoDB

#### 選項 A：本地安裝
1. 前往 [MongoDB 官網](https://www.mongodb.com/try/download/community)
2. 下載 MongoDB Community Server
3. 安裝並啟動 MongoDB 服務

#### 選項 B：使用 MongoDB Atlas（推薦）
1. 前往 [MongoDB Atlas](https://www.mongodb.com/atlas)
2. 註冊免費帳號
3. 創建免費集群
4. 獲取連接字符串

### 3. 配置專案

1. **複製環境變量文件**：
   ```bash
   copy env.example .env
   ```

2. **編輯 .env 文件**：
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/learning-share
   JWT_SECRET=your-super-secret-jwt-key
   ```

   如果使用 MongoDB Atlas，將 MONGODB_URI 替換為您的連接字符串。

### 4. 安裝依賴並啟動

```bash
# 安裝依賴
npm install

# 啟動開發服務器
npm run dev
```

### 5. 訪問應用

打開瀏覽器訪問：`http://localhost:3000`

## 🔧 故障排除

### 常見問題：

1. **npm 命令未找到**
   - 重新安裝 Node.js
   - 重新啟動終端

2. **MongoDB 連接失敗**
   - 檢查 MongoDB 是否運行
   - 驗證連接字符串
   - 檢查防火牆設置

3. **端口被佔用**
   - 更改 .env 中的 PORT
   - 或終止佔用端口的程序

## 📞 需要幫助？

如果遇到問題，請檢查：
1. Node.js 版本是否為 14 或更高
2. MongoDB 是否正常運行
3. 環境變量是否正確配置
4. 防火牆是否阻止連接

## 🎉 成功啟動後

您將看到：
- 服務器運行在端口 3000
- 成功連接到 MongoDB
- 可以訪問學習分享平台

開始探索您的學習分享平台吧！ 