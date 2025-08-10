const express = require('express');
const { User, Item, sequelize } = require('../../models');
const { Op } = require('sequelize');
const { auth, isAdmin } = require('../middleware/auth');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const bcrypt = require('bcryptjs');

const router = express.Router();

// @route   GET /api/admin/dashboard/stats
// @desc    Get admin dashboard stats
// @access  Admin only
router.get('/dashboard/stats', auth, isAdmin, asyncHandler(async (req, res) => {
  // Get overview statistics
  const totalUsers = await User.count();
  const totalItems = await Item.count();
  const activeItems = await Item.count({ where: { status: 'open' } });
  const claimedItems = await Item.count({ where: { status: 'claimed' } });
  const closedItems = await Item.count({ where: { status: 'closed' } });
  
  // Get recent items (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentItems = await Item.count({
    where: {
      createdAt: {
        [Op.gte]: sevenDaysAgo
      }
    }
  });

  // Get items by category
  const itemsByCategory = await Item.findAll({
    attributes: ['category', [sequelize.fn('COUNT', sequelize.col('category')), 'count']],
    group: ['category'],
    raw: true
  });

  // Get items by type
  const lostItems = await Item.count({ where: { type: 'lost' } });
  const foundItems = await Item.count({ where: { type: 'found' } });

  res.json({
    totalUsers,
    totalItems,
    pendingItems: activeItems,
    claimedItems: claimedItems,
    closedItems: closedItems,
    matchedItems: await Item.count({ where: { status: 'matched' } })
  });
}));

// @route   GET /api/admin/items
// @desc    Get all items for admin management
// @access  Admin only
router.get('/items', auth, isAdmin, asyncHandler(async (req, res) => {
  const {
    type,
    category,
    status,
    search,
    page = 1,
    limit = 20,
    sort = 'createdAt'
  } = req.query;

  // Build where clause
  const where = {};

  if (type && ['lost', 'found'].includes(type)) {
    where.type = type;
  }

  if (category) {
    where.category = category;
  }

  if (status) {
    where.status = status;
  }

  // Text search
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } }
    ];
  }

  // Calculate pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  // Determine sort order
  const order = sort.startsWith('-') 
    ? [[sort.substring(1), 'DESC']]
    : [[sort, 'ASC']];

  // Execute query
  const { count, rows: items } = await Item.findAndCountAll({
    where,
    include: [{
      model: User,
      as: 'owner',
      attributes: ['id', 'firstName', 'lastName', 'studentId', 'email', 'phoneNumber']
    }],
    order,
    offset,
    limit: limitNum
  });

  const totalPages = Math.ceil(count / limitNum);

  res.json(items);
}));

// @route   PUT /api/admin/items/:id/status
// @desc    Update item status (admin action)
// @access  Admin only
router.put('/items/:id/status', auth, isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNote } = req.body;

  const validStatuses = ['open', 'claimed', 'closed', 'active', 'matched'];
  
  if (!validStatuses.includes(status)) {
    throw new ValidationError('Invalid status');
  }

  const item = await Item.findByPk(id);

  if (!item) {
    throw new NotFoundError('Item not found');
  }

  // Update item status
  const updateData = { 
    status,
    adminNote: adminNote || null,
    lastUpdatedBy: req.user.id
  };

  if (status === 'closed') {
    updateData.collectedAt = new Date();
  }

  if (status === 'claimed') {
    updateData.readyForCollectionAt = new Date();
    updateData.adminInCharge = req.user.id;
  }

  await Item.update(updateData, { where: { id } });

  res.json({
    success: true,
    message: `Item status updated to ${status}`
  });
}));

// @route   PUT /api/admin/items/:id/ready-for-collection
// @desc    Mark item as ready for collection
// @access  Admin only
router.put('/items/:id/ready-for-collection', auth, isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { collectionLocation, collectionInstructions } = req.body;

  const item = await Item.findByPk(id);

  if (!item) {
    throw new NotFoundError('Item not found');
  }

  // Update item with collection info
  await Item.update({
    status: 'claimed',
    collectionLocation: collectionLocation || 'Admin Office',
    collectionInstructions: collectionInstructions || 'Please bring your student ID for verification',
    readyForCollectionAt: new Date(),
    adminInCharge: req.user.id
  }, { where: { id } });

  res.json({
    success: true,
    message: 'Item marked as ready for collection'
  });
}));

