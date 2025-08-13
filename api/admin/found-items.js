const express = require('express');
const jwt = require('jsonwebtoken');
const { supabase } = require('../lib/supabase');
const router = express.Router();

// Helper function to verify JWT token and check admin role
async function verifyAdminToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Check if user is admin
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

// GET /api/admin/found-items - Get found items for admin review
router.get('/', async (req, res) => {
  try {
    // Verify admin access
    const admin = await verifyAdminToken(req);
    if (!admin) {
      return res.status(403).json({ message: 'Access denied - Admin privileges required' });
    }

    // Get only found items for admin review
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
      .eq('type', 'found')
      .eq('status', 'open')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching found items:', error);
      return res.status(500).json({ message: 'Failed to fetch found items' });
    }

    res.status(200).json(data);

  } catch (error) {
    console.error('Found Items API error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
});

module.exports = router;
