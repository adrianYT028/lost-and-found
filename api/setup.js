const express = require('express');
const bcrypt = require('bcryptjs');
const { supabase } = require('./lib/supabase');
const router = express.Router();

// Simple test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Setup API is working!',
    timestamp: new Date().toISOString()
  });
});

// GET /api/setup/admin - Create admin user via GET request (for browser access)
router.get('/admin', async (req, res) => {
  try {
    console.log('Setting up admin user via GET...');

    // Check if admin user already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('Users')
      .select('id')
      .eq('email', 'admin@college.edu')
      .single();

    if (existingAdmin) {
      return res.json({ message: 'Admin user already exists', exists: true });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const { data: newAdmin, error } = await supabase
      .from('Users')
      .insert([{
        email: 'admin@college.edu',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isVerified: true,
        isActive: true,
        studentId: 'ADMIN001'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating admin user:', error);
      return res.status(500).json({ 
        message: 'Failed to create admin user', 
        error: error.message 
      });
    }

    console.log('Admin user created successfully:', newAdmin.email);
    res.status(201).json({
      message: 'Admin user created successfully',
      created: true,
      user: {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });

  } catch (error) {
    console.error('Setup admin error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
});

// POST /api/setup/admin - Create admin user if it doesn't exist
router.post('/admin', async (req, res) => {
  try {
    console.log('Setting up admin user...');

    // Check if admin user already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('Users')
      .select('id')
      .eq('email', 'admin@college.edu')
      .single();

    if (existingAdmin) {
      return res.json({ message: 'Admin user already exists', exists: true });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const { data: newAdmin, error } = await supabase
      .from('Users')
      .insert([{
        email: 'admin@college.edu',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isVerified: true,
        isActive: true,
        studentId: 'ADMIN001'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating admin user:', error);
      return res.status(500).json({ 
        message: 'Failed to create admin user', 
        error: error.message 
      });
    }

    console.log('Admin user created successfully:', newAdmin.email);
    res.status(201).json({
      message: 'Admin user created successfully',
      created: true,
      user: {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });

  } catch (error) {
    console.error('Setup admin error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
});

// GET /api/setup/check - Check if admin user exists
router.get('/check', async (req, res) => {
  try {
    const { data: admin, error } = await supabase
      .from('Users')
      .select('id, email, role')
      .eq('email', 'admin@college.edu')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking admin user:', error);
      return res.status(500).json({ message: 'Database error' });
    }

    res.json({
      adminExists: !!admin,
      admin: admin ? { id: admin.id, email: admin.email, role: admin.role } : null
    });

  } catch (error) {
    console.error('Setup check error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
});

module.exports = router;
