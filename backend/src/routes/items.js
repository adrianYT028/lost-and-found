const express = require('express');
const multer = require('multer');
const path = require('path');
const { Item, User } = require('../../models');
const { Op } = require('sequelize');
const { auth, optionalAuth, checkOwnership, requireEmailVerification } = require('../middleware/auth');
const { asyncHandler, ValidationError, NotFoundError, AuthorizationError } = require('../middleware/errorHandler');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads');
    
    // Ensure directory exists
    if (!require('fs').existsSync(uploadPath)) {
      require('fs').mkdirSync(uploadPath, { recursive: true });
      console.log('📁 Created uploads directory during file upload:', uploadPath);
    }
    
    console.log('📤 File upload destination:', uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log('📝 Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Max 5 files
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Create upload middleware that handles both files and text fields
const uploadFields = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'title', maxCount: 1 },
  { name: 'description', maxCount: 1 },
  { name: 'type', maxCount: 1 },
  { name: 'category', maxCount: 1 },
  { name: 'location', maxCount: 1 },
  { name: 'dateTime', maxCount: 1 },
  { name: 'contactInfo', maxCount: 1 },
  { name: 'reward', maxCount: 1 }
]);

// Middleware to get item and attach to request
const getItem = asyncHandler(async (req, res, next) => {
  const item = await Item.findByPk(req.params.id, {
    include: [{
      model: User,
      as: 'owner',
      attributes: ['firstName', 'lastName', 'studentId']
    }]
  });
  
  if (!item) {
    throw new NotFoundError('Item not found');
  }
  
  req.resource = item;
  next();
});

// @route   GET /api/items
// @desc    Get all items with filtering and pagination
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const {
    type,
    category,
    status = 'open',
    search,
    building,
    dateFrom,
    dateTo,
    page = 1,
    limit = 20,
    sort = 'createdAt'
  } = req.query;

  // Build where clause
  const where = {};

  // Filter by type (lost/found)
  if (type && ['lost', 'found'].includes(type)) {
    where.type = type;
  }

  // Filter by category
  if (category) {
    where.category = category;
  }

  // Filter by status
  if (status) {
    where.status = status;
  }

  // Filter by building (location contains building name)
  if (building) {
    where.location = {
      [Op.iLike]: `%${building}%`
    };
  }

  // Date range filter
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
    if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
  }

  // Text search across title and description
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
      attributes: ['firstName', 'lastName', 'studentId']
    }],
    order,
    offset,
    limit: limitNum
  });

  // Calculate pagination info
  const totalPages = Math.ceil(count / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;

  res.json({
    success: true,
    data: {
      items,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: count,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPrevPage
      }
    }
  });
}));

// @route   GET /api/items/my
// @desc    Get current user's items
// @access  Private
router.get('/my', auth, asyncHandler(async (req, res) => {
  const {
    type,
    status,
    page = 1,
    limit = 20,
    sort = 'createdAt'
  } = req.query;

  // Build where clause
  const where = { userId: req.user.id };

  if (type) where.type = type;
  if (status) where.status = status;

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
      attributes: ['firstName', 'lastName', 'studentId']
    }],
    order,
    offset,
    limit: limitNum
  });

  const totalPages = Math.ceil(count / limitNum);

  res.json({
    success: true,
    data: {
      items,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: count,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    }
  });
}));

// @route   GET /api/items/:id
// @desc    Get single item by ID
// @access  Public
router.get('/:id', optionalAuth, getItem, asyncHandler(async (req, res) => {
  const item = req.resource;

  // Get similar items (implement this logic later if needed)
  // const similarItems = await Item.findAll({ where: { category: item.category }, limit: 5 });

  res.json({
    success: true,
    data: {
      item
      // similarItems
    }
  });
}));

