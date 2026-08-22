const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中間件
app.use(helmet());
app.use(cors());

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 100 // 限制每個IP每15分鐘最多100個請求
});
app.use(limiter);

// 解析JSON和URL編碼的請求體
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 靜態文件服務
app.use(express.static(path.join(__dirname, 'public')));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);

// 數據庫連接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-share', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ 成功連接到MongoDB'))
.catch(err => {
  console.error('❌ MongoDB連接錯誤:', err.message);
  console.log('⚠️  應用程序將使用模擬數據運行');
  console.log('💡 要使用真實數據庫，請：');
  console.log('   1. 安裝 MongoDB 或使用 MongoDB Atlas');
  console.log('   2. 更新 .env 文件中的 MONGODB_URI');
  console.log('   3. 重新啟動應用程序');
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: '服務器內部錯誤',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404處理
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: '找不到請求的資源' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 服務器運行在端口 ${PORT}`);
  console.log(`📱 訪問 http://localhost:${PORT}`);
}); 