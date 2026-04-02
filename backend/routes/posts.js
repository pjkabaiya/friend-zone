const express = require('express');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const { auth } = require('../middleware/auth');
const { handleServerError } = require('../utils/errors');
const { postCreateSchema, emojiSchema, validate, parsePagination } = require('../utils/validation');
const { addUniqueReaction } = require('../utils/reactions');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file) return cb(null, true);
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { limit, skip, page } = parsePagination(req.query);
    const posts = await Post.find()
      .populate('author', 'displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const serializedPosts = posts.map(post => ({
      ...post.toObject(),
      reactions: Object.fromEntries(post.reactions || new Map())
    }));
    res.json({ items: serializedPosts, page, limit });
  } catch (error) {
    handleServerError(res, 'posts.list', error);
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'displayName avatar');
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    const serialized = {
      ...post.toObject(),
      reactions: Object.fromEntries(post.reactions || new Map())
    };
    res.json(serialized);
  } catch (error) {
    handleServerError(res, 'posts.getById', error);
  }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const parsed = validate(postCreateSchema, req.body);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

    const { content } = parsed.data;

    const post = new Post({
      content,
      author: req.user._id,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      reactions: {}
    });

    await post.save();
    await post.populate('author', 'displayName avatar');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    handleServerError(res, 'posts.create', error);
  }
});

router.put('/:id/react', auth, async (req, res) => {
  try {
    const parsedEmoji = validate(emojiSchema, req.body);
    if (!parsedEmoji.ok) {
      return res.status(400).json({ error: 'Invalid emoji.' });
    }

    const { emoji } = parsedEmoji.data;

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const added = addUniqueReaction(post, req.user._id, emoji);
    if (!added) {
      return res.status(409).json({ error: 'You already reacted with this emoji.' });
    }

    await post.save();

    res.json({
      message: 'Reaction added',
      reactions: Object.fromEntries(post.reactions)
    });
  } catch (error) {
    handleServerError(res, 'posts.react', error);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this post.' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    handleServerError(res, 'posts.delete', error);
  }
});

module.exports = router;
