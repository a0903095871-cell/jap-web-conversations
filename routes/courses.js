const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// 獲取所有課程
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      level, 
      search, 
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { isPublished: true };
    
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const courses = await Course.find(query)
      .populate('instructor', 'username avatar')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('獲取課程錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取課程失敗'
    });
  }
});

// 獲取特色課程
router.get('/featured', async (req, res) => {
  try {
    const courses = await Course.find({ 
      isPublished: true, 
      isFeatured: true 
    })
    .populate('instructor', 'username avatar')
    .sort({ createdAt: -1 })
    .limit(6);

    res.json({
      success: true,
      courses
    });

  } catch (error) {
    console.error('獲取特色課程錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取特色課程失敗'
    });
  }
});

// 獲取單個課程詳情
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'username avatar bio')
      .populate('ratings.user', 'username avatar');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: '課程不存在'
      });
    }

    res.json({
      success: true,
      course
    });

  } catch (error) {
    console.error('獲取課程詳情錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取課程詳情失敗'
    });
  }
});

// 創建課程
router.post('/', auth, [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('課程標題是必需的，且不能超過100個字符'),
  body('description')
    .isLength({ min: 1, max: 1000 })
    .withMessage('課程描述是必需的，且不能超過1000個字符'),
  body('category')
    .isIn(['程式設計', '設計', '商業', '語言', '音樂', '健康', '其他'])
    .withMessage('請選擇有效的課程分類'),
  body('level')
    .isIn(['初學者', '中級', '高級'])
    .withMessage('請選擇有效的課程難度')
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

    const courseData = {
      ...req.body,
      instructor: req.user.userId
    };

    const course = new Course(courseData);
    await course.save();

    // 更新用戶的創建課程列表
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { coursesCreated: course._id }
    });

    res.status(201).json({
      success: true,
      message: '課程創建成功',
      course
    });

  } catch (error) {
    console.error('創建課程錯誤:', error);
    res.status(500).json({
      success: false,
      message: '創建課程失敗'
    });
  }
});

// 更新課程
router.put('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '課程不存在'
      });
    }

    if (course.instructor.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: '您沒有權限編輯此課程'
      });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: '課程更新成功',
      course: updatedCourse
    });

  } catch (error) {
    console.error('更新課程錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新課程失敗'
    });
  }
});

// 刪除課程
router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '課程不存在'
      });
    }

    if (course.instructor.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: '您沒有權限刪除此課程'
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    // 從用戶的創建課程列表中移除
    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { coursesCreated: req.params.id }
    });

    res.json({
      success: true,
      message: '課程刪除成功'
    });

  } catch (error) {
    console.error('刪除課程錯誤:', error);
    res.status(500).json({
      success: false,
      message: '刪除課程失敗'
    });
  }
});

// 報名課程
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '課程不存在'
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: '課程尚未發布'
      });
    }

    // 檢查是否已經報名
    if (course.enrolledStudents.includes(req.user.userId)) {
      return res.status(400).json({
        success: false,
        message: '您已經報名此課程'
      });
    }

    // 添加到課程的報名學生列表
    course.enrolledStudents.push(req.user.userId);
    await course.save();

    // 添加到用戶的已報名課程列表
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { coursesEnrolled: req.params.id }
    });

    res.json({
      success: true,
      message: '報名成功'
    });

  } catch (error) {
    console.error('報名課程錯誤:', error);
    res.status(500).json({
      success: false,
      message: '報名失敗'
    });
  }
});

// 添加課程評分
router.post('/:id/rate', auth, [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('評分必須在1-5之間'),
  body('review')
    .optional()
    .isLength({ max: 500 })
    .withMessage('評論不能超過500個字符')
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

    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '課程不存在'
      });
    }

    // 檢查是否已經評分
    const existingRating = course.ratings.find(
      rating => rating.user.toString() === req.user.userId
    );

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: '您已經對此課程評分'
      });
    }

    // 添加評分
    course.ratings.push({
      user: req.user.userId,
      rating: req.body.rating,
      review: req.body.review || ''
    });

    // 重新計算平均評分
    course.calculateAverageRating();
    await course.save();

    res.json({
      success: true,
      message: '評分成功',
      averageRating: course.averageRating,
      totalRatings: course.totalRatings
    });

  } catch (error) {
    console.error('評分錯誤:', error);
    res.status(500).json({
      success: false,
      message: '評分失敗'
    });
  }
});

// 收藏/取消收藏課程
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const courseId = req.params.id;

    const isFavorited = user.favorites.includes(courseId);

    if (isFavorited) {
      // 取消收藏
      user.favorites = user.favorites.filter(id => id.toString() !== courseId);
      await user.save();
      
      res.json({
        success: true,
        message: '已取消收藏',
        isFavorited: false
      });
    } else {
      // 添加收藏
      user.favorites.push(courseId);
      await user.save();
      
      res.json({
        success: true,
        message: '已添加到收藏',
        isFavorited: true
      });
    }

  } catch (error) {
    console.error('收藏操作錯誤:', error);
    res.status(500).json({
      success: false,
      message: '操作失敗'
    });
  }
});

module.exports = router; 