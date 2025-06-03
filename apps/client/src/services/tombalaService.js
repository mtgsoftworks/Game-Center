import api from './api';

/**
 * Tombala oyunu için istatistik gönder
 * @param {{ userId: string, score: number, cardsMatched?: number, duration?: number }} stats
 */
export async function postTombalaStats(stats) {
  const response = await api.post('/games/tombala/stats', stats);
  return response.data;
}

/**
 * Tombala oyunu istatistiklerini getir
 * @param {string} userId
 */
export async function getTombalaStats(userId) {
  const response = await api.get('/games/tombala/stats', { params: { userId } });
  return response.data;
}

/**
 * Tombala liderlik tablosunu getir
 * @returns {Promise<Array<{ userId: string, name: string, score: number }>>}
 */
export async function getTombalaLeaderboard() {
  const response = await api.get('/games/tombala/leaderboard');
  return response.data;
} 