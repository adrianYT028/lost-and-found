const bcrypt = require('bcryptjs');
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
    // Parse request body manually
    const body = await parseBody(req);
    console.log('Login request body:', body);
    
    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user in Supabase
    const { data: users, error } = await supabase
      .from('Users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !users) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, users.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: users.id, email: users.email, role: users.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = users;

    res.status(200).json({
      data: {
        user: userWithoutPassword,
        token,
        emailVerificationRequired: false
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
