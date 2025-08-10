const jwt = require('jsonwebtoken');
const { supabase } = require('../lib/supabase');

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
    // Verify authentication
    const user = verifyToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - Please log in' });
    }

    console.log('Fetching items for user:', user.id);

    // Get items created by the authenticated user
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
      .eq('userId', user.id)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching user items:', error);
      return res.status(500).json({ message: 'Failed to fetch your items' });
    }

    console.log(`Found ${data.length} items for user ${user.id}`);
    res.status(200).json(data);

  } catch (error) {
    console.error('My Items API error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};
