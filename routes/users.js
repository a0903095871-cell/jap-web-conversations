const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const auth = require('../middleware/auth');

const router = express.Router();

// 獲取用戶資料
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('coursesCreated', 'title thumbnail description averageRating totalRatings')
      .populate('coursesEnrolled', 'title thumbnail description averageRating totalRatings');

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
    console.error('獲取用戶資料錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取用戶資料失敗'
    });
  }
});

// 獲取用戶創建的課程
router.get('/:id/courses', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }

    const courses = await Course.find({ 
      instructor: req.params.id,
      isPublished: true 
    })
    .populate('instructor', 'username avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Course.countDocuments({ 
      instructor: req.params.id,
      isPublished: true 
    });

    res.json({
      success: true,
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('獲取用戶課程錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取用戶課程失敗'
    });
  }
});

// 獲取用戶收藏的課程
router.get('/:id/favorites', auth, async (req, res) => {
  try {
    // 只能查看自己的收藏
    if (req.params.id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: '您只能查看自己的收藏'
      });
    }

    const { page = 1, limit = 12 } = req.query;
    
    const user = await User.findById(req.params.id)
      .populate({
        path: 'favorites',
        match: { isPublished: true },
        populate: { path: 'instructor', select: 'username avatar' }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const favorites = user.favorites.slice(startIndex, endIndex);

    res.json({
      success: true,
      courses: favorites,
      totalPages: Math.ceil(user.favorites.length / limit),
      currentPage: page,
      total: user.favorites.length
    });

  } catch (error) {
    console.error('獲取收藏課程錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取收藏課程失敗'
    });
  }
});

// 獲取用戶已報名的課程
router.get('/:id/enrolled', auth, async (req, res) => {
  try {
    // 只能查看自己的已報名課程
    if (req.params.id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: '您只能查看自己的已報名課程'
      });
    }

    const { page = 1, limit = 12 } = req.query;
    
    const user = await User.findById(req.params.id)
      .populate({
        path: 'coursesEnrolled',
        match: { isPublished: true },
        populate: { path: 'instructor', select: 'username avatar' }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const enrolledCourses = user.coursesEnrolled.slice(startIndex, endIndex);

    res.json({
      success: true,
      courses: enrolledCourses,
      totalPages: Math.ceil(user.coursesEnrolled.length / limit),
      currentPage: page,
      total: user.coursesEnrolled.length
    });

  } catch (error) {
    console.error('獲取已報名課程錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取已報名課程失敗'
    });
  }
});

// 搜索用戶
router.get('/search/users', async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: '搜索關鍵字是必需的'
      });
    }

    const query = {
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ]
    };

    const users = await User.find(query)
      .select('username avatar bio role coursesCreated')
      .populate('coursesCreated', 'title')
      .sort({ 'coursesCreated.length': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('搜索用戶錯誤:', error);
    res.status(500).json({
      success: false,
      message: '搜索用戶失敗'
    });
  }
});

// 獲取熱門講師
router.get('/top/instructors', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topInstructors = await User.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: 'instructor',
          as: 'courses'
        }
      },
      {
        $match: {
          'courses.isPublished': true
        }
      },
      {
        $addFields: {
          totalCourses: { $size: '$courses' },
          totalStudents: {
            $sum: '$courses.enrolledStudents'
          },
          averageRating: {
            $avg: '$courses.averageRating'
          }
        }
      },
      {
        $sort: {
          totalStudents: -1,
          averageRating: -1
        }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          username: 1,
          avatar: 1,
          bio: 1,
          totalCourses: 1,
          totalStudents: 1,
          averageRating: 1
        }
      }
    ]);

    res.json({
      success: true,
      instructors: topInstructors
    });

  } catch (error) {
    console.error('獲取熱門講師錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取熱門講師失敗'
    });
  }
});

module.exports = router; 