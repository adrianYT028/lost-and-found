const bcrypt = require('bcryptjs');
const { supabase } = require('../lib/supabase');

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
    const { firstName, lastName, email, password, studentId, course, year, phoneNumber } = req.body;

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

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
