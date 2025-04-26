// models/lobbyModel.js
const mongoose = require('mongoose');

const lobbySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['event', 'normal'], required: true },
  password: { type: String },
  salt: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Lobby', lobbySchema);