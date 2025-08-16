const express = require('express');
const jwt = require('jsonwebtoken');
const { supabase } = require('../lib/supabase');
const router = express.Router();

// Helper function to verify JWT token and check admin role (secure async version)
async function verifyAdminToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    // Check if user is still admin in DB
    const { data: userData, error } = await supabase
      .from('Users')
      .select('role')
      .eq('id', decoded.id)
      .single();
    if (error || !userData || userData.role !== 'admin') {
      return null;
    }
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// GET /api/admin/users - Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    // Verify admin authentication
    const admin = await verifyAdminToken(req);
    if (!admin) {
      return res.status(401).json({ message: 'Unauthorized - Admin access required' });
    }

    console.log('Admin fetching all users:', admin.email);

    // Get all users for admin
    const { data, error } = await supabase
      .from('Users')
      .select('id, firstName, lastName, email, studentId, course, year, phoneNumber, role, isVerified, isActive, createdAt')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching admin users:', error);
      return res.status(500).json({ message: 'Failed to fetch users' });
    }

    console.log(`Admin fetched ${data.length} users`);
    res.status(200).json(data);

  } catch (error) {
    console.error('Admin Users API error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
});

module.exports = router;
