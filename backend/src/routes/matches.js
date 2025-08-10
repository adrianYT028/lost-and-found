const express = require('express');
const Match = require('../models/Match');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const { auth, checkMatchParticipant, requireEmailVerification } = require('../middleware/auth');
const { asyncHandler, ValidationError, NotFoundError, AuthorizationError } = require('../middleware/errorHandler');

const router = express.Router();

// Middleware to get match and attach to request
const getMatch = asyncHandler(async (req, res, next) => {
  const match = await Match.findById(req.params.id)
    .populate('lostItem foundItem')
    .populate('lostItemOwner foundItemReporter', 'firstName lastName studentId email phoneNumber');
  
  if (!match) {
    throw new NotFoundError('Match not found');
  }
  
  req.resource = match;
  next();
});

// @route   GET /api/matches
// @desc    Get user's matches
// @access  Private
router.get('/', auth, asyncHandler(async (req, res) => {
  const {
    status,
    type, // 'sent' or 'received'
    page = 1,
    limit = 20,
    sort = '-createdAt'
  } = req.query;

  // Build query to find matches where user is involved
  let query = {
    $or: [
      { lostItemOwner: req.user._id },
      { foundItemReporter: req.user._id }
    ]
  };

  if (status) {
    query.status = status;
  }

  // Filter by type (sent/received from user's perspective)
  if (type === 'sent') {
    // Matches where user initiated (lost item and someone found it)
    query = {
      lostItemOwner: req.user._id,
      ...query
    };
  } else if (type === 'received') {
    // Matches where user received (found item and someone lost it)
    query = {
      foundItemReporter: req.user._id,
      ...query
    };
  }

  // Calculate pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  const matches = await Match.find(query)
    .populate('lostItem foundItem')
    .populate('lostItemOwner foundItemReporter', 'firstName lastName studentId trustScore')
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  const total = await Match.countDocuments(query);

  // Add user role information to each match
  const matchesWithRole = matches.map(match => {
    const matchObj = match.toJSON();
    matchObj.userRole = match.lostItemOwner._id.toString() === req.user._id.toString() ? 'lostOwner' : 'foundReporter';
    matchObj.otherUser = matchObj.userRole === 'lostOwner' ? matchObj.foundItemReporter : matchObj.lostItemOwner;
    return matchObj;
  });

  res.json({
    success: true,
    data: {
      matches: matchesWithRole,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalMatches: total,
        matchesPerPage: limitNum
      }
    }
  });
}));

// @route   GET /api/matches/:id
// @desc    Get single match
// @access  Private (Participants only)
router.get('/:id', auth, getMatch, checkMatchParticipant, asyncHandler(async (req, res) => {
  const match = req.resource;

  // Mark messages as read for the current user
  await match.markMessagesAsRead(req.user._id);

  // Add user role information
  const matchObj = match.toJSON();
  matchObj.userRole = req.isLostOwner ? 'lostOwner' : 'foundReporter';
  matchObj.otherUser = req.isLostOwner ? matchObj.foundItemReporter : matchObj.lostItemOwner;

  res.json({
    success: true,
    data: {
      match: matchObj
    }
  });
}));

