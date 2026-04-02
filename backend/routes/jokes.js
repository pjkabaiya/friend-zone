const express = require('express');
const InsideJoke = require('../models/InsideJoke');
const { auth } = require('../middleware/auth');
const { handleServerError } = require('../utils/errors');
const { jokeCreateSchema, emojiSchema, validate, parsePagination } = require('../utils/validation');
const { addUniqueReaction } = require('../utils/reactions');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { limit, skip, page } = parsePagination(req.query);
    const jokes = await InsideJoke.find()
      .populate('createdBy', 'displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({ items: jokes, page, limit });
  } catch (error) {
    handleServerError(res, 'jokes.list', error);
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const parsed = validate(jokeCreateSchema, req.body);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }

    const { text, context, tags } = parsed.data;

    const joke = new InsideJoke({
      text,
      context: context || '',
      tags: tags || [],
      createdBy: req.user._id
    });
    await joke.save();
    await joke.populate('createdBy', 'displayName avatar');
    res.status(201).json(joke);
  } catch (error) {
    handleServerError(res, 'jokes.create', error);
  }
});

router.put('/:id/react', auth, async (req, res) => {
  try {
    const parsedEmoji = validate(emojiSchema, req.body);
    if (!parsedEmoji.ok) {
      return res.status(400).json({ error: 'Invalid emoji.' });
    }

    const { emoji } = parsedEmoji.data;
    const joke = await InsideJoke.findById(req.params.id);
    if (!joke) {
      return res.status(404).json({ error: 'Joke not found.' });
    }
    const added = addUniqueReaction(joke, req.user._id, emoji);
    if (!added) {
      return res.status(409).json({ error: 'You already reacted with this emoji.' });
    }
    await joke.save();
    res.json({ reactions: Object.fromEntries(joke.reactions) });
  } catch (error) {
    handleServerError(res, 'jokes.react', error);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const joke = await InsideJoke.findById(req.params.id);
    if (!joke) {
      return res.status(404).json({ error: 'Joke not found.' });
    }
    if (joke.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    await InsideJoke.findByIdAndDelete(req.params.id);
    res.json({ message: 'Joke deleted successfully' });
  } catch (error) {
    handleServerError(res, 'jokes.delete', error);
  }
});

module.exports = router;
