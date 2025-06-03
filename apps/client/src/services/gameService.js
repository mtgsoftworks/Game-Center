// src/services/gameService.js

import axios from './api';

// Oyun verileri için yedek statik veri (API çalışmadığında veya geliştirme aşamasında kullanılabilir)
const fallbackGames = [
  {
    id: '2048',
    name: '2048',
    description: 'Sayıları birleştirerek 2048 sayısına ulaşın.',
    imageUrl: 'https://via.placeholder.com/300x140?text=2048', // Örnek resim
    activeLobbies: 5, // Örnek veri
  },
  {
    id: 'tombala',
    name: 'Tombola',
    description: 'Çeşitli sayı kartlarıyla tombola oynayın.',
    imageUrl: 'https://via.placeholder.com/300x140?text=Tombola', // Örnek resim
    activeLobbies: 3, // Örnek veri
  },
];

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api'; // Axios zaten base URL'i biliyor

export async function getGames(filterParams = {}) {
  // filterParams örn: { popular: true, limit: 5 }
  // const queryParams = new URLSearchParams(filterParams).toString();
  // const url = `${API_URL}/games${queryParams ? '?' + queryParams : ''}`;

  try {
    // const response = await fetch(url);
    // if (!response.ok) {
    //   const errorData = await response.json().catch(() => ({ message: response.statusText }));
    //   throw new Error(`Oyunlar getirilemedi: ${errorData.message || response.statusText}`);
    // }
    // return await response.json();
    const response = await axios.get('/games', { params: filterParams });
    return response.data;
  } catch (error) {
    console.error("getGames error:", error.response ? error.response.data : error.message);
    // Hata durumunda fallbackGames dönebiliriz
    return fallbackGames;
  }
}

export async function getGameDetails(gameId) {
  try {
    // const response = await fetch(`${API_URL}/games/${gameId}`);
    // if (!response.ok) {
    //   const errorData = await response.json().catch(() => ({ message: response.statusText }));
    //   throw new Error(`Oyun detayları getirilemedi: ${errorData.message || response.statusText}`);
    // }
    // return await response.json();
    const response = await axios.get(`/games/${gameId}`);
    return response.data;
  } catch (error) {
    console.error("getGameDetails error:", error.response ? error.response.data : error.message);
    // Hata veya offline durumunda fallbackGames'den bul
    const fallback = fallbackGames.find(g => g.id === gameId);
    if (fallback) return fallback;
    throw new Error(`Oyun detayları getirilemedi: ${error.response?.data?.message || error.message}`);
  }
}

// Yeni oyun ekleme, güncelleme vb. diğer servisler buraya eklenebilir.