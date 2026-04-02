const express = require('express');
const MoodEntry = require('../models/MoodEntry');
const { auth } = require('../middleware/auth');
const { handleServerError } = require('../utils/errors');
const { moodCreateSchema, validate, parsePagination } = require('../utils/validation');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const { limit, skip, page } = parsePagination(req.query);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    const entries = await MoodEntry.find({
      createdAt: { $gte: cutoffDate }
    })
      .populate('user', 'displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({ items: entries, page, limit });
  } catch (error) {
    handleServerError(res, 'mood.list', error);
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const parsed = validate(moodCreateSchema, req.body);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

    const { mood, moodLabel, note } = parsed.data;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let entry = await MoodEntry.findOne({
      user: req.user._id,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    if (entry) {
      entry.mood = mood;
      entry.moodLabel = moodLabel;
      entry.note = note || '';
    } else {
      entry = new MoodEntry({
        user: req.user._id,
        mood,
        moodLabel,
        note: note || ''
      });
    }

    await entry.save();
    await entry.populate('user', 'displayName avatar');
    res.status(201).json(entry);
  } catch (error) {
    handleServerError(res, 'mood.create', error);
  }
});

router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const entries = await MoodEntry.find({
      createdAt: { $gte: today, $lt: tomorrow }
    }).populate('user', 'displayName avatar');
    res.json(entries);
  } catch (error) {
    handleServerError(res, 'mood.today', error);
  }
});

module.exports = router;
