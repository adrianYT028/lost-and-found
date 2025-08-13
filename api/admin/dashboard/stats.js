const express = require('express');
const jwt = require('jsonwebtoken');
const { supabase } = require('../../lib/supabase');
const router = express.Router();

// Helper function to verify JWT token and check admin role
function verifyAdminToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Check if user has admin role
    if (decoded.role !== 'admin') {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// GET /api/admin/dashboard/stats - Get dashboard statistics (admin only)
router.get('/', async (req, res) => {
  try {
    // Verify admin authentication
    const admin = verifyAdminToken(req);
    if (!admin) {
      return res.status(401).json({ message: 'Unauthorized - Admin access required' });
    }

    console.log('Admin fetching dashboard stats:', admin.email);

    // Get dashboard statistics
    const [itemsResult, usersResult] = await Promise.all([
      supabase.from('Items').select('id, status, type, createdAt'),
      supabase.from('Users').select('id, role, isActive, createdAt')
    ]);

    if (itemsResult.error || usersResult.error) {
      console.error('Error fetching stats:', itemsResult.error || usersResult.error);
      return res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }

    const items = itemsResult.data || [];
    const users = usersResult.data || [];

    // Calculate statistics
    const stats = {
      totalItems: items.length,
      openItems: items.filter(item => item.status === 'open').length,
      closedItems: items.filter(item => item.status === 'closed').length,
      claimedItems: items.filter(item => item.status === 'claimed').length,
      lostItems: items.filter(item => item.type === 'lost').length,
      foundItems: items.filter(item => item.type === 'found').length,
      
      totalUsers: users.length,
      activeUsers: users.filter(user => user.isActive).length,
      adminUsers: users.filter(user => user.role === 'admin').length,
      studentUsers: users.filter(user => user.role === 'student').length,
      
      // Recent activity (last 7 days)
      recentItems: items.filter(item => {
        const itemDate = new Date(item.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return itemDate >= weekAgo;
      }).length,
      
      recentUsers: users.filter(user => {
        const userDate = new Date(user.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return userDate >= weekAgo;
      }).length
    };

    console.log('Dashboard stats calculated:', stats);
    res.status(200).json(stats);

  } catch (error) {
    console.error('Admin Dashboard Stats API error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
});

module.exports = router;
