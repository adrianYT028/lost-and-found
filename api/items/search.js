const jwt = require('jsonwebtoken');
const { supabase } = require('../../lib/supabase');

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

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Parse request body
    const body = await parseBody(req);
    const { query, category, type, location, dateRange } = body;
    
    console.log('Search request:', body);

    // Build the query
    let dbQuery = supabase
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
      .eq('status', 'open');

    // Add search filters
    if (query && query.trim()) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (category && category !== 'all') {
      dbQuery = dbQuery.eq('category', category);
    }

    if (type && type !== 'all') {
      dbQuery = dbQuery.eq('type', type);
    }

    if (location && location.trim()) {
      dbQuery = dbQuery.ilike('location', `%${location}%`);
    }

    // Add date range filter if provided
    if (dateRange && dateRange.start) {
      dbQuery = dbQuery.gte('createdAt', dateRange.start);
    }
    if (dateRange && dateRange.end) {
      dbQuery = dbQuery.lte('createdAt', dateRange.end);
    }

    // Order and limit results
    dbQuery = dbQuery
      .order('createdAt', { ascending: false })
      .limit(50);

    const { data, error } = await dbQuery;

    if (error) {
      console.error('Error searching items:', error);
      return res.status(500).json({ message: 'Failed to search items' });
    }

    console.log(`Search found ${data.length} items`);
    res.status(200).json(data);

  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};
