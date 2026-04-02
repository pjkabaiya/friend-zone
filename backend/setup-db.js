require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const GalleryItem = require('./models/GalleryItem');
const Event = require('./models/Event');
const Post = require('./models/Post');

const MONGODB_URI = process.env.MONGODB_URI;
const DEFAULT_SEED_PASSWORD = process.env.DEFAULT_SEED_PASSWORD;

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable.');
}

if (!DEFAULT_SEED_PASSWORD || DEFAULT_SEED_PASSWORD.length < 8) {
  throw new Error('Set DEFAULT_SEED_PASSWORD with at least 8 characters before running setup.');
}

const users = [
  {
    username: 'FREDDI',
    email: 'freddi@friendzone.com',
    displayName: 'Freddi',
    bio: 'Adventure seeker and photo enthusiast.',
    insideJoke: 'Always has the best playlist',
    role: 'member'
  },
  {
    username: 'KANGETHE',
    email: 'kangethe@friendzone.com',
    displayName: 'Kang\'ethe',
    bio: 'Always ready for the next adventure.',
    insideJoke: 'The photographer',
    role: 'member'
  },
  {
    username: 'MUNANIA',
    email: 'munania@friendzone.com',
    displayName: 'Munania',
    bio: 'Admin and group organizer. Making sure everyone shows up on time.',
    insideJoke: 'The one who plans everything',
    role: 'admin'
  },
  {
    username: 'LAURA',
    email: 'laura@friendzone.com',
    displayName: 'Laura',
    bio: 'Coffee addict and meme queen.',
    insideJoke: 'Professional napper',
    role: 'member'
  },
  {
    username: 'WAIRIMU',
    email: 'wairimu@friendzone.com',
    displayName: 'Wairimu',
    bio: 'Foodie and the voice of reason.',
    insideJoke: 'Always right about restaurants',
    role: 'member'
  },
  {
    username: 'MANYATTA',
    email: 'manyatta@friendzone.com',
    displayName: 'Manyatta',
    bio: 'The comedian of the group. Never serious.',
    insideJoke: 'Can\'t stop making puns',
    role: 'member'
  },
  {
    username: 'JUNIORS',
    email: 'juniors@friendzone.com',
    displayName: 'Juniors',
    bio: 'The newest member. Learning the ways.',
    insideJoke: 'Still catching up on all jokes',
    role: 'member'
  }
];

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4
});
    console.log('✅ Connected to MongoDB Atlas\n');

    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await GalleryItem.deleteMany({});
    await Event.deleteMany({});
    await Post.deleteMany({});
    console.log('✅ Database cleared\n');

    console.log('👥 Creating users...\n');
    const createdUsers = [];

    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(DEFAULT_SEED_PASSWORD, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      createdUsers.push(user);
      console.log(`   ✅ ${user.displayName} (${user.role})`);
    }

    console.log('\n📅 Creating sample events...');
    const events = [
      {
        title: 'Munania\'s Birthday',
        date: new Date('2026-04-15'),
        type: 'birthday',
        location: 'Taj Restaurant',
        description: 'Big celebration!',
        createdBy: createdUsers[1]._id
      },
      {
        title: 'Annual Beach Trip',
        date: new Date('2026-07-20'),
        type: 'reunion',
        location: 'Diani Beach',
        description: 'Our yearly tradition!',
        createdBy: createdUsers[1]._id
      },
      {
        title: 'Freddi\'s Birthday',
        date: new Date('2026-08-10'),
        type: 'birthday',
        location: 'Spur Restaurant',
        description: '',
        createdBy: createdUsers[1]._id
      }
    ];

    await Event.insertMany(events);
    console.log('✅ Sample events created\n');

    console.log('📝 Creating sample post...');
    const post = new Post({
      content: 'Welcome to our Friend Zone! 🎉\n\nThis is our private space to share memories, plan events, and keep our inside jokes alive.\n\nCan\'t wait to fill this with amazing memories!',
      author: createdUsers[1]._id,
      reactions: { '❤️': 5, '😂': 3, '🔥': 2 }
    });
    await post.save();
    console.log('✅ Sample post created\n');

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                      📋 USER CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('   (Store these securely - Munania is the admin)\n');

    for (const user of users) {
      console.log(`   ┌────────────────────────────────────────────────────────`);
      console.log(`   │  Name:     ${user.displayName.padEnd(20)}`);
      console.log(`   │  Username: ${user.username.padEnd(20)}`);
      console.log(`   │  Password: ${'[from DEFAULT_SEED_PASSWORD]'.padEnd(20)}`);
      console.log(`   │  Role:     ${user.role.padEnd(20)}`);
      console.log(`   └────────────────────────────────────────────────────────`);
      console.log();
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ Database setup complete!');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('Run "npm start" to start the server\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
