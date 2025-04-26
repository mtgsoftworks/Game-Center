import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue, update, get } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { GameState, Player } from '../types/GameTypes';
import { generateBingoCardNumbers } from '../utils/gameUtils';

const BOARD_SIZE = 5;
const COUNTDOWN_DURATION = 3;
const REQUIRED_PLAYERS = 2;
const MAX_NUMBER = 90;

export function useGame() {
  const { roomId } = useParams<{ roomId: string }>();
  const { currentUser } = useAuth();

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerBoard, setPlayerBoard] = useState<number[][] | null>(null);
  const [marks, setMarks] = useState<boolean[][]>(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false))
  );
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);

  // Initialize and listen to game state
  useEffect(() => {
    if (!roomId || !currentUser) return;
    const gameRef = ref(database, `games/${roomId}`);

    // generate board once
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

      // update marks
      const fbMarks = data.players?.[currentUser.uid]?.marks;
      if (fbMarks) setMarks(fbMarks);

      // handle countdown
      if (data.status === 'countdown' && countdown === null) {
        let count = COUNTDOWN_DURATION;
        setCountdown(count);
        const interval = setInterval(() => {
          count--;
          if (count > 0) setCountdown(count);
          else {
            clearInterval(interval);
            setCountdown(null);
            startGame();
          }
        }, 1000);
        return () => clearInterval(interval);
      }
    });

    return unsubscribe;
  }, [roomId, currentUser]);

  const startGame = useCallback(async () => {
    if (!roomId || !currentUser) return;
    const gameRef = ref(database, `games/${roomId}`);
    await update(gameRef, { status: 'playing', lastDrawTime: Date.now(), currentNumber: null, drawnNumbers: [] });
  }, [roomId, currentUser]);

  const handleNumberMark = useCallback(async (row: number, col: number) => {
    if (!roomId || !currentUser || !playerBoard) return;
    const gameRef = ref(database, `games/${roomId}/players/${currentUser.uid}`);
    const newMarks = marks.map(r => [...r]);
    newMarks[row][col] = !newMarks[row][col];
    await update(gameRef, { marks: newMarks });
  }, [roomId, currentUser, playerBoard, marks]);

  const handleReadyClick = useCallback(async () => {
    if (!roomId || !currentUser || !gameState) return;
    const playerRef = ref(database, `games/${roomId}/players/${currentUser.uid}`);
    const isReady = !gameState.players[currentUser.uid]?.ready;
    await update(playerRef, { ready: isReady });
    if (isReady) {
      const snapshot = await get(ref(database, `games/${roomId}`));
      const data = snapshot.val();
      if (data && Object.values(data.players as Record<string, Player>).filter(p => p.ready).length >= REQUIRED_PLAYERS && data.status === 'waiting') {
        await update(ref(database, `games/${roomId}`), { status: 'countdown', countdownStartTime: Date.now() });
      }
    }
  }, [roomId, currentUser, gameState]);

  const handleSendMessage = useCallback(async () => {
    if (!roomId || !currentUser || !message.trim()) return;
    const msgRef = ref(database, `games/${roomId}/messages`);
    const newMsg = { id: Date.now().toString(), userId: currentUser.uid, userName: currentUser.displayName || 'Anon', text: message, timestamp: Date.now() };
    await update(msgRef, { [newMsg.id]: newMsg });
    setMessage('');
  }, [roomId, currentUser, message]);

  return { gameState, playerBoard, marks, countdown, message, setMessage, handleNumberMark, handleReadyClick, handleSendMessage };
}