// @route   POST /api/matches
// @desc    Create a new match
// @access  Private
router.post('/', auth, requireEmailVerification, asyncHandler(async (req, res) => {
  const { lostItemId, foundItemId, message } = req.body;

  if (!lostItemId || !foundItemId) {
    throw new ValidationError('Both lost item ID and found item ID are required');
  }

  // Get both items
  const lostItem = await Item.findById(lostItemId).populate('reportedBy');
  const foundItem = await Item.findById(foundItemId).populate('reportedBy');

  if (!lostItem || !foundItem) {
    throw new NotFoundError('One or both items not found');
  }

  // Validate item types
  if (lostItem.type !== 'lost' || foundItem.type !== 'found') {
    throw new ValidationError('Invalid item types for matching');
  }

  // Check if items are active
  if (lostItem.status !== 'active' || foundItem.status !== 'active') {
    throw new ValidationError('Both items must be active to create a match');
  }

  // Check if user is involved in at least one of the items
  const isLostOwner = lostItem.reportedBy._id.toString() === req.user._id.toString();
  const isFoundReporter = foundItem.reportedBy._id.toString() === req.user._id.toString();

  if (!isLostOwner && !isFoundReporter) {
    throw new AuthorizationError('You must be the owner of at least one of the items');
  }

  // Check if match already exists
  const existingMatch = await Match.findOne({
    lostItem: lostItemId,
    foundItem: foundItemId
  });

  if (existingMatch) {
    throw new ValidationError('Match already exists for these items');
  }

  // Calculate match score (simple algorithm for now)
  let matchScore = 0;
  const matchingFactors = {
    category: false,
    location: false,
    timeFrame: false,
    description: false,
    color: false,
    brand: false,
    size: false
  };

  // Category match (30 points)
  if (lostItem.category === foundItem.category) {
    matchScore += 30;
    matchingFactors.category = true;
  }

  // Location match (25 points)
  if (lostItem.location.building === foundItem.location.building) {
    matchScore += 25;
    matchingFactors.location = true;
  }

  // Time frame match (20 points) - within 7 days
  const timeDiff = Math.abs(new Date(lostItem.dateTime) - new Date(foundItem.dateTime));
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
  if (daysDiff <= 7) {
    matchScore += 20;
    matchingFactors.timeFrame = true;
  }

  // Color match (10 points)
  if (lostItem.color && foundItem.color && 
      lostItem.color.toLowerCase() === foundItem.color.toLowerCase()) {
    matchScore += 10;
    matchingFactors.color = true;
  }

  // Brand match (10 points)
  if (lostItem.brand && foundItem.brand && 
      lostItem.brand.toLowerCase() === foundItem.brand.toLowerCase()) {
    matchScore += 10;
    matchingFactors.brand = true;
  }

  // Size match (5 points)
  if (lostItem.size && foundItem.size && 
      lostItem.size.toLowerCase() === foundItem.size.toLowerCase()) {
    matchScore += 5;
    matchingFactors.size = true;
  }

  // Create match
  const match = new Match({
    lostItem: lostItemId,
    foundItem: foundItemId,
    lostItemOwner: lostItem.reportedBy._id,
    foundItemReporter: foundItem.reportedBy._id,
    matchScore,
    matchingFactors,
    matchType: 'manual'
  });

  await match.save();

  // Add initial message if provided
  if (message && message.trim()) {
    await match.addMessage(req.user._id, message.trim());
  }

  // Create notifications for both users
  const otherUserId = isLostOwner ? foundItem.reportedBy._id : lostItem.reportedBy._id;
  await Notification.createMatchNotification(
    otherUserId,
    match._id,
    isLostOwner ? foundItemId : lostItemId,
    'match_found'
  );

  // Populate response
  await match.populate('lostItem foundItem');
  await match.populate('lostItemOwner foundItemReporter', 'firstName lastName studentId');

  res.status(201).json({
    success: true,
    message: 'Match created successfully',
    data: {
      match
    }
  });
}));

// @route   PUT /api/matches/:id/action
// @desc    Update user action on match (accept/reject)
// @access  Private (Participants only)
router.put('/:id/action', auth, getMatch, checkMatchParticipant, asyncHandler(async (req, res) => {
  const { action, notes } = req.body;
  const match = req.resource;

  if (!action || !['accepted', 'rejected'].includes(action)) {
    throw new ValidationError('Action must be either "accepted" or "rejected"');
  }

  // Check if user has already taken action
  const userAction = req.isLostOwner ? match.lostOwnerAction : match.foundReporterAction;
  if (userAction.action !== 'pending') {
    throw new ValidationError('You have already taken action on this match');
  }

  // Update user action
  await match.updateUserAction(req.user._id, action, notes);

  // Create notification for the other user
  const otherUserId = req.isLostOwner ? match.foundItemReporter._id : match.lostItemOwner._id;
  const notificationType = action === 'accepted' ? 'match_accepted' : 'match_rejected';
  
  await Notification.createMatchNotification(
    otherUserId,
    match._id,
    req.isLostOwner ? match.foundItem._id : match.lostItem._id,
    notificationType
  );

  res.json({
    success: true,
    message: `Match ${action} successfully`,
    data: {
      match
    }
  });
}));

// @route   POST /api/matches/:id/messages
// @desc    Send message in match
// @access  Private (Participants only)
router.post('/:id/messages', auth, getMatch, checkMatchParticipant, asyncHandler(async (req, res) => {
  const { message } = req.body;
  const match = req.resource;

  if (!message || message.trim().length === 0) {
    throw new ValidationError('Message is required');
  }

  if (message.length > 1000) {
    throw new ValidationError('Message cannot exceed 1000 characters');
  }

  // Add message
  await match.addMessage(req.user._id, message.trim());

  // Create notification for the other user
  const otherUserId = req.isLostOwner ? match.foundItemReporter._id : match.lostItemOwner._id;
  
  await Notification.createNotification({
    recipient: otherUserId,
    title: '💬 New Message',
    message: `${req.user.firstName} sent you a message about your match`,
    type: 'message_received',
    priority: 'medium',
    relatedMatch: match._id,
    relatedUser: req.user._id,
    actionRequired: true,
    actionUrl: `/matches/${match._id}`,
    actionText: 'View Message',
    deliveryChannels: {
      inApp: true,
      push: true
    }
  });

  res.json({
    success: true,
    message: 'Message sent successfully'
  });
}));

