const { Item, User } = require('../models');

/**
 * Middleware to get an item by ID and attach it to req.item
 * Used for routes that need to work with a specific item
 */
const getItem = async (req, res, next) => {
  try {
    const { id, itemId } = req.params;
    const itemIdToFind = id || itemId;

    if (!itemIdToFind) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    const item = await Item.findByPk(itemIdToFind, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'firstName', 'lastName', 'email', 'studentId']
      }]
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Attach item to request object for use in route handlers
    req.item = item;
    req.resource = item; // Alternative name for compatibility
    
    next();
  } catch (error) {
    console.error('Error in getItem middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching item'
    });
  }
};

/**
 * Middleware to check if the current user owns the item
 * Must be used after getItem and auth middleware
 */
const checkOwnership = (allowAdmin = false) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!req.item) {
        return res.status(500).json({
          success: false,
          message: 'Item not found in request context'
        });
      }

      // Check if user owns the item
      const isOwner = req.item.ownerId === req.user.id;
      const isAdmin = allowAdmin && req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this item'
        });
      }

      next();
    } catch (error) {
      console.error('Error in checkOwnership middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while checking ownership'
      });
    }
  };
};

module.exports = {
  getItem,
  checkOwnership
};
