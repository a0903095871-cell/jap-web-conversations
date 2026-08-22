const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用戶名是必需的'],
    unique: true,
    trim: true,
    minlength: [3, '用戶名至少需要3個字符'],
    maxlength: [20, '用戶名不能超過20個字符']
  },
  email: {
    type: String,
    required: [true, '電子郵件是必需的'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '請輸入有效的電子郵件地址']
  },
  password: {
    type: String,
    required: [true, '密碼是必需的'],
    minlength: [6, '密碼至少需要6個字符']
  },
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/150x150?text=用戶'
  },
  bio: {
    type: String,
    maxlength: [500, '個人簡介不能超過500個字符']
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  coursesCreated: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  coursesEnrolled: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }]
}, {
  timestamps: true
});

// 密碼加密中間件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 驗證密碼方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 隱藏密碼
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema); 