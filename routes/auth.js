const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// 註冊
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('用戶名必須在3-20個字符之間')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用戶名只能包含字母、數字和下劃線'),
  body('email')
    .isEmail()
    .withMessage('請輸入有效的電子郵件地址'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密碼至少需要6個字符')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '驗證錯誤',
        errors: errors.array()
      });
    }

    const { username, email, password } = req.body;

    // 檢查數據庫連接
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: '數據庫未連接，請先設置MongoDB'
      });
    }

    // 檢查用戶是否已存在
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用戶名或電子郵件已存在'
      });
    }

    // 創建新用戶
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: '註冊成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({
      success: false,
      message: '註冊失敗，請稍後再試'
    });
  }
});

// 登入
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('請輸入有效的電子郵件地址'),
  body('password')
    .notEmpty()
    .withMessage('密碼是必需的')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '驗證錯誤',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // 檢查數據庫連接
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: '數據庫未連接，請先設置MongoDB'
      });
    }

    // 查找用戶
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '電子郵件或密碼錯誤'
      });
    }

    // 驗證密碼
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '電子郵件或密碼錯誤'
      });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: '登入成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({
      success: false,
      message: '登入失敗，請稍後再試'
    });
  }
});

// 獲取當前用戶信息
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('coursesCreated', 'title thumbnail')
      .populate('coursesEnrolled', 'title thumbnail')
      .populate('favorites', 'title thumbnail');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('獲取用戶信息錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取用戶信息失敗'
    });
  }
});

// 更新用戶資料
router.put('/profile', auth, [
  body('username')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('用戶名必須在3-20個字符之間'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('個人簡介不能超過500個字符')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '驗證錯誤',
        errors: errors.array()
      });
    }

    const { username, bio, avatar } = req.body;
    const updateData = {};

    if (username) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: '資料更新成功',
      user
    });

  } catch (error) {
    console.error('更新資料錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新資料失敗'
    });
  }
});

module.exports = router; 