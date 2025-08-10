const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  
  // Notification Content
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  
  // Notification Type
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: [
      'match_found',        // New match discovered
      'match_accepted',     // Someone accepted your match
      'match_rejected',     // Someone rejected your match
      'item_claimed',       // Your item was claimed
      'item_returned',      // Item was successfully returned
      'message_received',   // New message in match conversation
      'verification_required', // Verification needed for match
      'verification_completed', // Verification completed
      'item_expired',       // Your item listing expired
      'reminder',           // General reminder
      'system',             // System notification
      'security',           // Security-related notification
      'update'              // App/feature update
    ]
  },
  
  // Priority Level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  
  // Related Data
  relatedItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    default: null
  },
  relatedMatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    default: null
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Action Information
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    default: null
  },
  actionText: {
    type: String,
    maxlength: [50, 'Action text cannot exceed 50 characters'],
    default: null
  },
  actionCompleted: {
    type: Boolean,
    default: false
  },
  
  // Delivery Information
  deliveryChannels: {
    inApp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    }
  },
  
  // Delivery Status
  deliveryStatus: {
    inApp: {
      delivered: { type: Boolean, default: false },
      deliveredAt: { type: Date, default: null }
    },
    email: {
      delivered: { type: Boolean, default: false },
      deliveredAt: { type: Date, default: null },
      opened: { type: Boolean, default: false },
      openedAt: { type: Date, default: null }
    },
    push: {
      delivered: { type: Boolean, default: false },
      deliveredAt: { type: Date, default: null },
      clicked: { type: Boolean, default: false },
      clickedAt: { type: Date, default: null }
    },
    sms: {
      delivered: { type: Boolean, default: false },
      deliveredAt: { type: Date, default: null }
    }
  },
  
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Grouping (for batch notifications)
  groupId: {
    type: String,
    default: null
  },
  
  // Scheduling
  scheduledFor: {
    type: Date,
    default: null
  },
  
  // Expiration
  expiresAt: {
    type: Date,
    default: function() {
      // Notifications expire after 90 days
      return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ relatedItem: 1 });
notificationSchema.index({ relatedMatch: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ groupId: 1 });
notificationSchema.index({ priority: 1, isRead: 1 });

// Virtual for time since created
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Virtual for is recent (within last 24 hours)
notificationSchema.virtual('isRecent').get(function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.createdAt > oneDayAgo;
});

// Virtual for is urgent
notificationSchema.virtual('isUrgent').get(function() {
  return this.priority === 'urgent' || this.priority === 'high';
});

// Virtual for delivery success rate
notificationSchema.virtual('deliverySuccessRate').get(function() {
  let total = 0;
  let delivered = 0;
  
  if (this.deliveryChannels.inApp) {
    total++;
    if (this.deliveryStatus.inApp.delivered) delivered++;
  }
  if (this.deliveryChannels.email) {
    total++;
    if (this.deliveryStatus.email.delivered) delivered++;
  }
  if (this.deliveryChannels.push) {
    total++;
    if (this.deliveryStatus.push.delivered) delivered++;
  }
  if (this.deliveryChannels.sms) {
    total++;
    if (this.deliveryStatus.sms.delivered) delivered++;
  }
  
  return total > 0 ? (delivered / total) * 100 : 0;
});

// Pre-save middleware to mark in-app delivery as completed
notificationSchema.pre('save', function(next) {
  if (this.isNew && this.deliveryChannels.inApp) {
    this.deliveryStatus.inApp.delivered = true;
    this.deliveryStatus.inApp.deliveredAt = new Date();
  }
  next();
});

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Instance method to mark action as completed
notificationSchema.methods.markActionCompleted = function() {
  this.actionCompleted = true;
  return this.save();
};

