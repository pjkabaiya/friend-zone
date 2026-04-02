const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: {
    type: String,
    enum: ['😄', '😊', '😐', '😔', '😤', '🤩', '😴', '🥳'],
    required: true
  },
  moodLabel: {
    type: String,
    enum: ['Amazing', 'Good', 'Okay', 'Down', 'Frustrated', 'Excited', 'Tired', 'Celebrating'],
    required: true
  },
  note: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MoodEntry', moodEntrySchema);
