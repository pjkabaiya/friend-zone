require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function wipeAllUsers() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('Missing MONGODB_URI environment variable');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4
    });

    console.log('Connected to MongoDB');

    const result = await User.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} users from database`);

    const remaining = await User.countDocuments();
    console.log(`\n📊 Users remaining: ${remaining}`);
    console.log('\n✨ Fresh slate ready! First account created will be admin.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

wipeAllUsers();
