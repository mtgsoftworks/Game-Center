// models/chatMessageModel.js
const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  lobby: { type: mongoose.Schema.Types.ObjectId, ref: 'Lobby', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
