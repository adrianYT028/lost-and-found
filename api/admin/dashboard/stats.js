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

    // Get basic dashboard statistics
    const [itemsResult, usersResult] = await Promise.all([
      supabase.from('Items').select('id, status, type, createdAt'),
      supabase.from('Users').select('id, role, createdAt')
    ]);

    if (itemsResult.error || usersResult.error) {
      console.error('Error fetching stats:', itemsResult.error || usersResult.error);
      return res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }

    const items = itemsResult.data || [];
    const users = usersResult.data || [];

    // Calculate basic statistics
    const stats = {
      totalItems: items.length,
      pendingItems: items.filter(item => item.status === 'pending' || item.status === 'open').length,
      claimedItems: items.filter(item => item.status === 'claimed' || item.status === 'collected').length,
      totalUsers: users.length,
      lostItems: items.filter(item => item.type === 'lost').length,
      foundItems: items.filter(item => item.type === 'found').length
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
