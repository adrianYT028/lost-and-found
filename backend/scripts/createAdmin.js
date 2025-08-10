const bcrypt = require('bcryptjs');
const { User } = require('../models');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@college.edu',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      contactNumber: '1234567890'
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@college.edu');
    console.log('Password: admin123');
    console.log('Role: admin');
    console.log('\n⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdminUser();
