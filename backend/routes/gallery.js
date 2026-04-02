const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const GalleryItem = require('../models/GalleryItem');
const { auth } = require('../middleware/auth');
const { handleServerError } = require('../utils/errors');
const {
  galleryCreateSchema,
  galleryUpdateSchema,
  emojiSchema,
  validate,
  parsePagination
} = require('../utils/validation');
const { addUniqueReaction } = require('../utils/reactions');

const router = express.Router();

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { category } = req.query;
    const { limit, skip, page } = parsePagination(req.query);
    const query = category ? { category } : {};
    const items = await GalleryItem.find(query)
      .populate('uploadedBy', 'displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const serializedItems = items.map(item => ({
      ...item.toObject(),
      reactions: Object.fromEntries(item.reactions || new Map())
    }));
    res.json({ items: serializedItems, page, limit });
  } catch (error) {
    handleServerError(res, 'gallery.list', error);
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id).populate('uploadedBy', 'displayName');
    if (!item) {
      return res.status(404).json({ error: 'Image not found.' });
    }
    res.json(item);
  } catch (error) {
    handleServerError(res, 'gallery.getById', error);
  }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const parsed = validate(galleryCreateSchema, req.body);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

    const { caption, category, rotation } = parsed.data;

    if (!req.file) {
      return res.status(400).json({ error: 'Please select an image to upload.' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const item = new GalleryItem({
      imageUrl,
      caption: caption || '',
      category: category || 'other',
      rotation: rotation || 0,
      uploadedBy: req.user._id
    });

    await item.save();

    res.status(201).json({
      message: 'Image uploaded successfully',
      item
    });
  } catch (error) {
    handleServerError(res, 'gallery.create', error);
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const parsed = validate(galleryUpdateSchema, req.body);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

    const { caption, category } = parsed.data;

    const item = await GalleryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Image not found.' });
    }

    if (item.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this image.' });
    }

    if (caption !== undefined) item.caption = caption;
    if (category !== undefined) item.category = category;

    await item.save();

    res.json({
      message: 'Image updated successfully',
      item
    });
  } catch (error) {
    handleServerError(res, 'gallery.update', error);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Image not found.' });
    }
    if (item.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this image.' });
    }
    await GalleryItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    handleServerError(res, 'gallery.delete', error);
  }
});

router.put('/:id/react', auth, async (req, res) => {
  try {
    const parsedEmoji = validate(emojiSchema, { emoji: req.body.emoji });
    if (!parsedEmoji.ok) {
      return res.status(400).json({ error: 'Invalid emoji.' });
    }

    const { emoji } = parsedEmoji.data;

    const item = await GalleryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Image not found.' });
    }

    const added = addUniqueReaction(item, req.user._id, emoji);
    if (!added) {
      return res.status(409).json({ error: 'You already reacted with this emoji.' });
    }

    await item.save();

    res.json({
      message: 'Reaction added',
      reactions: Object.fromEntries(item.reactions)
    });
  } catch (error) {
    handleServerError(res, 'gallery.react', error);
  }
});

module.exports = router;
