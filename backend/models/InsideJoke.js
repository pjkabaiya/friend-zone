const mongoose = require('mongoose');

const insideJokeSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  context: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String
  }],
  reactions: {
    type: Map,
    of: Number,
    default: {}
  },
  reactedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('InsideJoke', insideJokeSchema);
