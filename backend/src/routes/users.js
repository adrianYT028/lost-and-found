const express = require('express');
const { User } = require('../../models');
const { Item } = require('../../models');
const { auth, isAdmin, isModerator } = require('../middleware/auth');
const { asyncHandler, NotFoundError, ValidationError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', auth, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
    include: [{
      model: Item,
      as: 'items',
      attributes: ['id', 'title', 'type', 'category', 'status', 'createdAt'],
      where: {
        status: { [Op.in]: ['active', 'matched', 'closed'] }
      },
      required: false
    }]
  });

  if (!user || !user.isActive) {
    throw new NotFoundError('User not found');
  }

  const profile = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    studentId: user.studentId,
    course: user.course,
    year: user.year,
    phoneNumber: user.phoneNumber,
    avatar: user.avatar,
    isActive: user.isActive,
    createdAt: user.createdAt,
    items: user.items || [],
    itemsCount: {
      total: user.items ? user.items.length : 0,
      matched: user.items ? user.items.filter(item => item.status === 'matched').length : 0,
      active: user.items ? user.items.filter(item => item.status === 'active').length : 0,
      closed: user.items ? user.items.filter(item => item.status === 'closed').length : 0
    }
  };

  res.json({
    success: true,
    data: profile
  });
}));

// @route   GET /api/users/profile/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/profile/:id', asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['email', 'phoneNumber', 'password'] },
    include: [{
      model: Item,
      attributes: ['id', 'title', 'type', 'category', 'status', 'createdAt'],
      where: {
        isPrivate: false,
        status: { [Op.in]: ['open', 'returned'] }
      },
      required: false
    }]
  });

  if (!user || !user.isActive) {
    throw new NotFoundError('User not found');
  }

  const profile = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    studentId: user.studentId,
    course: user.course,
    year: user.year,
    avatar: user.avatar,
    isActive: user.isActive,
    createdAt: user.createdAt,
    Items: user.Items || [],
    itemsCount: {
      total: user.Items ? user.Items.length : 0,
      returned: user.Items ? user.Items.filter(item => item.status === 'returned').length : 0,
      active: user.Items ? user.Items.filter(item => item.status === 'open').length : 0
    }
  };

  res.json({
    success: true,
    data: {
      profile
    }
  });
}));

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', auth, asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;

  if (!q || q.trim().length < 2) {
    return res.json({
      success: true,
      data: {
        users: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalUsers: 0
        }
      }
    });
  }

  const searchCondition = {
    isActive: true,
    [Op.or]: [
      { firstName: { [Op.iLike]: `%${q}%` } },
      { lastName: { [Op.iLike]: `%${q}%` } },
      { studentId: { [Op.iLike]: `%${q}%` } },
      { course: { [Op.iLike]: `%${q}%` } }
    ]
  };

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  const { count: total, rows: users } = await User.findAndCountAll({
    where: searchCondition,
    attributes: ['id', 'firstName', 'lastName', 'studentId', 'course', 'year'],
    order: [['createdAt', 'DESC']],
    offset,
    limit: limitNum
  });

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalUsers: total,
        usersPerPage: limitNum
      }
    }
  });
}));

// @route   GET /api/users/leaderboard
// @desc    Get users leaderboard
// @access  Public
router.get('/leaderboard', asyncHandler(async (req, res) => {
  const { type = 'trust', limit = 10 } = req.query;

  let orderBy;
  switch (type) {
    case 'reported':
      orderBy = [['createdAt', 'DESC'], ['firstName', 'ASC']];
      break;
    case 'trust':
    default:
      orderBy = [['createdAt', 'DESC'], ['firstName', 'ASC']];
      break;
  }

  const users = await User.findAll({
    where: { 
      isActive: true
    },
    attributes: ['id', 'firstName', 'lastName', 'studentId', 'course', 'createdAt'],
    order: orderBy,
    limit: parseInt(limit)
  });

  res.json({
    success: true,
    data: {
      leaderboard: users.map((user, index) => ({
        rank: index + 1,
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        studentId: user.studentId,
        course: user.course,
        createdAt: user.createdAt
      }))
    }
  });
}));