// @route   POST /api/matches/:id/schedule-verification
// @desc    Schedule verification for match
// @access  Private (Participants only)
router.post('/:id/schedule-verification', auth, getMatch, checkMatchParticipant, asyncHandler(async (req, res) => {
  const { method, location, scheduledDate, notes } = req.body;
  const match = req.resource;

  if (!method || !location || !scheduledDate) {
    throw new ValidationError('Method, location, and scheduled date are required');
  }

  const validMethods = ['in-person', 'photo', 'video-call', 'security-office'];
  if (!validMethods.includes(method)) {
    throw new ValidationError('Invalid verification method');
  }

  // Check if both users have accepted the match
  if (match.lostOwnerAction.action !== 'accepted' || match.foundReporterAction.action !== 'accepted') {
    throw new ValidationError('Both users must accept the match before scheduling verification');
  }

  // Schedule verification
  await match.scheduleVerification(method, location, new Date(scheduledDate), notes);

  // Create notification for both users
  const otherUserId = req.isLostOwner ? match.foundItemReporter._id : match.lostItemOwner._id;
  
  await Notification.createMatchNotification(
    otherUserId,
    match._id,
    req.isLostOwner ? match.foundItem._id : match.lostItem._id,
    'verification_required'
  );

  res.json({
    success: true,
    message: 'Verification scheduled successfully',
    data: {
      match
    }
  });
}));

// @route   POST /api/matches/:id/complete-verification
// @desc    Complete verification for match
// @access  Private (Participants only)
router.post('/:id/complete-verification', auth, getMatch, checkMatchParticipant, asyncHandler(async (req, res) => {
  const { notes, images } = req.body;
  const match = req.resource;

  if (!match.verification.scheduledDate) {
    throw new ValidationError('Verification must be scheduled before completion');
  }

  // Complete verification
  await match.completeVerification(req.user._id, notes, images);

  // Create notification for the other user
  const otherUserId = req.isLostOwner ? match.foundItemReporter._id : match.lostItemOwner._id;
  
  await Notification.createMatchNotification(
    otherUserId,
    match._id,
    req.isLostOwner ? match.foundItem._id : match.lostItem._id,
    'verification_completed'
  );

  res.json({
    success: true,
    message: 'Verification completed successfully',
    data: {
      match
    }
  });
}));

// @route   POST /api/matches/:id/complete-return
// @desc    Complete item return
// @access  Private (Participants only)
router.post('/:id/complete-return', auth, getMatch, checkMatchParticipant, asyncHandler(async (req, res) => {
  const { returnLocation, notes } = req.body;
  const match = req.resource;

  if (!returnLocation) {
    throw new ValidationError('Return location is required');
  }

  if (!match.verification.completedDate) {
    throw new ValidationError('Verification must be completed before return');
  }

  // Complete return
  await match.completeReturn(returnLocation, req.user._id, notes);

  // Update item statuses
  await Item.findByIdAndUpdate(match.lostItem._id, { 
    status: 'returned',
    isReturned: true,
    returnedAt: new Date()
  });
  await Item.findByIdAndUpdate(match.foundItem._id, { 
    status: 'returned',
    isReturned: true,
    returnedAt: new Date()
  });

  // Update user statistics
  const lostOwner = await User.findById(match.lostItemOwner._id);
  const foundReporter = await User.findById(match.foundItemReporter._id);
  
  await lostOwner.incrementItemsReturned();
  await foundReporter.incrementItemsReturned();
  await lostOwner.incrementTrustScore(10);
  await foundReporter.incrementTrustScore(15); // Finder gets more points

  // Create notifications for both users
  await Notification.createItemNotification(
    match.lostItemOwner._id,
    match.lostItem._id,
    'item_returned'
  );
  await Notification.createItemNotification(
    match.foundItemReporter._id,
    match.foundItem._id,
    'item_returned'
  );

  res.json({
    success: true,
    message: 'Return completed successfully',
    data: {
      match
    }
  });
}));

// @route   POST /api/matches/:id/rating
// @desc    Add satisfaction rating
// @access  Private (Participants only)
router.post('/:id/rating', auth, getMatch, checkMatchParticipant, asyncHandler(async (req, res) => {
  const { rating } = req.body;
  const match = req.resource;

  if (!rating || rating < 1 || rating > 5) {
    throw new ValidationError('Rating must be between 1 and 5');
  }

  if (!match.returnProcess.isCompleted) {
    throw new ValidationError('Return must be completed before rating');
  }

  // Add rating
  await match.addSatisfactionRating(req.user._id, rating);

  res.json({
    success: true,
    message: 'Rating submitted successfully'
  });
}));

// @route   GET /api/matches/stats/overview
// @desc    Get matches statistics
// @access  Public
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const stats = await Match.getStatistics();

  res.json({
    success: true,
    data: {
      stats: stats[0] || {
        totalMatches: 0,
        pendingMatches: 0,
        confirmedMatches: 0,
        completedMatches: 0,
        rejectedMatches: 0,
        averageMatchScore: 0
      }
    }
  });
}));

module.exports = router;
