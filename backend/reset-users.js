const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable.');
}

if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  throw new Error('Missing ADMIN_PASSWORD environment variable (min 8 chars).');
}

async function resetUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = require('./models/User');
    
    // Delete all users
    const result = await User.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users`);

    // Create a new admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    const adminUser = new User({
      username: 'admin',
      email: '',
      password: hashedPassword,
      displayName: 'Admin',
      insideJoke: '',
      role: 'admin',
      isActive: true
    });
    
    await adminUser.save();
    console.log('Created admin user:');
    console.log('  Username: admin');
    console.log('  Password: [from ADMIN_PASSWORD env]');

    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetUsers();