// @route   GET /api/users/stats
// @desc    Get users statistics
// @access  Public
router.get('/stats', asyncHandler(async (req, res) => {
  const totalUsers = await User.count({
    where: { isActive: true }
  });

  const verifiedUsers = await User.count({
    where: { 
      isActive: true,
      isVerified: true
    }
  });

  const totalItems = await Item.count();
  const returnedItems = await Item.count({
    where: { status: 'returned' }
  });

  const returnRate = totalItems > 0 
    ? (returnedItems / totalItems * 100).toFixed(2)
    : 0;

  res.json({
    success: true,
    data: {
      totalUsers,
      verifiedUsers,
      totalItemsReported: totalItems,
      totalItemsReturned: returnedItems,
      returnRate: parseFloat(returnRate)
    }
  });
}));

// @route   PUT /api/users/:id/trust-score
// @desc    Update user trust score (Admin only)
// @access  Private (Admin)
router.put('/:id/trust-score', auth, isAdmin, asyncHandler(async (req, res) => {
  const { action, points, reason } = req.body;

  if (!action || !['increment', 'decrement'].includes(action)) {
    throw new ValidationError('Action must be either "increment" or "decrement"');
  }

  if (!points || points < 1 || points > 50) {
    throw new ValidationError('Points must be between 1 and 50');
  }

  const user = await User.findById(req.params.id);

  if (!user || !user.isActive) {
    throw new NotFoundError('User not found');
  }

  // Update trust score
  if (action === 'increment') {
    await user.incrementTrustScore(points);
  } else {
    await user.decrementTrustScore(points);
  }

  // Log the action (in a real app, you'd save this to an audit log)
  console.log(`Trust score ${action} for user ${user.studentId}: ${points} points. Reason: ${reason || 'No reason provided'}`);

  res.json({
    success: true,
    message: `Trust score ${action}ed successfully`,
    data: {
      user: {
        id: user._id,
        name: user.fullName,
        studentId: user.studentId,
        newTrustScore: user.trustScore
      }
    }
  });
}));

// @route   PUT /api/users/:id/status
// @desc    Update user account status (Admin only)
// @access  Private (Admin)
router.put('/:id/status', auth, isAdmin, asyncHandler(async (req, res) => {
  const { isActive, reason } = req.body;

  if (typeof isActive !== 'boolean') {
    throw new ValidationError('isActive must be a boolean value');
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Prevent admin from deactivating themselves
  if (req.user._id.toString() === user._id.toString() && !isActive) {
    throw new ValidationError('You cannot deactivate your own account');
  }

  user.isActive = isActive;
  await user.save();

  // Log the action
  const action = isActive ? 'activated' : 'deactivated';
  console.log(`User account ${action}: ${user.studentId} by admin ${req.user.studentId}. Reason: ${reason || 'No reason provided'}`);

  res.json({
    success: true,
    message: `User account ${action} successfully`,
    data: {
      user: {
        id: user._id,
        name: user.fullName,
        studentId: user.studentId,
        isActive: user.isActive
      }
    }
  });
}));

// @route   GET /api/users/admin/list
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/admin/list', auth, isAdmin, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    role,
    course,
    year,
    verified,
    sort = '-createdAt'
  } = req.query;

  // Build query
  const query = {};

  if (search) {
    query.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { studentId: new RegExp(search, 'i') }
    ];
  }

  if (status !== undefined) {
    query.isActive = status === 'active';
  }

  if (role) {
    query.role = role;
  }

  if (course) {
    query.course = new RegExp(course, 'i');
  }

  if (year) {
    query.year = year;
  }

  if (verified !== undefined) {
    query.isEmailVerified = verified === 'true';
  }

  // Calculate pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  const users = await User.find(query)
    .select('-password')
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalUsers: total,
        usersPerPage: limitNum
      }
    }
  });
}));

// @route   GET /api/users/:id/activity
// @desc    Get user activity (Admin/Moderator only)
// @access  Private (Admin/Moderator)
router.get('/:id/activity', auth, isModerator, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Get user's items
  const items = await Item.find({ reportedBy: user._id })
    .select('title type category status createdAt dateTime location')
    .sort({ createdAt: -1 })
    .limit(50);

  // Get recent activity summary
  const activitySummary = {
    totalItems: user.itemsReported,
    returnedItems: user.itemsReturned,
    activeItems: items.filter(item => item.status === 'active').length,
    recentItems: items.slice(0, 10),
    joinedDate: user.createdAt,
    lastActive: user.updatedAt,
    trustScore: user.trustScore,
    isEmailVerified: user.isEmailVerified,
    accountStatus: user.isActive ? 'active' : 'inactive'
  };

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        studentId: user.studentId,
        course: user.course,
        year: user.year
      },
      activity: activitySummary
    }
  });
}));

module.exports = router;
