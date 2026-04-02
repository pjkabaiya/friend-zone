require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function cleanupUsers() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('Missing MONGODB_URI environment variable');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Find all non-admin users
    const nonAdminUsers = await User.find({ role: { $ne: 'admin' } });
    console.log(`Found ${nonAdminUsers.length} non-admin users to delete`);

    if (nonAdminUsers.length > 0) {
      const result = await User.deleteMany({ role: { $ne: 'admin' } });
      console.log(`Deleted ${result.deletedCount} non-admin users`);
    }

    // Verify only admin remains
    const remainingUsers = await User.find({});
    console.log(`\nRemaining users: ${remainingUsers.length}`);
    remainingUsers.forEach(user => {
      console.log(`  - ${user.username} (${user.role})`);
    });

    console.log('\nCleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

cleanupUsers();
