const jwt = require('jsonwebtoken');
const { supabase } = require('./lib/supabase');

// Helper function to parse request body
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        // Try to parse as JSON first
        if (req.headers['content-type']?.includes('application/json')) {
          resolve(JSON.parse(body));
        } 
        // Handle FormData
        else if (req.headers['content-type']?.includes('multipart/form-data')) {
          // For FormData, we'll need to parse it manually or use a library
          // For now, let's expect JSON from the frontend
          resolve({});
        }
        // Handle URL-encoded data
        else if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
          const parsed = {};
          body.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            parsed[decodeURIComponent(key)] = decodeURIComponent(value);
          });
          resolve(parsed);
        }
        else {
          // Try JSON parsing as fallback
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

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get all items
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
        .eq('status', 'open')
        .order('createdAt', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching items:', error);
        return res.status(500).json({ message: 'Failed to fetch items' });
      }

      res.status(200).json(data);
    }

    else if (req.method === 'POST') {
      // Verify authentication for creating items
      const user = verifyToken(req);
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized - Please log in to create items' });
      }

      // Parse request body manually
      const body = await parseBody(req);
      
      console.log('POST request received');
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Parsed body:', body);
      console.log('Authenticated user:', user.id);
      
      // Extract fields from parsed body
      const { title, description, category, location, type, contactInfo, dateTime, reward } = body;
      
      console.log('Extracted fields:', {
        title, description, category, location, type, contactInfo, dateTime, reward
      });
      
      // Parse JSON strings if they exist (from FormData)
      let parsedLocation = location;
      let parsedContactInfo = contactInfo;
      
      try {
        if (typeof location === 'string') {
          parsedLocation = JSON.parse(location);
        }
        if (typeof contactInfo === 'string') {
          parsedContactInfo = JSON.parse(contactInfo);
        }
      } catch (e) {
        console.log('No JSON parsing needed for location/contactInfo');
      }

      // Validate required fields
      if (!title || !description || !type) {
        console.log('Validation failed - missing required fields');
        return res.status(400).json({ 
          message: 'Required fields are missing: title, description, type',
          received: { 
            title: !!title, 
            description: !!description, 
            type: !!type,
            allFields: Object.keys(body || {})
          }
        });
      }

      // Extract location string from object or use as-is
      const locationString = parsedLocation?.building || location || 'Unknown';

      console.log('Creating item with data:', {
        title, description, category, location: locationString, type, userId: user.id
      });

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
          error: error.message,
          details: error.details || error.hint
        });
      }

      console.log('Item created successfully:', data);
      res.status(201).json(data);
    }

    else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Items API error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};