// @route   POST /api/admin/items/:id/collected
// @desc    Mark item as closed (collected)
// @access  Admin only
router.post('/items/:id/collected', auth, isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { collectedBy, verificationMethod, notes } = req.body;

  const item = await Item.findByPk(id);

  if (!item) {
    throw new NotFoundError('Item not found');
  }

  // Update item as collected
  await Item.update({
    status: 'closed',
    collectedBy,
    collectedAt: new Date(),
    verificationMethod: verificationMethod || 'student_id',
    collectionNotes: notes,
    collectedByAdmin: req.user.id
  }, { where: { id } });

  // Get updated item
  const updatedItem = await Item.findByPk(id, {
    include: [{
      model: User,
      as: 'owner',
      attributes: ['firstName', 'lastName', 'email']
    }]
  });

  res.json({
    success: true,
    message: 'Item marked as closed (collected)',
    data: {
      item: updatedItem
    }
  });
}));

// @route   GET /api/admin/users
// @desc    Get all users for admin management
// @access  Admin only
router.get('/users', auth, isAdmin, asyncHandler(async (req, res) => {
  const {
    search,
    role,
    isActive,
    page = 1,
    limit = 20
  } = req.query;

  // Build where clause
  const where = {};

  if (role) {
    where.role = role;
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  // Text search
  if (search) {
    where[Op.or] = [
      { firstName: { [Op.iLike]: `%${search}%` } },
      { lastName: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { studentId: { [Op.iLike]: `%${search}%` } }
    ];
  }

  // Calculate pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  // Execute query
  const { count, rows: users } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
    include: [{
      model: Item,
      as: 'items',
      attributes: ['id', 'title', 'type', 'status', 'createdAt']
    }],
    order: [['createdAt', 'DESC']],
    offset,
    limit: limitNum
  });

  const totalPages = Math.ceil(count / limitNum);

  res.json(users);
}));

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Admin only
router.put('/users/:id/role', auth, isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ['user', 'admin', 'moderator'];
  
  if (!validRoles.includes(role)) {
    throw new ValidationError('Invalid role');
  }

  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Don't allow admins to demote themselves
  if (user.id === req.user.id && role !== 'admin') {
    throw new ValidationError('Cannot change your own role');
  }

  await User.update({ role }, { where: { id } });

  res.json({
    success: true,
    message: `User role updated to ${role}`
  });
}));

// @route   DELETE /api/admin/items/:id
// @desc    Delete any item (admin power)
// @access  Admin only
router.delete('/items/:id', auth, isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await Item.findByPk(id);
  if (!item) {
    throw new NotFoundError('Item not found');
  }

  await item.destroy();

  res.json({
    success: true,
    message: 'Item deleted successfully'
  });
}));

// @route   PUT /api/admin/items/:id/edit
// @desc    Edit any item completely (admin power)
// @access  Admin only
router.put('/items/:id/edit', auth, isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, category, location, type, status } = req.body;

  const item = await Item.findByPk(id);
  if (!item) {
    throw new NotFoundError('Item not found');
  }

  await item.update({
    title: title || item.title,
    description: description || item.description,
    category: category || item.category,
    location: location || item.location,
    type: type || item.type,
    status: status || item.status,
    lastUpdatedBy: req.user.id
  });

  const updatedItem = await Item.findByPk(id, {
    include: [{
      model: User,
      as: 'owner',
      attributes: ['firstName', 'lastName', 'email', 'studentId']
    }]
  });

  res.json({
    success: true,
    message: 'Item updated successfully',
    data: { item: updatedItem }
  });
}));

// @route   DELETE /api/admin/users/:id
// @desc    Delete any user account (admin power)
// @access  Admin only
router.delete('/users/:id', auth, isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Don't allow admins to delete themselves
  if (parseInt(id) === req.user.id) {
    throw new ValidationError('Cannot delete your own account');
  }

  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Delete all items associated with this user first
  await Item.destroy({ where: { userId: id } });
  
  await user.destroy();

  res.json({
    success: true,
    message: 'User and all associated items deleted successfully'
  });
}));

// @route   PUT /api/admin/users/:id/reset-password
// @desc    Reset user password (admin power)
// @access  Admin only
router.put('/users/:id/reset-password', auth, isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    throw new ValidationError('Password must be at least 6 characters long');
  }

  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await user.update({ password: hashedPassword });

  res.json({
    success: true,
    message: 'Password reset successfully'
  });
}));

// @route   PUT /api/admin/users/:id/activate
// @desc    Activate/Deactivate user account (admin power)
// @access  Admin only
router.put('/users/:id/activate', auth, isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  // Don't allow admins to deactivate themselves
  if (parseInt(id) === req.user.id && !isActive) {
    throw new ValidationError('Cannot deactivate your own account');
  }

  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  await user.update({ isActive: Boolean(isActive) });

  res.json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: { user: { id: user.id, isActive: Boolean(isActive) } }
  });
}));

