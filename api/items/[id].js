const jwt = require('jsonwebtoken');
const { supabase } = require('../../lib/supabase');

// Helper function to verify JWT token (optional for this endpoint)
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
    // Extract item ID from query params (Vercel dynamic routes)
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ message: 'Item ID is required' });
    }

    console.log('Fetching item with ID:', id);

    // Get item by ID
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
      .eq('id', id)
      .eq('status', 'open')
      .single();

    if (error) {
      console.error('Error fetching item:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Item not found' });
      }
      return res.status(500).json({ message: 'Failed to fetch item' });
    }

    if (!data) {
      return res.status(404).json({ message: 'Item not found' });
    }

    console.log('Item found:', data.title);
    res.status(200).json(data);

  } catch (error) {
    console.error('Item Detail API error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};