// @route   POST /api/items
// @desc    Create new item
// @access  Private
router.post('/', auth, uploadFields, asyncHandler(async (req, res) => {
  console.log('📝 Raw req.body:', req.body);
  console.log('📁 Uploaded files:', req.files);

  // Parse JSON fields from FormData if they exist
  if (req.body.location && typeof req.body.location === 'string') {
    try {
      req.body.location = JSON.parse(req.body.location);
      console.log('✅ Parsed location:', req.body.location);
    } catch (e) {
      console.log('❌ Failed to parse location:', e.message);
      // If parsing fails, treat as string (for backward compatibility)
    }
  }
  
  if (req.body.contactInfo && typeof req.body.contactInfo === 'string') {
    try {
      req.body.contactInfo = JSON.parse(req.body.contactInfo);
      console.log('✅ Parsed contactInfo:', req.body.contactInfo);
    } catch (e) {
      console.log('❌ Failed to parse contactInfo:', e.message);
      // If parsing fails, treat as string
    }
  }

  const {
    title,
    description,
    type,
    category,
    location,
    dateTime,
    reward
  } = req.body;

  console.log('📋 Extracted fields:', { title, description, type, category, location, dateTime, reward });

  // Validate required fields
  if (!title || !description || !type || !category || !location || !dateTime) {
    console.log('❌ Missing required fields:', { title: !!title, description: !!description, type: !!type, category: !!category, location: !!location, dateTime: !!dateTime });
    throw new ValidationError('Required fields are missing: title, description, type, category, location, dateTime');
  }

  // Validate type
  if (!['lost', 'found'].includes(type)) {
    throw new ValidationError('Type must be either "lost" or "found"');
  }

  // Validate category
  const validCategories = [
    'electronics', 'clothing', 'accessories', 'books', 'bags',
    'documents', 'jewelry', 'sports', 'keys', 'others'
  ];
  if (!validCategories.includes(category.toLowerCase())) {
    throw new ValidationError(`Invalid category. Valid categories are: ${validCategories.join(', ')}`);
  }

  // Validate location
  if (!location || !location.building) {
    throw new ValidationError('Building is required in location');
  }

  // Convert location object to string for database storage
  const locationString = `${location.building}${location.floor ? `, Floor ${location.floor}` : ''}${location.room ? `, ${location.room}` : ''}`;

  // Handle uploaded files
  const uploadedImages = req.files && req.files.images ? req.files.images.map(file => file.filename) : [];
  console.log('🖼️ Uploaded images:', uploadedImages);

  // Create item
  const itemData = {
    title: title.trim(),
    description: description.trim(),
    type,
    category: category.toLowerCase(),
    location: locationString,
    dateTime: new Date(dateTime),
    status: 'open', // Explicitly set status to open
    userId: req.user.id,
    contactInfo: req.body.contactInfo || {},
    isPrivate: false,
    images: uploadedImages,
    reward: reward || null
  };

  console.log('💾 Creating item with data:', itemData);

  const item = await Item.create(itemData);

  // Get the created item with user data
  const itemWithUser = await Item.findByPk(item.id, {
    include: [{
      model: User,
      as: 'owner',
      attributes: ['firstName', 'lastName', 'studentId']
    }]
  });

  // Trigger AI matching in the background (don't wait for it)
  if (process.env.OPENAI_API_KEY) {
    setImmediate(async () => {
      try {
        const aiMatchingService = require('../services/aiMatchingService');
        await aiMatchingService.createAutoMatches(item.id);
        console.log(`AI matching triggered for item ${item.id}`);
      } catch (error) {
        console.error(`AI matching failed for item ${item.id}:`, error.message);
      }
    });
  }

  res.status(201).json({
    success: true,
    message: 'Item reported successfully',
    data: {
      item: itemWithUser
    }
  });
}));

