const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '訪問被拒絕，沒有提供令牌'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
    
  } catch (error) {
    console.error('身份驗證錯誤:', error);
    res.status(401).json({
      success: false,
      message: '無效的令牌'
    });
  }
};

module.exports = auth; 