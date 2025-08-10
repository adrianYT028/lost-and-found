const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  // Items being matched
  lostItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Lost item is required']
  },
  foundItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Found item is required']
  },
  
  // Users involved
  lostItemOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Lost item owner is required']
  },
  foundItemReporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Found item reporter is required']
  },
  
  // Match Details
  matchScore: {
    type: Number,
    required: [true, 'Match score is required'],
    min: [0, 'Match score cannot be negative'],
    max: [100, 'Match score cannot exceed 100']
  },
  matchType: {
    type: String,
    enum: ['automatic', 'manual', 'ai-suggested'],
    default: 'automatic'
  },
  
  // Matching Criteria
  matchingFactors: {
    category: {
      type: Boolean,
      default: false
    },
    location: {
      type: Boolean,
      default: false
    },
    timeFrame: {
      type: Boolean,
      default: false
    },
    description: {
      type: Boolean,
      default: false
    },
    color: {
      type: Boolean,
      default: false
    },
    brand: {
      type: Boolean,
      default: false
    },
    size: {
      type: Boolean,
      default: false
    },
    images: {
      type: Boolean,
      default: false
    }
  },
  
  // Status and Workflow
  status: {
    type: String,
    enum: [
      'pending',      // Initial match, waiting for review
      'contacted',    // Users have been notified
      'verified',     // Match has been verified by users
      'confirmed',    // Both parties confirmed the match
      'completed',    // Item successfully returned
      'rejected',     // Match was rejected by one or both parties
      'expired',      // Match expired without action
      'disputed'      // There's a dispute about the match
    ],
    default: 'pending'
  },
  
  // User Actions
  lostOwnerAction: {
    action: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'disputed'],
      default: 'pending'
    },
    actionDate: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  
  foundReporterAction: {
    action: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'disputed'],
      default: 'pending'
    },
    actionDate: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  
  // Communication
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    },
    messageType: {
      type: String,
      enum: ['text', 'system', 'verification'],
      default: 'text'
    }
  }],
  
  // Verification Process
  verification: {
    isRequired: {
      type: Boolean,
      default: true
    },
    method: {
      type: String,
      enum: ['in-person', 'photo', 'video-call', 'security-office'],
      default: 'in-person'
    },
    location: {
      type: String,
      maxlength: [200, 'Verification location cannot exceed 200 characters']
    },
    scheduledDate: {
      type: Date,
      default: null
    },
    completedDate: {
      type: Date,
      default: null
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    verificationNotes: {
      type: String,
      maxlength: [500, 'Verification notes cannot exceed 500 characters']
    },
    verificationImages: [{
      url: String,
      publicId: String,
      description: String
    }]
  },
  
  // Return Process
  returnProcess: {
    isCompleted: {
      type: Boolean,
      default: false
    },
    returnDate: {
      type: Date,
      default: null
    },
    returnLocation: {
      type: String,
      maxlength: [200, 'Return location cannot exceed 200 characters']
    },
    witnessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    returnNotes: {
      type: String,
      maxlength: [500, 'Return notes cannot exceed 500 characters']
    },
    satisfactionRating: {
      lostOwner: {
        type: Number,
        min: 1,
        max: 5,
        default: null
      },
      foundReporter: {
        type: Number,
        min: 1,
        max: 5,
        default: null
      }
    }
  },
  
  // System Information
  aiConfidence: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  algorithmVersion: {
    type: String,
    default: '1.0'
  },
  
  // Administrative
  flags: [{
    reason: {
      type: String,
      required: true,
      enum: ['false-match', 'spam', 'fraud', 'inappropriate', 'other']
    },
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    flaggedAt: {
      type: Date,
      default: Date.now
    },
    description: String,
    resolved: {
      type: Boolean,
      default: false
    }
  }],
  
  // Tracking and Analytics
  views: {
    lostOwner: {
      type: Number,
      default: 0
    },
    foundReporter: {
      type: Number,
      default: 0
    }
  },
  
  // Expiration
  expiresAt: {
    type: Date,
    default: function() {
      // Matches expire after 30 days if not acted upon
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
matchSchema.index({ lostItem: 1, foundItem: 1 }, { unique: true });
matchSchema.index({ lostItemOwner: 1, status: 1 });
matchSchema.index({ foundItemReporter: 1, status: 1 });
matchSchema.index({ status: 1, createdAt: -1 });
matchSchema.index({ matchScore: -1 });
matchSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for overall match status
matchSchema.virtual('overallStatus').get(function() {
  if (this.returnProcess.isCompleted) return 'completed';
  if (this.lostOwnerAction.action === 'rejected' || this.foundReporterAction.action === 'rejected') return 'rejected';
  if (this.lostOwnerAction.action === 'disputed' || this.foundReporterAction.action === 'disputed') return 'disputed';
  if (this.lostOwnerAction.action === 'accepted' && this.foundReporterAction.action === 'accepted') return 'confirmed';
  if (this.verification.completedDate) return 'verified';
  return this.status;
});

// Virtual for match age
matchSchema.virtual('matchAge').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return 'Less than an hour ago';
});

// Virtual for unread messages count
matchSchema.virtual('unreadMessagesCount').get(function() {
  return this.messages.filter(msg => !msg.isRead).length;
});

// Virtual for is expired
matchSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Virtual for days until expiration
matchSchema.virtual('daysUntilExpiration').get(function() {
  const now = new Date();
  const diff = this.expiresAt - now;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
});

// Pre-save middleware to update status
matchSchema.pre('save', function(next) {
  // Auto-expire matches
  if (this.expiresAt < new Date() && this.status === 'pending') {
    this.status = 'expired';
  }
  
  // Update status based on user actions
  if (this.lostOwnerAction.action === 'accepted' && this.foundReporterAction.action === 'accepted') {
    if (this.status === 'pending' || this.status === 'contacted') {
      this.status = 'confirmed';
    }
  }
  
  // If return is completed, update status
  if (this.returnProcess.isCompleted && this.status !== 'completed') {
    this.status = 'completed';
  }
  
  next();
});

// Instance method to add message
matchSchema.methods.addMessage = function(senderId, message, messageType = 'text') {
  this.messages.push({
    sender: senderId,
    message: message,
    messageType: messageType,
    timestamp: new Date(),
    isRead: false
  });
  return this.save();
};

// Instance method to mark messages as read
matchSchema.methods.markMessagesAsRead = function(userId) {
  let updated = false;
  this.messages.forEach(msg => {
    if (!msg.isRead && msg.sender.toString() !== userId.toString()) {
      msg.isRead = true;
      updated = true;
    }
  });
  
  if (updated) {
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to update user action
matchSchema.methods.updateUserAction = function(userId, action, notes = '') {
  const isLostOwner = this.lostItemOwner.toString() === userId.toString();
  const isFoundReporter = this.foundItemReporter.toString() === userId.toString();
  
  if (!isLostOwner && !isFoundReporter) {
    throw new Error('User is not part of this match');
  }
  
  const actionData = {
    action: action,
    actionDate: new Date(),
    notes: notes
  };
  
  if (isLostOwner) {
    this.lostOwnerAction = actionData;
  } else {
    this.foundReporterAction = actionData;
  }
  
  // Add system message
  const actionText = action === 'accepted' ? 'accepted' : 'rejected';
  const userType = isLostOwner ? 'item owner' : 'finder';
  this.addMessage(userId, `The ${userType} has ${actionText} this match.`, 'system');
  
  return this.save();
};

// Instance method to schedule verification
matchSchema.methods.scheduleVerification = function(method, location, scheduledDate, notes = '') {
  this.verification.method = method;
  this.verification.location = location;
  this.verification.scheduledDate = scheduledDate;
  this.verification.verificationNotes = notes;
  
  // Add system message
  this.addMessage(
    this.lostItemOwner, 
    `Verification scheduled for ${scheduledDate.toDateString()} at ${location}`,
    'system'
  );
  
  return this.save();
};

// Instance method to complete verification
matchSchema.methods.completeVerification = function(verifierId, notes = '', images = []) {
  this.verification.completedDate = new Date();
  this.verification.verifiedBy = verifierId;
  this.verification.verificationNotes = notes;
  this.verification.verificationImages = images;
  this.status = 'verified';
  
  // Add system message
  this.addMessage(verifierId, 'Match verification completed successfully.', 'verification');
  
  return this.save();
};

// Instance method to complete return
matchSchema.methods.completeReturn = function(returnLocation, witnessId = null, notes = '') {
  this.returnProcess.isCompleted = true;
  this.returnProcess.returnDate = new Date();
  this.returnProcess.returnLocation = returnLocation;
  this.returnProcess.witnessedBy = witnessId;
  this.returnProcess.returnNotes = notes;
  this.status = 'completed';
  
  // Add system message
  this.addMessage(
    witnessId || this.lostItemOwner,
    `Item successfully returned at ${returnLocation}`,
    'system'
  );
  
  return this.save();
};

// Instance method to add satisfaction rating
matchSchema.methods.addSatisfactionRating = function(userId, rating) {
  const isLostOwner = this.lostItemOwner.toString() === userId.toString();
  const isFoundReporter = this.foundItemReporter.toString() === userId.toString();
  
  if (!isLostOwner && !isFoundReporter) {
    throw new Error('User is not part of this match');
  }
  
  if (isLostOwner) {
    this.returnProcess.satisfactionRating.lostOwner = rating;
  } else {
    this.returnProcess.satisfactionRating.foundReporter = rating;
  }
  
  return this.save();
};

// Instance method to add flag
matchSchema.methods.addFlag = function(reason, flaggedBy, description = '') {
  this.flags.push({
    reason,
    flaggedBy,
    description,
    flaggedAt: new Date(),
    resolved: false
  });
  return this.save();
};

// Static method to find matches for user
matchSchema.statics.findUserMatches = function(userId, status = null) {
  const query = {
    $or: [
      { lostItemOwner: userId },
      { foundItemReporter: userId }
    ]
  };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('lostItem foundItem')
    .populate('lostItemOwner foundItemReporter', 'firstName lastName studentId')
    .sort({ createdAt: -1 });
};

// Static method to get match statistics
matchSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalMatches: { $sum: 1 },
        pendingMatches: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        confirmedMatches: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
        completedMatches: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        rejectedMatches: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        averageMatchScore: { $avg: '$matchScore' }
      }
    }
  ]);
};

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