// @route   PUT /api/items/:id
// @desc    Update item
// @access  Private (Owner only)
router.put('/:id', auth, getItem, checkOwnership(), asyncHandler(async (req, res) => {
  const item = req.resource;

  // Check if item can be updated
  if (['returned', 'expired'].includes(item.status)) {
    throw new ValidationError('Cannot update returned or expired items');
  }

  const {
    title,
    description,
    location,
    color,
    brand,
    model,
    size,
    material,
    serialNumber,
    uniqueFeatures,
    contactInfo,
    isPrivate
  } = req.body;

  // Update allowed fields
  const updateData = {};
  if (title !== undefined) updateData.title = title.trim();
  if (description !== undefined) updateData.description = description.trim();
  if (location !== undefined) updateData.location = { ...item.location, ...location };
  if (color !== undefined) updateData.color = color?.trim();
  if (brand !== undefined) updateData.brand = brand?.trim();
  if (model !== undefined) updateData.model = model?.trim();
  if (size !== undefined) updateData.size = size?.trim();
  if (material !== undefined) updateData.material = material?.trim();
  if (serialNumber !== undefined) updateData.serialNumber = serialNumber?.trim();
  if (uniqueFeatures !== undefined) updateData.uniqueFeatures = uniqueFeatures;
  if (contactInfo !== undefined) updateData.contactInfo = { ...item.contactInfo, ...contactInfo };
  if (isPrivate !== undefined) updateData.isPrivate = isPrivate;

  const [numUpdated] = await Item.update(updateData, {
    where: { id: item.id }
  });

  if (numUpdated === 0) {
    throw new ValidationError('Item not updated');
  }

  // Get updated item
  const updatedItem = await Item.findByPk(item.id, {
    include: [{
      model: User,
      attributes: ['firstName', 'lastName', 'studentId']
    }]
  });

  res.json({
    success: true,
    message: 'Item updated successfully',
    data: {
      item: updatedItem
    }
  });
}));

// @route   DELETE /api/items/:id
// @desc    Delete item
// @access  Private (Owner only)
router.delete('/:id', auth, getItem, checkOwnership(), asyncHandler(async (req, res) => {
  const item = req.resource;

  // Check if item can be deleted
  if (item.status === 'returned') {
    throw new ValidationError('Cannot delete returned items');
  }

  // Update status instead of deleting
  const [numUpdated] = await Item.update(
    { status: 'removed' },
    { where: { id: item.id } }
  );

  if (numUpdated === 0) {
    throw new ValidationError('Item not found');
  }

  res.json({
    success: true,
    message: 'Item removed successfully'
  });
}));

// @route   POST /api/items/:id/claim
// @desc    Claim an item
// @access  Private
router.post('/:id/claim', auth, getItem, asyncHandler(async (req, res) => {
  const item = req.resource;

  // Check if user can claim this item
  if (item.userId === req.user.id) {
    throw new ValidationError('You cannot claim your own item');
  }

  if (item.status !== 'open') {
    throw new ValidationError('This item cannot be claimed');
  }

  // Update item status to claimed
  const [numUpdated] = await Item.update(
    { 
      status: 'claimed',
      claimedBy: req.user.id,
      claimedAt: new Date()
    },
    { where: { id: item.id } }
  );

  if (numUpdated === 0) {
    throw new ValidationError('Item not found');
  }

  // Get updated item with user data
  const updatedItem = await Item.findByPk(item.id, {
    include: [{
      model: User,
      attributes: ['firstName', 'lastName', 'email', 'studentId']
    }]
  });

  res.json({
    success: true,
    message: 'Item claimed successfully',
    data: {
      item: updatedItem
    }
  });
}));

// @route   POST /api/items/:id/mark-returned
// @desc    Mark item as returned
// @access  Private (Owner only)
router.post('/:id/mark-returned', auth, getItem, checkOwnership(), asyncHandler(async (req, res) => {
  const item = req.resource;

  if (item.status === 'returned') {
    throw new ValidationError('Item is already marked as returned');
  }

  // Mark as returned
  const [numUpdated] = await Item.update(
    { 
      status: 'returned',
      returnedAt: new Date()
    },
    { where: { id: item.id } }
  );

  if (numUpdated === 0) {
    throw new ValidationError('Item not found');
  }

  // Get updated item
  const updatedItem = await Item.findByPk(item.id, {
    include: [{
      model: User,
      attributes: ['firstName', 'lastName', 'email', 'studentId']
    }]
  });

  res.json({
    success: true,
    message: 'Item marked as returned successfully',
    data: {
      item: updatedItem
    }
  });
}));

