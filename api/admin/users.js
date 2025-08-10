const jwt = require('jsonwebtoken');
const { supabase } = require('../lib/supabase');

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

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify admin authentication
    const admin = verifyAdminToken(req);
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
};
