/**
 * src/hooks/useGame.ts: Tombala oyunu için özel React hook'u.
 * Bu hook oyun odasını dinler ve şu görevleri yerine getirir:
 * 1. Oyun durumunu (başlangıç, geri sayım, oynama, bitiş) takip eder.
 * 2. 5x5 boyutunda benzersiz numaralardan oluşan Tombala kartı oluşturur.
 * 3. Çekilen numaralara göre kart üzerindeki işaretleri eşitler.
 * 4. Oyuncunun "Hazırım" durumunu ve mesaj gönderimini Firebase'e kaydeder.
 *
 * @returns {{
 *   gameState: Oyun detayları (status, drawnNumbers, players vb.),
 *   playerBoard: Oluşturulmuş kart matrisi,
 *   marks: Kart üzerindeki işaretlenmiş hücreler matrisi,
 *   message: Mesaj yazma alanının durumu,
 *   setMessage: Mesaj güncelleme fonksiyonu,
 *   countdown: Geri sayım sayacı,
 *   handleNumberMark: Numara işaretleme fonksiyonu,
 *   handleReadyClick: Hazırım buton fonksiyonu,
 *   handleSendMessage: Mesaj gönderme fonksiyonu
 * }}
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { GameState } from '../types/GameTypes';
import { generateBingoCardNumbers } from '../utils/gameUtils';

// BOARD_SIZE: Tombala kartının boyutu (5x5)
const BOARD_SIZE = 5;
// COUNTDOWN_DURATION: oyun başlangıcındaki geri sayım süresi (saniye)
const COUNTDOWN_DURATION = 3;
// MAX_NUMBER: Tombala kartındaki maksimum numara
const MAX_NUMBER = 90;

// useGame: Tombala oyunu için özel React hook'u
export function useGame() {
  const { roomId } = useParams<{ roomId: string }>();
  const { currentUser } = useAuth();

  // gameState: oyun durumunu takip eden state
  const [gameState, setGameState] = useState<GameState | null>(null);
  // playerBoard: her oyuncu için oluşturulan 5x5 tombala kartı matrisi
  const [playerBoard, setPlayerBoard] = useState<number[][] | null>(null);
  // marks: kart üzerindeki işaretlenmiş hücrelerin boolean matrisi
  const [marks, setMarks] = useState<boolean[][]>(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false))
  );
  // message: sohbet mesajı giriş alanı değeri
  const [message, setMessage] = useState('');
  // countdown: oyun başlangıcında geriye sayım için kalan süre
  const [countdown, setCountdown] = useState<number | null>(null);

  // useEffect: roomId veya currentUser değiştiğinde tetiklenir, oyun verisini dinler ve kartı initialize eder
  useEffect(() => {
    if (!roomId || !currentUser) return;
    const gameRef = ref(database, `games/${roomId}`);

    // Oyuncu kartı sadece bir kez oluşturulur
    if (!playerBoard) {
      const flatNumbers = generateBingoCardNumbers(BOARD_SIZE * BOARD_SIZE, 1, MAX_NUMBER);
      const newBoard = Array.from({ length: BOARD_SIZE }, (_, i) =>
        flatNumbers.slice(i * BOARD_SIZE, i * BOARD_SIZE + BOARD_SIZE)
      );
      setPlayerBoard(newBoard);
    }

    const unsubscribe = onValue(gameRef, snapshot => {
      const data = snapshot.val();
      if (!data) return;
      setGameState(data as GameState);

      // Firebase'den işaretleri güncelle
      const fbMarks = data.players?.[currentUser.uid]?.marks;
      if (fbMarks) setMarks(fbMarks);

      // Geri sayım durumunu yönet
      if (data.status === 'countdown' && countdown === null) {
        let count = COUNTDOWN_DURATION;
        setCountdown(count);
        const interval = setInterval(() => {
          count--;
          setCountdown(count);
          if (count <= 0) clearInterval(interval);
        }, 1000);
        return () => clearInterval(interval);
      }
    });

    return () => unsubscribe();
  }, [roomId, currentUser, playerBoard, countdown]);

  // Firebase onValue ile gerçek zamanlı güncelleme: oyun durumu ve oyuncu işaretleri dinleniyor
  // Geri sayım başladığında saniye bazlı sayaç işlemi başlatan bölüm
  // handleNumberMark: Kullanıcı tablo hücresine tıkladığında numarayı işaretler, state ve Firebase güncellemesi yapar
  const handleNumberMark = useCallback((row: number, col: number) => {
    if (!playerBoard || !gameState || gameState.status !== 'playing') return;
    const num = playerBoard[row][col];
    if (!gameState.drawnNumbers.includes(num)) return;
    const updatedMarks = marks.map(arr => [...arr]);
    updatedMarks[row][col] = !updatedMarks[row][col];
    setMarks(updatedMarks);
    // Firebase'e işaretleri kaydet
    const gameRef = ref(database, `games/${roomId}/players/${currentUser?.uid}/marks`);
    update(gameRef, updatedMarks);
  }, [playerBoard, gameState, marks, roomId, currentUser]);

  // handleReadyClick: Kullanıcı hazır olduğunu Firebase'e bildirir
  const handleReadyClick = useCallback(() => {
    if (!roomId || !currentUser) return;
    const playerRef = ref(database, `games/${roomId}/players/${currentUser.uid}`);
    update(playerRef, { ready: true });
  }, [roomId, currentUser]);

  // handleSendMessage: Kullanıcı mesajını Firebase'e gönderir ve input alanını temizler
  const handleSendMessage = useCallback(() => {
    if (!roomId || !currentUser || !message.trim()) return;
    const msgRef = ref(database, `games/${roomId}/messages`);
    const newMsg = {
      id: Date.now().toString(),
      userId: currentUser.uid,
      userName: currentUser.displayName || 'Anonim',
      text: message.trim(),
      timestamp: Date.now(),
    };
    update(msgRef, { [newMsg.id]: newMsg });
    setMessage('');
  }, [roomId, currentUser, message]);

  // Hook tarafından sağlanan değerler ve kontrol fonksiyonları
  return {
    gameState,
    playerBoard,
    marks,
    message,
    setMessage,
    countdown,
    handleNumberMark,
    handleReadyClick,
    handleSendMessage,
  };
}
