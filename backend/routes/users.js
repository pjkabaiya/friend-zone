const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');
const { handleServerError } = require('../utils/errors');
const {
  userCreateSchema,
  userUpdateSchema,
  profileUpdateSchema,
  validate,
  parsePagination
} = require('../utils/validation');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { limit, skip, page } = parsePagination(req.query);
    const users = await User.find({ isActive: true })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({ items: users, page, limit });
  } catch (error) {
    handleServerError(res, 'users.list', error);
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const parsed = validate(profileUpdateSchema, req.body);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

    const { displayName, bio, insideJoke } = parsed.data;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (displayName) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (insideJoke !== undefined) user.insideJoke = insideJoke;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
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
    handleServerError(res, 'users.updateProfile', error);
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    handleServerError(res, 'users.getById', error);
  }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const parsed = validate(userCreateSchema, req.body);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

    const { username, password, displayName, insideJoke, role } = parsed.data;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email: '',
      password: hashedPassword,
      displayName,
      insideJoke: insideJoke || '',
      role: role || 'member'
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        insideJoke: user.insideJoke
      }
    });
  } catch (error) {
    handleServerError(res, 'users.create', error);
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const parsed = validate(userUpdateSchema, req.body);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

    const { displayName, bio, insideJoke, role, avatar, password } = parsed.data;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (displayName) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (insideJoke !== undefined) user.insideJoke = insideJoke;
    if (role !== undefined) user.role = role;
    if (avatar !== undefined) user.avatar = avatar;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    res.json({
      message: 'User updated successfully',
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
    handleServerError(res, 'users.updateAdmin', error);
  }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    handleServerError(res, 'users.delete', error);
  }
});

module.exports = router;
