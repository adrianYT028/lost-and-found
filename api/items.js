const express = require('express');
const jwt = require('jsonwebtoken');
const { supabase } = require('./lib/supabase');
const router = express.Router();

// Helper function to verify JWT token
function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// GET /api/items - Get all items
router.get('/', async (req, res) => {
  try {
    // Verify token to check user role
    const user = verifyToken(req);
    let isAdmin = false;
    
    if (user) {
      // Check if user is admin
      const { data: userData, error: userError } = await supabase
        .from('Users')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (!userError && userData) {
        isAdmin = userData.role === 'admin';
      }
    }

    // Build query based on user permissions
    let query = supabase
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
      .eq('status', 'open')
      .order('createdAt', { ascending: false })
      .limit(20);

    // If not admin, only show lost items (not found items)
    if (!isAdmin) {
      query = query.eq('type', 'lost');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching items:', error);
      return res.status(500).json({ message: 'Failed to fetch items' });
    }

    res.json(data);
  } catch (error) {
    console.error('Items API error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
});

// POST /api/items - Create new item
router.post('/', async (req, res) => {
  try {
    // Verify authentication for creating items
    const user = verifyToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - Please log in to create items' });
    }

    const { title, description, category, location, type, contactInfo, dateTime, reward } = req.body;
    
    console.log('Creating item with data:', {
      title, description, category, location, type, userId: user.id
    });

    // Validate required fields
    if (!title || !description || !type) {
      return res.status(400).json({ 
        message: 'Required fields are missing: title, description, type'
      });
    }

    // Extract location string from object or use as-is
    const locationString = location?.building || location || 'Unknown';

    // Create the item in database with userId
    const { data, error } = await supabase
      .from('Items')
      .insert([{
        title,
        description,
        category,
        location: locationString,
        type,
        images: [],
        status: 'open',
        userId: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating item:', error);
      return res.status(500).json({ 
        message: 'Failed to create item', 
        error: error.message
      });
    }

    console.log('Item created successfully:', data);
    res.status(201).json(data);
  } catch (error) {
    console.error('Items API error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
});

module.exports = router;
