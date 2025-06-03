import { rtdb } from '../firebase';
import { ref, onValue } from 'firebase/database';

/**
 * Gerçek zamanlı liderlik tablosuna abonelik
 * @param {'tombala'|'2048'} game
 * @param {(data: any[]) => void} callback
 * @returns {() => void} unsubscribe fonksiyonu
 */
export function subscribeLeaderboard(game, callback) {
  const path = `leaderboards/${game === 'tombala' ? 'tombala' : '2048'}`;
  const leaderRef = ref(rtdb, path);
  const unsubscribe = onValue(leaderRef, snapshot => {
    const val = snapshot.val();
    callback(val ? val : []);
  });
  return () => leaderRef.off ? leaderRef.off() : unsubscribe();
} 