const express = require('express');
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');
const { handleServerError } = require('../utils/errors');
const { eventCreateSchema, eventUpdateSchema, validate, parsePagination } = require('../utils/validation');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { limit, skip, page } = parsePagination(req.query);
    const events = await Event.find()
      .populate('createdBy', 'displayName')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);
    res.json({ items: events, page, limit });
  } catch (error) {
    handleServerError(res, 'events.list', error);
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'displayName');
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    res.json(event);
  } catch (error) {
    handleServerError(res, 'events.getById', error);
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const parsed = validate(eventCreateSchema, req.body);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

    const { title, date, type, location, description } = parsed.data;

    const event = new Event({
      title,
      date,
      type,
      location: location || '',
      description: description || '',
      createdBy: req.user._id
    });

    await event.save();

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    handleServerError(res, 'events.create', error);
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const parsed = validate(eventUpdateSchema, req.body);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

    const { title, date, type, location, description } = parsed.data;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (event.createdBy?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this event.' });
    }

    if (title) event.title = title;
    if (date) event.date = date;
    if (type) event.type = type;
    if (location !== undefined) event.location = location;
    if (description !== undefined) event.description = description;

    await event.save();

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    handleServerError(res, 'events.update', error);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (event.createdBy?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this event.' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    handleServerError(res, 'events.delete', error);
  }
});

module.exports = router;
