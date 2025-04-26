// controllers/gameController.js
const Game = require('../models/gameModel');

exports.getGames = async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (error) {
    console.error('Oyunları getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

// Oyun Oluşturma (Eğer yetki varsa)
// exports.createGame = async (req, res) => {
//   // Oyun oluşturma işlemleri
// };