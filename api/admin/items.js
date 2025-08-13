const express = require('express');
const jwt = require('jsonwebtoken');
const { supabase } = require('../lib/supabase');
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

// GET /api/admin/items - Get all items (admin only)
router.get('/', async (req, res) => {
  try {
    // Verify admin authentication
    const admin = verifyAdminToken(req);
    if (!admin) {
      return res.status(401).json({ message: 'Unauthorized - Admin access required' });
    }

    console.log('Admin fetching all items:', admin.email);

    // Get all items for admin (including non-open status)
    const { data, error } = await supabase
      .from('Items')
      .select(`
        *,
        owner:Users!userId (
          firstName,
          lastName,
          studentId,
          email,
          phoneNumber
        )
      `)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching admin items:', error);
      return res.status(500).json({ message: 'Failed to fetch items' });
    }

    console.log(`Admin fetched ${data.length} items`);
    res.status(200).json(data);

  } catch (error) {
    console.error('Admin Items API error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
});

module.exports = router;
