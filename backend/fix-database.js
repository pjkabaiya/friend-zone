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

async function fixIndexes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Drop the unique index on email
    try {
      await db.collection('users').dropIndex('email_1');
      console.log('Dropped unique index on email');
    } catch (e) {
      console.log('No unique index on email found or already dropped');
    }

    // Create a regular index (non-unique) on email
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: false, sparse: true });
      console.log('Created non-unique index on email');
    } catch (e) {
      console.log('Index already exists or error:', e.message);
    }

    // Delete all existing users and create fresh admin
    const User = require('./models/User');
    await User.deleteMany({});
    console.log('Deleted all users');

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
    console.log('Done! Database is fixed.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixIndexes();