// @route   POST /api/admin/items/bulk-action
// @desc    Perform bulk actions on multiple items (admin power)
// @access  Admin only
router.post('/items/bulk-action', auth, isAdmin, asyncHandler(async (req, res) => {
  const { itemIds, action, actionData = {} } = req.body;

  if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
    throw new ValidationError('Item IDs array is required');
  }

  if (!action) {
    throw new ValidationError('Action is required');
  }

  const items = await Item.findAll({
    where: { id: { [Op.in]: itemIds } }
  });

  if (items.length !== itemIds.length) {
    throw new NotFoundError('Some items not found');
  }

  let updateData = { lastUpdatedBy: req.user.id };
  let message = '';

  switch (action) {
    case 'verify':
      updateData.status = 'matched';
      message = 'Items verified successfully';
      break;
    case 'reject':
      updateData.status = 'closed';
      updateData.adminNote = actionData.adminNote || 'Rejected by admin';
      message = 'Items rejected successfully';
      break;
    case 'mark_ready':
      updateData.status = 'claimed';
      updateData.collectionLocation = actionData.collectionLocation || 'Main Office';
      updateData.collectionInstructions = actionData.collectionInstructions || 'Please bring ID';
      updateData.readyForCollectionAt = new Date();
      updateData.adminInCharge = req.user.id;
      message = 'Items marked ready for collection';
      break;
    case 'delete':
      await Item.destroy({ where: { id: { [Op.in]: itemIds } } });
      return res.json({
        success: true,
        message: 'Items deleted successfully'
      });
    default:
      throw new ValidationError('Invalid action');
  }

  await Item.update(updateData, {
    where: { id: { [Op.in]: itemIds } }
  });

  res.json({
    success: true,
    message,
    updatedCount: items.length
  });
}));

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics for admin dashboard
// @access  Admin only
router.get('/analytics', auth, isAdmin, asyncHandler(async (req, res) => {
  const { timeRange = '30' } = req.query; // days
  const days = parseInt(timeRange);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Items analytics
  const itemsByStatus = await Item.findAll({
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['status'],
    raw: true
  });

  const itemsByCategory = await Item.findAll({
    attributes: [
      'category',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['category'],
    raw: true
  });

  const itemsByType = await Item.findAll({
    attributes: [
      'type',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['type'],
    raw: true
  });

  // Recent activity
  const recentActivity = await Item.findAll({
    where: {
      createdAt: {
        [Op.gte]: startDate
      }
    },
    attributes: [
      [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
    order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
    raw: true
  });

  // User registration analytics
  const userRegistrations = await User.findAll({
    where: {
      createdAt: {
        [Op.gte]: startDate
      }
    },
    attributes: [
      [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
    order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
    raw: true
  });

  res.json({
    itemsByStatus,
    itemsByCategory,
    itemsByType,
    recentActivity,
    userRegistrations,
    timeRange: `${days} days`
  });
}));

// @route   GET /api/admin/export
// @desc    Export data (CSV format)
// @access  Admin only
router.get('/export', auth, isAdmin, asyncHandler(async (req, res) => {
  const { type = 'items' } = req.query;

  if (type === 'items') {
    const items = await Item.findAll({
      include: [{
        model: User,
        as: 'owner',
        attributes: ['firstName', 'lastName', 'email', 'studentId']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Convert to CSV format
    const csvHeader = 'ID,Title,Description,Category,Type,Status,Location,Owner Name,Owner Email,Created At,Updated At\n';
    const csvData = items.map(item => 
      `${item.id},"${item.title}","${item.description}",${item.category},${item.type},${item.status},"${item.location}","${item.owner?.firstName} ${item.owner?.lastName}",${item.owner?.email},${item.createdAt},${item.updatedAt}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=items_export.csv');
    res.send(csvHeader + csvData);
  } else if (type === 'users') {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    const csvHeader = 'ID,First Name,Last Name,Email,Student ID,Role,Active,Verified,Created At\n';
    const csvData = users.map(user => 
      `${user.id},"${user.firstName}","${user.lastName}",${user.email},${user.studentId || ''},${user.role},${user.isActive},${user.isVerified},${user.createdAt}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
    res.send(csvHeader + csvData);
  } else {
    throw new ValidationError('Invalid export type. Use "items" or "users"');
  }
}));

module.exports = router;
