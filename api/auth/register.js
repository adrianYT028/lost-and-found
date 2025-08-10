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
    console.log('Register request body:', body);
    
    const { firstName, lastName, email, password, studentId, course, year, phoneNumber } = body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('Users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Supabase
    const { data, error } = await supabase
      .from('Users')
      .insert([{
        firstName,
        lastName,
        email,
        password: hashedPassword,
        studentId,
        course,
        year: year ? parseInt(year) : null,
        phoneNumber,
        role: 'student',
        isVerified: true, // Auto-verify for now
        isActive: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Failed to create user' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = data;

    // Generate JWT token for auto-login after registration
    const token = jwt.sign(
      { id: data.id, email: data.email, role: data.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      data: {
        message: 'User registered successfully',
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
