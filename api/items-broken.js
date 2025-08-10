const { supabase } = require('./lib/supabase');

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
      // Create new item
      console.log('POST request received');
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Request body type:', typeof req.body);
      console.log('Request body:', req.body);
      
      // Handle different content types
      let itemData = {};
      
      // Check if it's FormData (multipart/form-data)
      if (req.headers['content-type']?.includes('multipart/form-data')) {
        // For FormData, Vercel automatically parses it into req.body
        itemData = req.body;
      } else {
        // For JSON data
        itemData = req.body;
      }
      
      const { title, description, category, location, type, contactInfo, dateTime, reward } = itemData;
      
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
            allFields: Object.keys(itemData)
          }
        });
      }

      // Extract location string from object or use as-is
      const locationString = parsedLocation?.building || location || 'Unknown';

      console.log('Creating item with data:', {
        title, description, category, location: locationString, type
      });

      // Create the item in database
      const { data, error } = await supabase
        .from('Items')
        .insert([{
          title,
          description,
          category,
          location: locationString,
          type,
          images: [],
          status: 'open'
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
        return res.status(400).json({ 
          message: 'Required fields are missing: title, description, type',
          received: { title: !!title, description: !!description, type: !!type }
        });
      }

      // Extract location string from object or use as-is
      const locationString = parsedLocation?.building || location || 'Unknown';

      console.log('Creating item with data:', {
        title, description, category, location: locationString, type
      });

      // Create the item in database
      const { data, error } = await supabase
        .from('Items')
        .insert([{
          title,
          description,
          category,
          location: locationString,
          type,
          images: [],
          status: 'open'
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
      res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Items API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
