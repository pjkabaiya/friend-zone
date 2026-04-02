const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, JWT_SECRET } = require('../middleware/auth');
const { handleServerError } = require('../utils/errors');
const { registerSchema, loginSchema, validate } = require('../utils/validation');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const parsed = validate(registerSchema, req.body);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

    const { username, password, displayName } = parsed.data;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const isFirstUser = (await User.countDocuments()) === 0;
    
    const user = new User({
      username,
      email: '',
      password: hashedPassword,
      displayName: displayName || username,
      insideJoke: '',
      role: isFirstUser ? 'admin' : 'member'
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: isFirstUser ? 'Welcome! You are the first user and have been made admin.' : 'Account created successfully!',
      token,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    handleServerError(res, 'auth.register', error);
  }
});

router.post('/login', async (req, res) => {
  try {
    const parsed = validate(loginSchema, req.body);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

    const { username, password } = parsed.data;

    const user = await User.findOne({ username });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        insideJoke: user.insideJoke
      }
    });
  } catch (error) {
    handleServerError(res, 'auth.login', error);
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    handleServerError(res, 'auth.me', error);
  }
});

router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
