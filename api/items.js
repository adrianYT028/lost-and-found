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
      const { title, description, category, location, type, images } = req.body;

      if (!title || !description || !type) {
        return res.status(400).json({ message: 'Required fields are missing' });
      }

      // For now, create without userId (you'll need to implement auth middleware)
      const { data, error } = await supabase
        .from('Items')
        .insert([{
          title,
          description,
          category,
          location,
          type,
          images: images || [],
          status: 'open'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating item:', error);
        return res.status(500).json({ message: 'Failed to create item' });
      }

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