// Instance method to update delivery status
notificationSchema.methods.updateDeliveryStatus = function(channel, status, timestamp = new Date()) {
  if (!this.deliveryStatus[channel]) {
    throw new Error(`Invalid delivery channel: ${channel}`);
  }
  
  if (status === 'delivered') {
    this.deliveryStatus[channel].delivered = true;
    this.deliveryStatus[channel].deliveredAt = timestamp;
  } else if (status === 'opened' && channel === 'email') {
    this.deliveryStatus[channel].opened = true;
    this.deliveryStatus[channel].openedAt = timestamp;
  } else if (status === 'clicked' && channel === 'push') {
    this.deliveryStatus[channel].clicked = true;
    this.deliveryStatus[channel].clickedAt = timestamp;
  }
  
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = function(data) {
  const notification = new this(data);
  return notification.save();
};

// Static method to create match notification
notificationSchema.statics.createMatchNotification = function(recipientId, matchId, itemId, type = 'match_found') {
  const titles = {
    match_found: '🔍 Potential Match Found!',
    match_accepted: '✅ Match Accepted',
    match_rejected: '❌ Match Rejected',
    verification_required: '🔐 Verification Required',
    verification_completed: '✅ Verification Complete'
  };
  
  const messages = {
    match_found: 'We found a potential match for your item. Check it out now!',
    match_accepted: 'Great news! Someone accepted your match request.',
    match_rejected: 'Unfortunately, your match request was rejected.',
    verification_required: 'Please verify this match to proceed with the return process.',
    verification_completed: 'Match verification completed successfully. You can now arrange the return.'
  };
  
  return this.createNotification({
    recipient: recipientId,
    title: titles[type] || 'New Notification',
    message: messages[type] || 'You have a new notification.',
    type: type,
    priority: type === 'match_found' ? 'high' : 'medium',
    relatedMatch: matchId,
    relatedItem: itemId,
    actionRequired: ['match_found', 'verification_required'].includes(type),
    actionUrl: `/matches/${matchId}`,
    actionText: type === 'match_found' ? 'View Match' : type === 'verification_required' ? 'Verify' : null,
    deliveryChannels: {
      inApp: true,
      email: ['match_found', 'verification_required'].includes(type),
      push: true
    }
  });
};

// Static method to create item notification
notificationSchema.statics.createItemNotification = function(recipientId, itemId, type, customMessage = null) {
  const titles = {
    item_claimed: '🎯 Item Claimed',
    item_returned: '🎉 Item Returned',
    item_expired: '⏰ Item Expired'
  };
  
  const messages = {
    item_claimed: customMessage || 'Someone has claimed your lost item!',
    item_returned: customMessage || 'Congratulations! Your item has been successfully returned.',
    item_expired: customMessage || 'Your item listing has expired. You can renew it if needed.'
  };
  
  return this.createNotification({
    recipient: recipientId,
    title: titles[type] || 'Item Update',
    message: messages[type] || 'Your item has been updated.',
    type: type,
    priority: type === 'item_returned' ? 'high' : 'medium',
    relatedItem: itemId,
    actionRequired: type === 'item_expired',
    actionUrl: `/items/${itemId}`,
    actionText: type === 'item_expired' ? 'Renew' : 'View Item',
    deliveryChannels: {
      inApp: true,
      email: type === 'item_returned',
      push: type !== 'item_expired'
    }
  });
};

// Static method to create system notification
notificationSchema.statics.createSystemNotification = function(recipientId, title, message, priority = 'medium') {
  return this.createNotification({
    recipient: recipientId,
    title: title,
    message: message,
    type: 'system',
    priority: priority,
    actionRequired: false,
    deliveryChannels: {
      inApp: true,
      email: priority === 'urgent',
      push: priority === 'urgent' || priority === 'high'
    }
  });
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function(userId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    unreadOnly = false,
    type = null,
    priority = null
  } = options;
  
  const query = { recipient: userId };
  
  if (unreadOnly) {
    query.isRead = false;
  }
  
  if (type) {
    query.type = type;
  }
  
  if (priority) {
    query.priority = priority;
  }
  
  return this.find(query)
    .populate('relatedItem', 'title type category')
    .populate('relatedMatch')
    .populate('relatedUser', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false
  });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to delete old notifications
notificationSchema.statics.deleteOldNotifications = function(daysOld = 90) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  });
};

// Static method to get notification statistics
notificationSchema.statics.getStatistics = function(userId = null) {
  const matchQuery = userId ? { recipient: userId } : {};
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalNotifications: { $sum: 1 },
        unreadNotifications: { $sum: { $cond: ['$isRead', 0, 1] } },
        highPriorityUnread: { 
          $sum: { 
            $cond: [
              { $and: [{ $eq: ['$isRead', false] }, { $in: ['$priority', ['high', 'urgent']] }] },
              1, 
              0
            ] 
          } 
        },
        actionRequired: { $sum: { $cond: ['$actionRequired', 1, 0] } },
        byType: {
          $push: {
            type: '$type',
            count: 1,
            unread: { $cond: ['$isRead', 0, 1] }
          }
        }
      }
    }
  ]);
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