// @route   POST /api/items/:id/inquire
// @desc    Send inquiry about an item
// @access  Private
router.post('/:id/inquire', auth, getItem, asyncHandler(async (req, res) => {
  const { message } = req.body;
  const item = req.resource;

  if (!message || message.trim().length === 0) {
    throw new ValidationError('Message is required');
  }

  if (message.length > 500) {
    throw new ValidationError('Message cannot exceed 500 characters');
  }

  // Check if user is not the item owner
  if (item.reportedBy._id.toString() === req.user._id.toString()) {
    throw new ValidationError('You cannot inquire about your own item');
  }

  // Add inquiry
  await item.addInquiry(req.user._id, message.trim());

  // Create notification for item owner
  await Notification.createNotification({
    recipient: item.reportedBy._id,
    title: '💬 New Inquiry Received',
    message: `${req.user.firstName} ${req.user.lastName} sent an inquiry about your ${item.type} item: ${item.title}`,
    type: 'message_received',
    priority: 'medium',
    relatedItem: item._id,
    relatedUser: req.user._id,
    actionRequired: true,
    actionUrl: `/items/${item._id}/inquiries`,
    actionText: 'View Inquiry',
    deliveryChannels: {
      inApp: true,
      email: true,
      push: true
    }
  });

  res.json({
    success: true,
    message: 'Inquiry sent successfully'
  });
}));

// @route   GET /api/items/:id/inquiries
// @desc    Get inquiries for an item
// @access  Private (Owner only)
router.get('/:id/inquiries', auth, getItem, checkOwnership(), asyncHandler(async (req, res) => {
  const item = req.resource;

  // Populate inquiries with user details
  await item.populate('inquiries.user', 'firstName lastName studentId');

  res.json({
    success: true,
    data: {
      inquiries: item.inquiries
    }
  });
}));

// @route   PUT /api/items/:id/inquiries/:inquiryId/read
// @desc    Mark inquiry as read
// @access  Private (Owner only)
router.put('/:id/inquiries/:inquiryId/read', auth, getItem, checkOwnership(), asyncHandler(async (req, res) => {
  const item = req.resource;
  const { inquiryId } = req.params;

  const success = await item.markInquiryAsRead(inquiryId);

  if (!success) {
    throw new NotFoundError('Inquiry not found');
  }

  res.json({
    success: true,
    message: 'Inquiry marked as read'
  });
}));

// @route   GET /api/items/stats/overview
// @desc    Get items statistics
// @access  Public
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const stats = await Item.getStatistics();
  const categoryStats = await Item.getActiveCountByCategory();

  res.json({
    success: true,
    data: {
      overview: stats[0] || {
        totalItems: 0,
        lostItems: 0,
        foundItems: 0,
        returnedItems: 0,
        activeItems: 0
      },
      byCategory: categoryStats
    }
  });
}));

// @route   GET /api/items/search/suggestions
// @desc    Get search suggestions
// @access  Public
router.get('/search/suggestions', asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.json({
      success: true,
      data: {
        suggestions: []
      }
    });
  }

  // Search in titles and descriptions
  const items = await Item.find({
    $text: { $search: q },
    status: 'active',
    isPrivate: false,
    hiddenFromPublic: false
  })
    .select('title category type')
    .limit(10);

  const suggestions = items.map(item => ({
    id: item._id,
    title: item.title,
    category: item.category,
    type: item.type
  }));

  res.json({
    success: true,
    data: {
      suggestions
    }
  });
}));

module.exports = router;
