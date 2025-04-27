// src/services/gameService.js

import axios from './axiosInstance';

// Oyun verileri için yedek statik veri
const fallbackGames = [
  {
    id: '2048',
    name: '2048',
    description: 'Sayıları birleştirerek 2048 sayısına ulaşın.',
  },
  {
    id: 'bingo',
    name: 'Tombola',
    description: 'Çeşitli sayı kartlarıyla tombola oynayın.',
  },
];

export const getGames = async () => {
  try {
    const { data } = await axios.get('/games');
    if (!data || data.length === 0) {
      console.warn('API returned no games, using fallbackGames');
      return fallbackGames;
    }
    return data;
  } catch (error) {
    console.error('API çağrısı başarısız oldu, statik oyun verileri kullanılıyor:', error);
    return fallbackGames;
  }
};

// Oyun detaylarını almak için fonksiyon
export const getGameDetails = async (gameId) => {
  try {
    const response = await axios.get(`/games/${gameId}`);
    return response.data;
  } catch (error) {
    console.error(`API çağrısı başarısız oldu, statik oyun verileri kullanılıyor:`, error);
    const game = fallbackGames.find((g) => g.id === gameId);
    if (game) {
      return game;
    }
    throw new Error('Oyun bulunamadı');
  }
};