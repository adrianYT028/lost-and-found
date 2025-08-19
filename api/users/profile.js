const jwt = require('jsonwebtoken');
const { supabase } = require('../lib/supabase');

// Helper function to parse request body
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        if (req.headers['content-type']?.includes('application/json')) {
          resolve(JSON.parse(body));
        } else {
          resolve(JSON.parse(body));
        }
      } catch (error) {
        console.error('Body parsing error:', error);
        resolve({});
      }
    });
    
    req.on('error', reject);
  });
}

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
  // Prevent caching to avoid 304 Not Modified
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Verify authentication
    const user = verifyToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      // Get user profile
      const { data, error } = await supabase
        .from('Users')
        .select('id, firstName, lastName, email, studentId, course, year, phoneNumber, role, isVerified, isActive, createdAt')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ message: 'Failed to fetch profile' });
      }

      if (!data) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        success: true,
        data: data
      });
    }

    else if (req.method === 'PUT') {
      // Update user profile
      const body = await parseBody(req);
      const { firstName, lastName, studentId, course, year, phoneNumber } = body;

      const updateData = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (studentId !== undefined) updateData.studentId = studentId;
      if (course !== undefined) updateData.course = course;
      if (year !== undefined) updateData.year = year ? parseInt(year) : null;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

      const { data, error } = await supabase
        .from('Users')
        .update(updateData)
        .eq('id', user.id)
        .select('id, firstName, lastName, email, studentId, course, year, phoneNumber, role, isVerified, isActive, createdAt')
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ message: 'Failed to update profile' });
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: data
      });
    }

    else {
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Profile API error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};
