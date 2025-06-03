import { getGame2048Stats } from './firebase';

/**
 * Kullanıcıya ait 2048 başarımlarını getirir
 * @param {string} userId
 * @returns {Promise<Array<{id:string,title:string,icon:string}>>}
 */
export async function getGame2048Achievements(userId) {
  const stats = await getGame2048Stats(userId);
  const achievements = [];
  if (stats.length >= 1) {
    achievements.push({ id: 'first_game', title: 'İlk Oyunu Oynadın!', icon: 'EmojiEvents', description: 'Oyunu ilk kez tamamladın' });
  }
  const maxScore = stats.length ? Math.max(...stats.map(s => s.score)) : 0;
  if (maxScore >= 2048) {
    achievements.push({ id: 'reach_2048', title: '2048 Taşına Ulaştın!', icon: 'Whatshot', description: '2048 taşına ulaştın' });
  }
  if (maxScore >= 4096) {
    achievements.push({ id: 'reach_4096', title: '4096 Taşına Ulaştın!', icon: 'EmojiEvents', description: '4096 taşına ulaştın' });
  }
  else if (maxScore >= 1000) {
    achievements.push({ id: 'score_1000', title: '1000 Puan Yaptın!', icon: 'Star' });
  }
  const totalGames = stats.length;
  if (totalGames >= 10) {
    achievements.push({ id: 'ten_games', title: '10 Oyun Tamamlandı', icon: 'Games', description: '10 oyun tamamladın' });
  }
  if (totalGames >= 20) {
    achievements.push({ id: 'twenty_games', title: '20 Oyun Tamamlandı', icon: 'Games', description: '20 oyun tamamladın' });
  }
  return achievements;
} 