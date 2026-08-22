# 學習分享平台

一個現代化的學習分享平台，讓每個人都能分享知識，共同成長。

## 🌟 功能特色

### 用戶功能
- ✅ 用戶註冊/登入系統
- ✅ 個人資料管理
- ✅ 課程收藏功能
- ✅ 課程報名系統
- ✅ 課程評分和評論

### 課程功能
- ✅ 課程創建和管理
- ✅ 課程分類和搜索
- ✅ 課程詳情展示
- ✅ 課程大綱管理
- ✅ 特色課程推薦

### 講師功能
- ✅ 講師資料展示
- ✅ 熱門講師排行
- ✅ 講師課程管理
- ✅ 學生互動系統

### 平台功能
- ✅ 響應式設計
- ✅ 現代化UI/UX
- ✅ 實時通知系統
- ✅ 數據統計展示

## 🚀 快速開始

### 前置需求

- Node.js (版本 14 或更高)
- MongoDB (版本 4.4 或更高)
- npm 或 yarn

### 安裝步驟

1. **克隆專案**
   ```bash
   git clone <repository-url>
   cd learning-share-platform
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **環境配置**
   ```bash
   cp env.example .env
   ```
   
   編輯 `.env` 文件，配置以下變量：
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/learning-share
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **啟動MongoDB**
   ```bash
   # 如果使用本地MongoDB
   mongod
   
   # 或使用MongoDB Atlas雲端服務
   ```

5. **啟動服務器**
   ```bash
   # 開發模式
   npm run dev
   
   # 生產模式
   npm start
   ```

6. **訪問應用**
   
   打開瀏覽器訪問：`http://localhost:3000`

## 📁 專案結構

```
learning-share-platform/
├── models/                 # 數據模型
│   ├── User.js            # 用戶模型
│   └── Course.js          # 課程模型
├── routes/                 # API路由
│   ├── auth.js            # 身份驗證路由
│   ├── courses.js         # 課程路由
│   └── users.js           # 用戶路由
├── middleware/             # 中間件
│   └── auth.js            # 身份驗證中間件
├── public/                 # 靜態文件
│   ├── index.html         # 主頁
│   ├── styles.css         # 樣式文件
│   └── app.js             # 前端JavaScript
├── server.js              # 服務器入口文件
├── package.json           # 專案配置
├── env.example            # 環境變量示例
└── README.md              # 專案說明
```

## 🔧 API 文檔

### 身份驗證 API

#### 註冊用戶
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "用戶名",
  "email": "email@example.com",
  "password": "密碼"
}
```

#### 用戶登入
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "email@example.com",
  "password": "密碼"
}
```

#### 獲取用戶資料
```
GET /api/auth/me
Authorization: Bearer <token>
```

### 課程 API

#### 獲取所有課程
```
GET /api/courses?page=1&limit=12&category=程式設計&level=初學者
```

#### 獲取特色課程
```
GET /api/courses/featured
```

#### 獲取課程詳情
```
GET /api/courses/:id
```

#### 創建課程
```
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "課程標題",
  "description": "課程描述",
  "category": "程式設計",
  "level": "初學者",
  "price": 0,
  "isFree": true
}
```

#### 報名課程
```
POST /api/courses/:id/enroll
Authorization: Bearer <token>
```

#### 課程評分
```
POST /api/courses/:id/rate
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "review": "很棒課程！"
}
```

### 用戶 API

#### 獲取用戶資料
```
GET /api/users/:id
```

#### 獲取用戶課程
```
GET /api/users/:id/courses
```

#### 獲取熱門講師
```
GET /api/users/top/instructors
```

## 🎨 前端功能

### 主要頁面
- **首頁**: 展示特色課程、分類、熱門講師
- **課程詳情**: 課程信息、大綱、評價
- **用戶中心**: 個人資料、我的課程、收藏

### 互動功能
- 課程搜索和篩選
- 課程收藏和報名
- 課程評分和評論
- 實時通知系統

## 🔒 安全特性

- JWT身份驗證
- 密碼加密存儲
- 輸入驗證和清理
- CORS配置
- 速率限制
- Helmet安全頭

## 📱 響應式設計

- 桌面端優化
- 平板適配
- 手機端適配
- 觸控友好界面

## 🛠️ 開發工具

### 腳本命令
```bash
npm start          # 啟動生產服務器
npm run dev        # 啟動開發服務器（自動重啟）
npm run build      # 構建生產版本
```

### 調試
- 服務器日誌會顯示在控制台
- 前端錯誤會顯示在瀏覽器控制台
- API錯誤會返回詳細錯誤信息

## 🚀 部署

### 本地部署
1. 確保MongoDB運行
2. 配置環境變量
3. 運行 `npm start`

### 雲端部署
推薦使用以下平台：
- **Heroku**: 簡單易用
- **Vercel**: 適合前端部署
- **AWS**: 企業級部署
- **DigitalOcean**: 性價比高

### 環境變量配置
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/learning-share
JWT_SECRET=your-production-secret-key
```

## 🤝 貢獻指南

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

本專案採用 MIT 授權 - 查看 [LICENSE](LICENSE) 文件了解詳情

## 📞 聯絡我們

- 專案維護者: [您的名字]
- 電子郵件: [your.email@example.com]
- 專案連結: [https://github.com/yourusername/learning-share-platform]

## 🙏 致謝

- [Font Awesome](https://fontawesome.com/) - 圖標庫
- [Google Fonts](https://fonts.google.com/) - 字體
- [MongoDB](https://www.mongodb.com/) - 數據庫
- [Express.js](https://expressjs.com/) - Web框架

---

⭐ 如果這個專案對您有幫助，請給我們一個星標！ 