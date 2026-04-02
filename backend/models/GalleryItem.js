const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    default: ''
  },
  caption: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['beach', 'cabin', 'city', 'meme', 'random', 'other'],
    default: 'other'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rotation: {
    type: Number,
    default: 0
  },
  reactions: {
    type: Map,
    of: Number,
    default: () => new Map()
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

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
