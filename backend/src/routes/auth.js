const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const { Op } = require('sequelize');
const { auth, requireEmailVerification } = require('../middleware/auth');
const { asyncHandler, ValidationError, AuthenticationError, NotFoundError } = require('../middleware/errorHandler');

const router = express.Router();

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    studentId,
    course,
    year,
    phoneNumber,
    password,
    confirmPassword
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !studentId || !course || !year || !phoneNumber || !password) {
    throw new ValidationError('Please provide all required fields');
  }

  // Validate password confirmation
  if (password !== confirmPassword) {
    throw new ValidationError('Passwords do not match');
  }

  // Validate password strength
  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Please provide a valid email address');
  }

  // Validate student ID format
  if (!/^\d{8}$/.test(studentId)) {
    throw new ValidationError('Student ID must be 8 digits');
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [
        { email: email.toLowerCase() },
        { studentId: studentId }
      ]
    }
  });

  if (existingUser) {
    if (existingUser.email === email.toLowerCase()) {
      throw new ValidationError('Email is already registered');
    }
    if (existingUser.studentId === studentId) {
      throw new ValidationError('Student ID is already registered');
    }
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  // Create email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');

  // Create new user
  const user = await User.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.toLowerCase().trim(),
    studentId: studentId.trim(),
    course: course.trim(),
    year,
    phoneNumber: phoneNumber.trim(),
    password: hashedPassword,
    emailVerificationToken,
    isVerified: true, // Set to true for now since email verification isn't fully implemented
  });

  // Generate JWT token
  const token = generateToken(user.id);

  // Remove password from response
  const userResponse = { ...user.get() };
  delete userResponse.password;
  delete userResponse.emailVerificationToken;


  res.status(201).json({
    success: true,
    message: 'User registered successfully.',
    data: {
      user: userResponse,
      token,
      emailVerificationRequired: false
    }
  });
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new ValidationError('Please provide email and password');
  }

  // Find user by email
  const user = await User.findOne({ where: { email: email.toLowerCase() } });

  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Check if account is active
  if (!user.isActive) {
    throw new AuthenticationError('Account is deactivated. Please contact support.');
  }

  // Generate token
  const token = generateToken(user.id);

  // Remove password from response
  const userResponse = { ...user.get() };
  delete userResponse.password;
  delete userResponse.emailVerificationToken;
  delete userResponse.passwordResetToken;
  delete userResponse.passwordResetExpires;

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userResponse,
      token,
      emailVerificationRequired: !user.isVerified
    }
  });
}));

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [{ model: require('../models').Item, as: 'items' }]
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const userResponse = { ...user.get() };
  delete userResponse.password;
  delete userResponse.emailVerificationToken;

  res.json({
    success: true,
    data: {
      user: userResponse
    }
  });
}));

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    course,
    year,
    phoneNumber,
    bio,
    notifications,
    privacy
  } = req.body;

  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Update allowed fields
  if (firstName !== undefined) user.firstName = firstName.trim();
  if (lastName !== undefined) user.lastName = lastName.trim();
  if (course !== undefined) user.course = course.trim();
  if (year !== undefined) user.year = year;
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber.trim();
  if (bio !== undefined) user.bio = bio.trim();
  // notifications and privacy can be handled as JSON columns if needed

  await user.save();

  const userResponse = { ...user.get() };
  delete userResponse.password;
  delete userResponse.emailVerificationToken;

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: userResponse
    }
  });
}));

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', auth, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Validate input
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ValidationError('Please provide current password, new password, and confirmation');
  }

  if (newPassword !== confirmPassword) {
    throw new ValidationError('New passwords do not match');
  }

  if (newPassword.length < 8) {
    throw new ValidationError('New password must be at least 8 characters long');
  }

  // Get user with password
  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new AuthenticationError('Current password is incorrect');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  user.password = hashedPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ValidationError('Please provide email address');
  }

  const user = await User.findOne({ 
    where: {
      email: email.toLowerCase(),
      isActive: true 
    }
  });

  if (!user) {
    // Don't reveal if email exists for security
    return res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.passwordResetToken = resetToken;
  user.passwordResetExpires = resetExpires;
  await user.save();

  // In a real app, you would send an email here
  // For now, we'll just return the token (remove in production)
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  res.json({
    success: true,
    message: 'Password reset link sent to your email',
    ...(process.env.NODE_ENV === 'development' && {
      resetToken,
      resetUrl
    })
  });
}));

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.post('/reset-password/:token', asyncHandler(async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;

  if (!password || !confirmPassword) {
    throw new ValidationError('Please provide password and confirmation');
  }

  if (password !== confirmPassword) {
    throw new ValidationError('Passwords do not match');
  }

  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long');
  }

  // Find user by reset token
  const user = await User.findOne({
    where: {
      passwordResetToken: token,
      passwordResetExpires: {
        [Op.gt]: new Date()
      }
    }
  });

  if (!user) {
    throw new AuthenticationError('Invalid or expired reset token');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Update password and clear reset token
  user.password = hashedPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  // Generate new JWT token
  const authToken = generateToken(user.id);

  res.json({
    success: true,
    message: 'Password reset successfully',
    data: {
      token: authToken
    }
  });
}));

// @route   POST /api/auth/verify-email/:token
// @desc    Verify email with token
// @access  Public
router.post('/verify-email/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;

  // Find user by verification token
  const user = await User.findOne({
    where: {
      emailVerificationToken: token
    }
  });

  if (!user) {
    throw new AuthenticationError('Invalid or expired verification token');
  }

  // Update email verification status
  user.isVerified = true;
  user.emailVerificationToken = null;
  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
}));

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification
// @access  Private
router.post('/resend-verification', auth, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.isVerified) {
    throw new ValidationError('Email is already verified');
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = verificationToken;
  await user.save();

  // In a real app, you would send an email here
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  res.json({
    success: true,
    message: 'Verification email sent',
    ...(process.env.NODE_ENV === 'development' && {
      verificationToken,
      verificationUrl
    })
  });
}));

// @route   DELETE /api/auth/account
// @desc    Deactivate user account
// @access  Private
router.delete('/account', auth, asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw new ValidationError('Please provide your password to confirm account deletion');
  }

  // Get user with password
  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AuthenticationError('Password is incorrect');
  }

  // Deactivate account instead of deleting
  user.isActive = false;
  await user.save();

  res.json({
    success: true,
    message: 'Account deactivated successfully'
  });
}));

// @route   GET /api/auth/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const stats = {
    itemsReported: 0, // You can add count logic later when implementing items
    itemsReturned: 0, // You can add count logic later when implementing items
    trustScore: 100, // Default trust score
    memberSince: user.createdAt,
    isEmailVerified: user.isVerified,
    accountStatus: user.isActive ? 'active' : 'inactive'
  };

  res.json({
    success: true,
    data: {
      stats
    }
  });
}));

module.exports = router;
