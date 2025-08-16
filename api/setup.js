const express = require('express');
const bcrypt = require('bcryptjs');
const { supabase } = require('./lib/supabase');
const router = express.Router();
// Simple ping endpoint to confirm setup.js is loaded
router.get('/ping', (req, res) => {
  res.json({ message: 'Setup API is loaded' });
});
// Debug endpoint to print admin user's hashed password
router.get('/admin-password-hash', async (req, res) => {
  try {
    const { data: admin, error } = await supabase
      .from('Users')
      .select('id, email, password')
      .eq('email', 'admin@college.edu')
      .single();
    if (error) {
      console.error('[ADMIN HASH] DB error:', error);
      return res.status(200).json({ found: false, error: error.message, admin: null });
    }
    if (!admin) {
      console.warn('[ADMIN HASH] No admin user found');
      return res.status(200).json({ found: false, error: 'Not found', admin: null });
    }
    res.status(200).json({ found: true, id: admin.id, email: admin.email, passwordHash: admin.password });
  } catch (error) {
    console.error('[ADMIN HASH] Exception:', error);
    res.status(200).json({ found: false, error: error.message, admin: null });
  }
});
// GET endpoint to reset admin password for browser access
router.get('/reset-admin-password', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const { data, error } = await supabase
      .from('Users')
      .update({ password: hashedPassword })
      .eq('email', 'admin@college.edu')
      .select();
    if (error) {
      return res.status(500).json({ message: 'Failed to reset password', error: error.message });
    }
    res.json({ message: 'Admin password reset to admin123', data });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});
// Reset admin password endpoint
router.post('/reset-admin-password', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const { data, error } = await supabase
      .from('Users')
      .update({ password: hashedPassword })
      .eq('email', 'admin@college.edu')
      .select();
    if (error) {
      return res.status(500).json({ message: 'Failed to reset password', error: error.message });
    }
    res.json({ message: 'Admin password reset to admin123', data });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Simple test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Setup API is working!',
    timestamp: new Date().toISOString()
  });
});

// Database connectivity test
router.get('/db-test', async (req, res) => {
  try {
    console.log('Testing database connectivity...');
    
    // Simple test query
    const { data, error } = await supabase
      .from('Users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database test error:', error);
      return res.status(500).json({
        message: 'Database connection failed',
        error: error.message,
        code: error.code
      });
    }
    
    res.json({
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      testResult: 'OK'
    });
    
  } catch (error) {
    console.error('Database test exception:', error);
    res.status(500).json({
      message: 'Database test failed',
      error: error.message
    });
  }
});

// Quick admin creation endpoint
router.get('/create-admin', async (req, res) => {
  try {
    console.log('Quick admin creation attempt...');
    
    // First test basic connectivity
    const { data: testData, error: testError } = await supabase
      .from('Users')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('Database connectivity test failed:', testError);
      return res.status(500).json({
        message: 'Database connection failed',
        error: testError.message
      });
    }
    
    console.log('Database connectivity OK, creating admin...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Try to insert admin user
    const { data: newAdmin, error: insertError } = await supabase
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
    
    if (insertError) {
      console.error('Admin creation error:', insertError);
      if (insertError.code === '23505') { // Unique constraint violation
        return res.json({
          message: 'Admin user already exists',
          exists: true
        });
      }
      return res.status(500).json({
        message: 'Failed to create admin user',
        error: insertError.message,
        code: insertError.code
      });
    }
    
    console.log('Admin user created successfully');
    res.json({
      message: 'Admin user created successfully',
      created: true,
      user: {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });
    
  } catch (error) {
    console.error('Quick admin creation error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});
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
