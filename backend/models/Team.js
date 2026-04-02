const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  logo: {
    type: String,
    default: ''
  },
  played: {
    type: Number,
    default: 0
  },
  won: {
    type: Number,
    default: 0
  },
  drawn: {
    type: Number,
    default: 0
  },
  lost: {
    type: Number,
    default: 0
  },
  goalsFor: {
    type: Number,
    default: 0
  },
  goalsAgainst: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

teamSchema.methods.calculateStats = function() {
  this.points = (this.won * 3) + this.drawn;
  this.played = this.won + this.drawn + this.lost;
};

module.exports = mongoose.model('Team', teamSchema);
