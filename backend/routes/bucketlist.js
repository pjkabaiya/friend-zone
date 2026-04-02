const express = require('express');
const BucketList = require('../models/BucketList');
const { auth } = require('../middleware/auth');
const { handleServerError } = require('../utils/errors');
const { bucketListCreateSchema, validate, parsePagination } = require('../utils/validation');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { completed } = req.query;
    const { limit, skip, page } = parsePagination(req.query);
    let query = {};
    if (completed !== undefined) {
      query.completed = completed === 'true';
    }
    const items = await BucketList.find(query)
      .populate('addedBy', 'displayName avatar')
      .populate('completedBy', 'displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({ items, page, limit });
  } catch (error) {
    handleServerError(res, 'bucketlist.list', error);
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const parsed = validate(bucketListCreateSchema, req.body);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

    const { title, description, category, priority } = parsed.data;
    const item = new BucketList({
      title,
      description: description || '',
      category: category || 'other',
      priority: priority || 'medium',
      addedBy: req.user._id
    });
    await item.save();
    await item.populate('addedBy', 'displayName avatar');
    res.status(201).json(item);
  } catch (error) {
    handleServerError(res, 'bucketlist.create', error);
  }
});

router.put('/:id/toggle', auth, async (req, res) => {
  try {
    const item = await BucketList.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }
    item.completed = !item.completed;
    if (item.completed) {
      item.completedBy = req.user._id;
      item.completedAt = new Date();
    } else {
      item.completedBy = null;
      item.completedAt = null;
    }
    await item.save();
    await item.populate('addedBy', 'displayName avatar');
    await item.populate('completedBy', 'displayName avatar');
    res.json(item);
  } catch (error) {
    handleServerError(res, 'bucketlist.toggle', error);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await BucketList.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    if (item.addedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this item.' });
    }

    await BucketList.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    handleServerError(res, 'bucketlist.delete', error);
  }
});

module.exports = router;
