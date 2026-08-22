const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '課程標題是必需的'],
    trim: true
  },
  description: {
    type: String,
    required: [true, '課程描述是必需的']
  },
  content: {
    type: String,
    required: [true, '課程內容是必需的']
  },
  videoUrl: {
    type: String
  },
  duration: {
    type: Number, // 分鐘
    default: 0
  },
  order: {
    type: Number,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '課程標題是必需的'],
    trim: true,
    maxlength: [100, '課程標題不能超過100個字符']
  },
  description: {
    type: String,
    required: [true, '課程描述是必需的'],
    maxlength: [1000, '課程描述不能超過1000個字符']
  },
  thumbnail: {
    type: String,
    default: 'https://via.placeholder.com/400x250?text=課程封面'
  },
  category: {
    type: String,
    required: [true, '課程分類是必需的'],
    enum: ['程式設計', '設計', '商業', '語言', '音樂', '健康', '其他']
  },
  level: {
    type: String,
    required: [true, '課程難度是必需的'],
    enum: ['初學者', '中級', '高級']
  },
  price: {
    type: Number,
    default: 0,
    min: [0, '價格不能為負數']
  },
  isFree: {
    type: Boolean,
    default: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lessons: [lessonSchema],
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      maxlength: [500, '評論不能超過500個字符']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  totalDuration: {
    type: Number,
    default: 0
  },
  totalLessons: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 計算平均評分
courseSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
  } else {
    const totalRating = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    this.averageRating = totalRating / this.ratings.length;
    this.totalRatings = this.ratings.length;
  }
};

// 更新課程統計信息
courseSchema.methods.updateStats = function() {
  this.totalLessons = this.lessons.length;
  this.totalDuration = this.lessons.reduce((sum, lesson) => sum + lesson.duration, 0);
};

// 保存前更新統計信息
courseSchema.pre('save', function(next) {
  this.updateStats();
  next();
});

module.exports = mongoose.model('Course', courseSchema); 