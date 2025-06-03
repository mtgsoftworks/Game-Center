/**
 * src/components/Game/GameScreen.tsx: Tombala oyun ekranı ana bileşeni.
 * Oyun odasına ait Firestore verisini dinler ve oyunun akışını yönetir.
 * Kart oluşturma, çekilen numaralar, oyuncu bağlantı durumu ve kazanan kontrolünü içerir.
 * Gerçek zamanlı güncellemeler ve çoklu oyuncu desteği sunar.
 * Kullanıcıya bildirim, ses efektleri ve çoklu dil desteği sağlar.
 *
 * @returns {JSX.Element} Tombala oyun ekranı arayüzü.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Switch,
  FormControlLabel,
  TextField,
  Drawer,
  Paper,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  doc,
  onSnapshot,
  updateDoc,
  runTransaction,
  UpdateData,
  DocumentData,
  DocumentReference,
  arrayUnion,
  arrayRemove,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useSoundEffects } from '../../contexts/SoundContext';
import { generateBingoCardNumbers, checkBingoWin, checkForWinner } from '../../utils/gameUtils';
import BingoCard from './BingoCard';
import NumberDraw from './NumberDraw';
import GameOverOverlay from './GameOverOverlay';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import { Timestamp } from 'firebase/firestore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Chat from './Chat';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { postTombalaStats, getTombalaAchievements } from '../../services/tombalaStatsService';
import { unlockTombalaAchievement } from '../../services/tombalaAchievementsService';
import AchievementModal from './AchievementModal';

// Define a type for the game room data
interface GameRoomData extends DocumentData {
  creatorUid: string;
  creatorName: string;
  player2Uid: string | null;
  player2Name: string | null;
  status: 'waiting' | 'ready' | 'playing' | 'stopping' | 'finished';
  createdAt: Timestamp; // Firestore Timestamp
  roomName?: string; // Added: User-defined room name
  player1Card?: number[]; // Added: Card numbers for player 1
  player2Card?: number[]; // Added: Card numbers for player 2
  maxPlayers?: number; // Added: Maximum players
  drawnNumbers?: number[]; // Added: Array of numbers drawn so far
  markedNumbersP1?: number[]; // Added: Numbers marked by player 1 (sync later)
  markedNumbersP2?: number[]; // Added: Numbers marked by player 2 (sync later)
  markedNumbersP3?: number[];
  markedNumbersP4?: number[];
  winner?: string | null; // Added: UID of the winner
  currentTurn?: number; // Added: Index of the current number being drawn (or timestamp)
  player1Connected?: boolean;
  player2Connected?: boolean;
  player3Connected?: boolean;
  player4Connected?: boolean;
  disconnectTimerStart?: Timestamp | null; // Timestamp when a player disconnected
  readyP1?: boolean;
  readyP2?: boolean;
  readyP3?: boolean;
  readyP4?: boolean;
  startDateTime?: Timestamp; // Added: Event start date/time
  endDateTime?: Timestamp;   // Added: Event end date/time
}

const DISCONNECT_TIMEOUT = 30000; // 30 seconds in milliseconds

const GameScreen: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();
  const { playDrawSound, playWinSound, playClickSound } = useSoundEffects();
  const [gameRoom, setGameRoom] = useState<GameRoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false); // State to disable button during draw
  const { t } = useTranslation();
  const [disconnectCountdown, setDisconnectCountdown] = useState<number | null>(null);
  const disconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [autoDrawEnabled, setAutoDrawEnabled] = useState(false);
  const [autoDrawInterval, setAutoDrawInterval] = useState<number>(5); // saniye cinsinden otomatik çekim aralığı
  const [penaltyCountdown, setPenaltyCountdown] = useState<number | null>(null);
  const penaltyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown for auto-redirect after game end
  const [endCountdown, setEndCountdown] = useState<number | null>(null);
  const endTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Use a ref to store the previous game state for comparison in useEffect
  const prevGameRoomRef = useRef<GameRoomData | null>(null);

  // Ready status tracking
  const isP3 = currentUser?.uid === gameRoom?.player3Uid;
  const isP4 = currentUser?.uid === gameRoom?.player4Uid;
  const isReady = gameRoom
    ? currentUser?.uid === gameRoom.creatorUid
      ? !!gameRoom.readyP1
      : currentUser?.uid === gameRoom.player2Uid
        ? !!gameRoom.readyP2
        : isP3
          ? !!gameRoom.readyP3
          : !!gameRoom.readyP4
    : false;
  const allReady = gameRoom
    ? Array.from({ length: gameRoom.maxPlayers || 2 }).every((_, idx) =>
        idx === 0 ? !!gameRoom.readyP1 :
        idx === 1 ? !!gameRoom.readyP2 :
        idx === 2 ? !!gameRoom.readyP3 :
        !!gameRoom.readyP4
      )
    : false;

  const [openChat, setOpenChat] = useState(false);
  // Count current players for waiting UI
  const currentPlayersCount = gameRoom
    ? [gameRoom.creatorUid, gameRoom.player2Uid, gameRoom.player3Uid, gameRoom.player4Uid].filter(Boolean).length
    : 0;

  const [lastErrorAction, setLastErrorAction] = useState<(() => void) | null>(null);

  const [achEvaluated, setAchEvaluated] = useState(false);

  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [achievements, setAchievements] = useState<Array<{ id: string; title: string }>>([]);

  const handleReady = async () => {
    if (!currentUser || !roomId || !gameRoom) return;
    const roomRef = doc(db, 'gameRooms', roomId);
    const field: string | null =
      currentUser.uid === gameRoom.creatorUid ? 'readyP1' :
      currentUser.uid === gameRoom.player2Uid ? 'readyP2' :
      isP3 ? 'readyP3' :
      isP4 ? 'readyP4' : null;
    if (!field) return;
    try {
      await updateDoc(roomRef, { [field]: true });
      showNotification(t('readySuccess'), 'success');
    } catch (err) {
      console.error('Error setting ready status:', err);
      showNotification(t('errorSettingReady'), 'error');
    }
  };

  // useEffect for Notifications and Sounds based on game state changes
  useEffect(() => {
    const prevGameRoom = prevGameRoomRef.current;
    if (!gameRoom) return;

    // Oyun bittiğinde istatistik kaydet ve modal aç
    if (gameRoom.status === 'finished' && prevGameRoom?.status !== 'finished') {
      const matched = currentUser?.uid === gameRoom.creatorUid ? gameRoom.markedNumbersP1?.length || 0
        : currentUser?.uid === gameRoom.player2Uid ? gameRoom.markedNumbersP2?.length || 0
        : currentUser?.uid === gameRoom.player3Uid ? gameRoom.markedNumbersP3?.length || 0
        : gameRoom.markedNumbersP4?.length || 0;
      const durationSec = (gameRoom.startDateTime && gameRoom.endDateTime)
        ? Math.round((gameRoom.endDateTime.toMillis() - gameRoom.startDateTime.toMillis()) / 1000)
        : 0;
      postTombalaStats({ userId: currentUser.uid, score: matched, cardsMatched: matched, duration: durationSec, success: currentUser.uid === gameRoom.winner })
        .catch(err => console.error('Error posting stats:', err));
      if (!achEvaluated) {
        getTombalaAchievements(currentUser.uid)
          .then(list => {
            setAchievements(list);
            list.forEach(a => unlockTombalaAchievement(currentUser.uid, { id: a.id, title: a.title }));
            setAchievementsOpen(true);
          })
          .catch(err => console.error('Error fetching tombala achievements:', err));
        setAchEvaluated(true);
      }
    }

    const isPlaying = gameRoom.status === 'playing';

    // --- Drawn Number Notification/Sound --- 
    if (isPlaying) {
        const prevDrawnCount = prevGameRoom?.drawnNumbers?.length ?? 0;
        const currentDrawnCount = gameRoom.drawnNumbers?.length ?? 0;
        if (currentDrawnCount > prevDrawnCount && gameRoom.drawnNumbers) {
          const lastDrawn = gameRoom.drawnNumbers[gameRoom.drawnNumbers.length - 1];
          showNotification(t('numberDrawn', { number: lastDrawn }), 'info');
          playDrawSound();
        }
    }

    // --- Winner Notification/Sound --- 
    // Check if the status *transitioned* to finished
    if (prevGameRoom?.status !== 'finished' && gameRoom.status === 'finished' && gameRoom.winner) {
        const winnerName = gameRoom.winner === gameRoom.creatorUid ? gameRoom.creatorName : gameRoom.player2Name;
        showNotification(t('bingoWinner', { name: winnerName }), 'success');
        playWinSound(); // Play win sound ONLY on transition
    }

    // Update the ref with the current state for the next render
    prevGameRoomRef.current = gameRoom; 

  // Dependencies: only run when gameRoom changes, or sounds/notifications become available
  }, [gameRoom, gameRoom?.creatorUid, showNotification, playDrawSound, playWinSound, t]); 

  // Rozetleri değerlendirme ve Firestore'a kaydetme
  useEffect(() => {
    if (gameRoom?.status === 'finished' && currentUser && !achEvaluated) {
      setAchEvaluated(true);
      getTombalaAchievements(currentUser.uid)
        .then(list => {
          list.forEach(async ach => {
            await unlockTombalaAchievement(currentUser.uid, { id: ach.id, title: ach.title });
            showNotification(`Yeni rozet kazandınız: ${ach.title}`, 'success');
          });
        })
        .catch(err => console.error('Achievement evaluation error:', err));
    }
  }, [gameRoom?.status, currentUser, achEvaluated, showNotification, t]);

  // Combined useEffect for Firestore listener AND Presence/Disconnect Logic
  useEffect(() => {
    if (!roomId || !currentUser) {
       // Handle cases where roomId or user is not available
        if(!roomId) setError(t('errorNoRoomId'));
        setLoading(false);
        if(!currentUser && !loading) navigate('/login'); // Redirect if not logged in and not loading auth
      return;
    }

    const roomRef = doc(db, 'gameRooms', roomId);
    let isInitiallyConnected = false;

    const unsubscribe = onSnapshot(
      roomRef,
      async (docSnap) => {
        if (!docSnap.exists()) {
          setError(t('errorGameRoomNotFound'));
          setGameRoom(null);
          setLoading(false);
          // Clear any running timer if room disappears
          if (disconnectTimerRef.current) {
              clearTimeout(disconnectTimerRef.current);
              disconnectTimerRef.current = null;
          }
          setDisconnectCountdown(null);
          return;
        }

        const roomData = docSnap.data() as GameRoomData;
        setGameRoom(roomData);
        setError(null);
        setLoading(false);

        // --- Presence Logic ---
        const isP1 = currentUser.uid === roomData.creatorUid;
        const isP2 = currentUser.uid === roomData.player2Uid;
        const myConnectionField = isP1 ? 'player1Connected' : isP2 ? 'player2Connected' : null;
        const opponentConnectionField = isP1 ? 'player2Connected' : isP2 ? 'player1Connected' : null;

        // 1. Set my connection status to true (if needed, only once initially)
        if (myConnectionField && !isInitiallyConnected && roomData[myConnectionField] !== true) {
          isInitiallyConnected = true;
          console.log(`Setting ${myConnectionField} to true`);
          try {
            await updateDoc(roomRef, { [myConnectionField]: true });
          } catch(err) {
            console.error("Error setting initial connection status:", err);
          }
        }

        // --- Disconnect Timer Logic (Only applies if player 2 exists) ---
        if (roomData.player2Uid && opponentConnectionField) {
          const opponentIsConnected = roomData[opponentConnectionField];
          const timerStartTime = roomData.disconnectTimerStart; // Firestore Timestamp or null
          const currentStatus = roomData.status;

          // Case 1: Opponent disconnected WHILE PLAYING
          if (currentStatus === 'playing' && !opponentIsConnected && !timerStartTime) {
            console.log('Opponent disconnected during play, entering stopping state...');
            try {
              // Start timer and change status to stopping
              await updateDoc(roomRef, {
                status: 'stopping',
                disconnectTimerStart: serverTimestamp()
              });
              // Local countdown will update based on snapshot with timerStartTime
            } catch(err) {
              console.error("Error starting disconnect timer and setting status to stopping:", err);
            }
          }
          // Case 2: Opponent reconnected WHILE STOPPED
          else if (currentStatus === 'stopping' && opponentIsConnected && timerStartTime) {
            console.log('Opponent reconnected, returning to playing state...');
            if (disconnectTimerRef.current) {
              clearTimeout(disconnectTimerRef.current);
              disconnectTimerRef.current = null;
            }
            setDisconnectCountdown(null);
            try {
              // Clear timer and return to playing
              await updateDoc(roomRef, {
                status: 'playing',
                disconnectTimerStart: null
              });
            } catch(err) {
              console.error("Error clearing disconnect timer and returning to playing:", err);
            }
          }
          // Case 3: Game is STOPPED and timer is running
          else if (currentStatus === 'stopping' && timerStartTime) {
            const startTime = timerStartTime.toMillis();
            const now = Date.now();
            const elapsed = now - startTime;
            const remaining = Math.max(0, DISCONNECT_TIMEOUT - elapsed);

            setDisconnectCountdown(Math.ceil(remaining / 1000)); // Update local countdown display

            // Clear previous local timer if exists
            if (disconnectTimerRef.current) {
              clearTimeout(disconnectTimerRef.current);
            }

            if (remaining <= 0) {
              // Timeout reached!
              console.log('Disconnect timeout reached!');
              setDisconnectCountdown(0);
              // Determine winner (the one still connected)
              const winnerUid = roomData.player1Connected ? roomData.creatorUid : roomData.player2Uid;
              try {
                // Transaction ile kazanan atama
                await runTransaction(db, async (tx) => {
                  const snap2 = await tx.get(roomRef);
                  if (snap2.exists() && snap2.data().status === 'stopping') {
                    tx.update(roomRef, {
                      winner: winnerUid,
                      status: 'finished',
                      disconnectTimerStart: null
                    });
                  } else {
                    console.log("Game status changed before declaring winner via disconnect timeout.");
                  }
                });
                console.log("Opponent didn't return, winner declared.");
              } catch (err) {
                console.error("Error setting winner due to disconnect timeout:", err);
                setError(t('errorDeclaringWinnerDisconnect'));
              }
            } else {
              // Set a new local timer to check again near timeout
              disconnectTimerRef.current = setTimeout(() => {
                console.log('Local disconnect timer check triggered (in stopping state)');
                // Re-trigger state update to re-evaluate time remaining
                setDisconnectCountdown(prev => prev !== null ? Math.max(0, prev - 1) : null);
              }, 1000); // Check every second
            }
          }
          // Case 4: Game is PLAYING and opponent is connected (or other states)
          else if (currentStatus !== 'stopping') {
             // Ensure countdown is cleared if not in stopping state
             if (disconnectCountdown !== null) {
                  console.log('Game not in stopping state, ensuring countdown is null.');
                  setDisconnectCountdown(null);
             }
             if (disconnectTimerRef.current) {
                 clearTimeout(disconnectTimerRef.current);
                 disconnectTimerRef.current = null;
             }
          }
        }
         else { // Game hasn't started, finished, or no player 2 / opponent field
            // Ensure countdown is cleared if state doesn't warrant it
            if (disconnectCountdown !== null) {
                console.log('Game state doesnt warrant countdown, clearing.');
                setDisconnectCountdown(null);
            }
            if (disconnectTimerRef.current) {
                clearTimeout(disconnectTimerRef.current);
                disconnectTimerRef.current = null;
            }
         }

      },
      (err) => {
         // ... (error handling) ...
          console.error('Error fetching game room:', err);
          setError(t('errorLoadGame'));
          setLoading(false);
          showNotification(t('errorLoadGame'), 'error');
      },
    );

    // --- Cleanup Logic --- 
    return () => {
      console.log("GameScreen unmounting or roomId/currentUser changed.");
      unsubscribe(); // Unsubscribe from Firestore listener
        // Clear local timer on unmount
        if (disconnectTimerRef.current) {
            clearTimeout(disconnectTimerRef.current);
             disconnectTimerRef.current = null;
        }
        
       // Attempt to set connection status to false on unmount/disconnect
       // This is unreliable, especially on browser close/crash. Firebase Presence is better.
        if (roomId && currentUser && isInitiallyConnected) {
            const isP1 = currentUser.uid === gameRoom?.creatorUid; // Use last known gameRoom state
            const isP2 = currentUser.uid === gameRoom?.player2Uid;
            const myConnectionField = isP1 ? 'player1Connected' : isP2 ? 'player2Connected' : null;
             if (myConnectionField) {
                 const roomRefOnUnmount = doc(db, 'gameRooms', roomId);
                 console.log(`Setting ${myConnectionField} to false on unmount`);
                 // Use updateDoc directly - no need for await in cleanup usually
                 updateDoc(roomRefOnUnmount, { [myConnectionField]: false, disconnectTimerStart: null }).catch(err => {
                    console.error("Error setting disconnect status on unmount:", err);
                 });
             }
        }
    };
  // Dependencies now include currentUser to handle login/logout while viewing?
  }, [roomId, navigate, t, showNotification, currentUser, loading, gameRoom?.creatorUid, gameRoom?.player2Uid, disconnectCountdown]);

  // Trigger countdown when game finishes
  useEffect(() => {
    if (gameRoom?.status === 'finished' && gameRoom.winner && endCountdown === null) {
      setEndCountdown(10);
    }
  }, [gameRoom?.status, gameRoom?.winner, endCountdown]);

  // Countdown timer effect
  useEffect(() => {
    if (endCountdown !== null) {
      if (endCountdown <= 0) {
        if (endTimerRef.current) {
          clearTimeout(endTimerRef.current);
          endTimerRef.current = null;
        }
        navigate('/lobby');
      } else {
        endTimerRef.current = setTimeout(() => setEndCountdown(prev => (prev !== null ? prev - 1 : null)), 1000);
      }
    }
    return () => {
      if (endTimerRef.current) {
        clearTimeout(endTimerRef.current);
        endTimerRef.current = null;
      }
    };
  }, [endCountdown, navigate]);

  // Penalty countdown effect
  useEffect(() => {
    if (penaltyCountdown === null) return;
    if (penaltyCountdown <= 0) {
      setPenaltyCountdown(null);
    } else {
      penaltyTimerRef.current = setTimeout(() => {
        setPenaltyCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    }
    return () => {
      if (penaltyTimerRef.current) clearTimeout(penaltyTimerRef.current);
    };
  }, [penaltyCountdown]);

  const handleStartGame = async () => {
    if (!currentUser || !roomId || !gameRoom || gameRoom.creatorUid !== currentUser.uid || gameRoom.status !== 'ready' || !allReady) {
      setError(t('errorOnlyCreatorCanStartGame'));
      return;
    }
    setError(null);

    try {
      const player1CardNumbers = generateBingoCardNumbers(25, 1, 90);
      const player2CardNumbers = generateBingoCardNumbers(25, 1, 90);

      // Build dynamic payload for all players
      const payload: Partial<GameRoomData> = {
        status: 'playing',
        startDateTime: serverTimestamp(),
        drawnNumbers: [],
        markedNumbersP1: [],
        markedNumbersP2: [],
        player1Card: player1CardNumbers,
        player2Card: player2CardNumbers,
        winner: null,
        currentTurn: 0,
        player1Connected: true,
        player2Connected: true,
        disconnectTimerStart: null,
      };
      if ((gameRoom.maxPlayers || 2) >= 3) {
        const player3CardNumbers = generateBingoCardNumbers(25, 1, 90);
        payload.player3Card = player3CardNumbers;
        payload.markedNumbersP3 = [];
        payload.player3Connected = true;
      }
      if ((gameRoom.maxPlayers || 2) === 4) {
        const player4CardNumbers = generateBingoCardNumbers(25, 1, 90);
        payload.player4Card = player4CardNumbers;
        payload.markedNumbersP4 = [];
        payload.player4Connected = true;
      }
      const roomRef = doc(db, 'gameRooms', roomId);
      await updateDoc(roomRef, payload);
      console.log(`Game ${roomId} started by ${currentUser.displayName}`);
      showNotification(t('gameStarted'), 'success');
      playClickSound();

    } catch (e) {
      console.error('Error starting game:', e);
      setError(t('errorStartingGame'));
      showNotification(t('errorStartingGame'), 'error');
    }
  };

  // Function to draw the next number
  const handleDrawNumber = useCallback(async () => {
    // Guard
    if (!currentUser || !roomId || !gameRoom || isDrawing) {
      console.warn('Cannot draw number: Invalid state or already drawing.');
      setError(t('errorCannotDrawNumber'));
      return;
    }
    // Transaction ile çekim ve win detection
    setError(null);
    setIsDrawing(true);
    setLastErrorAction(() => handleDrawNumber);
    try {
      await runTransaction(db, async (tx) => {
        const roomRef = doc(db, 'gameRooms', roomId);
        const snap = await tx.get(roomRef);
        if (!snap.exists()) throw new Error('Room not found');
        const data = snap.data() as GameRoomData;
        if (data.creatorUid !== currentUser.uid || data.status !== 'playing' || data.winner) {
          throw new Error('Invalid state for drawing.');
        }
        const drawn = data.drawnNumbers || [];
        if (drawn.length >= 90) throw new Error('All numbers drawn');
        let nextNum;
        const drawnSet = new Set(drawn);
        do { nextNum = Math.floor(Math.random() * 90) + 1; } while (drawnSet.has(nextNum));
        const newDrawn = [...drawn, nextNum];
        tx.update(roomRef, {
          drawnNumbers: arrayUnion(nextNum),
          currentTurn: (data.currentTurn || 0) + 1,
        });
        // Win detection for all players
        const cardsToCheck = [
          { id: data.creatorUid, cardNumbers: data.player1Card || [] },
          { id: data.player2Uid || '', cardNumbers: data.player2Card || [] },
        ];
        if (data.player3Uid) cardsToCheck.push({ id: data.player3Uid, cardNumbers: data.player3Card || [] });
        if (data.player4Uid) cardsToCheck.push({ id: data.player4Uid, cardNumbers: data.player4Card || [] });
        const result = checkForWinner(cardsToCheck, newDrawn);
        if (result.winnerId) {
          tx.update(roomRef, { winner: result.winnerId, status: 'finished', endDateTime: serverTimestamp() });
        }
      });
    } catch (e) {
      console.error('Error drawing number:', e);
      setError(t('errorDrawingNumber'));
      showNotification(t('errorDrawingNumber'), 'error');
    } finally {
      setIsDrawing(false);
    }
  }, [currentUser, roomId, gameRoom, isDrawing, showNotification, t]);

  // Auto-draw every autoDrawInterval seconds when enabled (host only)
  useEffect(() => {
    if (!autoDrawEnabled) return;
    if (currentUser?.uid !== gameRoom?.creatorUid) return;
    if (gameRoom?.status !== 'playing' || gameRoom?.winner) return;
    const intervalSec = Math.max(autoDrawInterval, 1);
    const intervalId = setInterval(() => {
      handleDrawNumber();
    }, intervalSec * 1000);
    return () => clearInterval(intervalId);
  }, [autoDrawEnabled, autoDrawInterval, currentUser?.uid, gameRoom?.status, gameRoom?.winner, handleDrawNumber, gameRoom?.creatorUid]);

  // --- Win Check Logic (Reverted to Standard Bingo Lines) ---
  const checkForWinAfterAction = useCallback(async (
    playerFieldName: 'markedNumbersP1' | 'markedNumbersP2' | 'markedNumbersP3' | 'markedNumbersP4',
    roomRef: DocumentReference<DocumentData>,
    updatedRoomData?: GameRoomData
  ) => {
    const currentRoomState = updatedRoomData || gameRoom;
    // Only check if playing and no winner yet
    if (!currentRoomState || currentRoomState.status !== 'playing' || currentRoomState.winner) {
        return;
    }
    // Kart ve işaretli sayılarını al
    let cardNumbers: number[] | undefined;
    let markedNumbersSet: Set<number>;
    if (playerFieldName === 'markedNumbersP1') {
      cardNumbers = currentRoomState.player1Card;
      markedNumbersSet = new Set(currentRoomState.markedNumbersP1 || []);
    } else if (playerFieldName === 'markedNumbersP2') {
      cardNumbers = currentRoomState.player2Card;
      markedNumbersSet = new Set(currentRoomState.markedNumbersP2 || []);
    } else if (playerFieldName === 'markedNumbersP3') {
      cardNumbers = currentRoomState.player3Card;
      markedNumbersSet = new Set(currentRoomState.markedNumbersP3 || []);
    } else {
      cardNumbers = currentRoomState.player4Card;
      markedNumbersSet = new Set(currentRoomState.markedNumbersP4 || []);
    }

    if (!cardNumbers || cardNumbers.length !== 25) return; // Card not ready or invalid

    // Check for standard Bingo win using the utility function
    const hasWon = checkBingoWin(cardNumbers, markedNumbersSet);

    console.log(`Checking Standard Bingo Win for ${playerFieldName}. Won: ${hasWon}`);

    if (hasWon) {
        // Kazanan UID'si alan adına göre belirle
        let winnerUid: string | null = null;
        if (playerFieldName === 'markedNumbersP1') winnerUid = currentRoomState.creatorUid;
        else if (playerFieldName === 'markedNumbersP2') winnerUid = currentRoomState.player2Uid;
        else if (playerFieldName === 'markedNumbersP3') winnerUid = currentRoomState.player3Uid || null;
        else if (playerFieldName === 'markedNumbersP4') winnerUid = currentRoomState.player4Uid || null;
        console.log(`Standard Bingo Winner detected: ${winnerUid} (${playerFieldName})`);
        try {
            // Check again briefly if someone else won in the meantime
            const currentSnap = await getDoc(roomRef);
            if (currentSnap.exists()) {
                const gameData = currentSnap.data() as GameRoomData;
                if (gameData.winner) {
                    console.log("Another player already won.");
                    return; // Avoid overwriting winner
                }
            }

            await updateDoc(roomRef, {
                winner: winnerUid,
                status: 'finished'
            });
            console.log("Game status updated to finished (Standard Bingo Win).");
            // Sound/Notification is handled by the main useEffect watching gameRoom status change
        } catch (e) {
            console.error("Error updating winner status (Standard Bingo Win):", e);
            setError(t("errorDeclaringWinner"));
            showNotification(t('errorDeclaringWinner'), 'error');
        }
    }
  }, [gameRoom, showNotification, t]);

  const handleMarkNumber = async (number: number, isMarking: boolean) => {
    if (!currentUser || !roomId || !gameRoom || gameRoom.status !== 'playing' || gameRoom.winner) {
      console.warn('Cannot mark number: Invalid state or game not active.');
      return;
    }

    if (penaltyCountdown !== null) return;
    if (!gameRoom?.drawnNumbers?.includes(number)) {
      setPenaltyCountdown(30);
      showNotification('Ceza yediniz, 30 sn bekleyin', 'error');
      return;
    }

    const isPlayer1 = currentUser.uid === gameRoom.creatorUid;
    const isPlayer2 = currentUser.uid === gameRoom.player2Uid;
    const isPlayer3 = currentUser.uid === gameRoom.player3Uid;
    const isPlayer4 = currentUser.uid === gameRoom.player4Uid;
    const playerFieldName = isPlayer1 ? 'markedNumbersP1'
      : isPlayer2 ? 'markedNumbersP2'
      : isPlayer3 ? 'markedNumbersP3'
      : isPlayer4 ? 'markedNumbersP4'
      : null;

    if (!playerFieldName) {
      console.error('Current user is neither player 1 nor player 2.');
      return;
    }

    try {
      // Transaction ile işaretleme ve win check
      setLastErrorAction(() => () => handleMarkNumber(number, isMarking));
      await runTransaction(db, async (tx) => {
        const roomRef = doc(db, 'gameRooms', roomId);
        const snap = await tx.get(roomRef);
        if (!snap.exists()) throw new Error('Room not found');
        const data = snap.data() as GameRoomData;
        const updatePayload: UpdateData<GameRoomData> = {};
        if (isMarking) updatePayload[playerFieldName] = arrayUnion(number);
        else updatePayload[playerFieldName] = arrayRemove(number);
        tx.update(roomRef, updatePayload);
        // Potansiyel state
        const nextState: GameRoomData = {
          ...data,
          [playerFieldName]: isMarking
            ? [...(data[playerFieldName] ?? []), number]
            : (data[playerFieldName] ?? []).filter(n => n !== number)
        };
        await checkForWinAfterAction(playerFieldName, roomRef, nextState);
      });
      playClickSound();
    } catch (e) {
      console.error(`Error ${isMarking ? 'marking' : 'unmarking'} number:`, e);
      setError(t('errorMarkingNumber'));
      showNotification(t('errorMarkingNumber'), 'error');
    }
  };

  // Helper to convert drawnNumbers array to Set for BingoCard prop
  const drawnNumbersSet = new Set(gameRoom?.drawnNumbers || []);
  // Helpers to convert marked numbers arrays to Sets for BingoCard prop
  const markedNumbersP1Set = new Set(gameRoom?.markedNumbersP1 || []);
  const markedNumbersP2Set = new Set(gameRoom?.markedNumbersP2 || []);
  const markedNumbersP3Set = new Set(gameRoom?.markedNumbersP3 || []);
  const markedNumbersP4Set = new Set(gameRoom?.markedNumbersP4 || []);

  // Determine flex width for cards based on player count
  const columns = gameRoom?.maxPlayers || 2;
  const colWidth = columns === 2 ? '50%' : columns === 3 ? '33.33%' : '25%';

  // Function to handle leaving the game
  const handleLeaveGame = async () => {
    if (!currentUser || !roomId || !gameRoom) return;

    const isP1 = currentUser.uid === gameRoom.creatorUid;
    const isP2 = currentUser.uid === gameRoom.player2Uid;
    const myConnectionField = isP1 ? 'player1Connected' : isP2 ? 'player2Connected' : null;

    // Try to mark as disconnected before navigating
    if (myConnectionField) {
      const roomRef = doc(db, 'gameRooms', roomId);
      console.log(`Player leaving, setting ${myConnectionField} to false`);
      try {
        // No need to await fully? Let the navigation happen. The backend update will trigger the other client.
        // However, for cleanup, maybe it's better to await?
        // Let's try awaiting briefly to increase chances of update propagating.
        await updateDoc(roomRef, { [myConnectionField]: false });
        console.log('Successfully marked player as disconnected.');
      } catch (error) {
        console.error('Error marking player as disconnected before leaving:', error);
        // Still navigate even if update fails
      }
    }
    // Navigate back to lobby
    navigate('/lobby');
  };

  // --- Render Logic --- //

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ my: 4 }}>
          {error}
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          {lastErrorAction ? (
            <Button variant="contained" onClick={() => { lastErrorAction(); setError(null); }}>
              {t('retry')}
            </Button>
          ) : (
            <Button variant="outlined" onClick={() => navigate('/lobby')}>
              {t('backToLobby')}
            </Button>
          )}
        </Box>
      </Container>
    );
  }

  if (!gameRoom) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ my: 4 }}>
          {t('errorGameRoomDataNotAvailable')}
        </Alert>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/lobby')}>
          {t('backToLobby')}
        </Button>
      </Container>
    );
  }

  // Determine if the current user is player 1 
  const isPlayer1 = currentUser?.uid === gameRoom.creatorUid;

  // Main game screen content
  return (
    <Container maxWidth="lg" sx={{ position: 'relative', py: 2 }}>
      {/* Penalty overlay */}
      {penaltyCountdown !== null && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', bgcolor: 'rgba(0,0,0,0.7)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'white' }}>
          <Typography variant="h4">Ceza yediniz, {penaltyCountdown} sn bekleyin</Typography>
        </Box>
      )}
      {/* Modern header bar */}
      <AppBar position="static" color="inherit" elevation={1} sx={{ mb: 4 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h5" component="div">{t('gameTitleBasic')}</Typography>
          {isPlayer1 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1">{`${t('roomLabel')}: ${roomId!}`}</Typography>
              <IconButton size="small" onClick={() => { navigator.clipboard.writeText(roomId!); showNotification(t('copiedCode'), 'success'); }} sx={{ ml: 1 }}>
                <ContentCopyIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{ my: 4 }}>
        {/* Disconnect Countdown Alert - Show only when 'stopping' */}
        {gameRoom!.status === 'stopping' && disconnectCountdown !== null && (
            <Alert severity="warning" sx={{ mb: 2 }}>
                {t('opponentDisconnected', { seconds: disconnectCountdown })}
            </Alert>
        )}

        {/* Player Information Area - Add Winner/Loser Labels */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 3 }}>
          <Box sx={{ flex: '1 0 50%', mb: 1 }}>
            <Typography variant="h6">{t('player1')}:</Typography>
            <Typography>
              {gameRoom.creatorName} {t('creator')}
              {/* Show label if game finished */}
              {gameRoom.status === 'finished' && (
                gameRoom.winner === gameRoom.creatorUid ? 
                  <Typography component="span" color="success.main" sx={{ ml: 1 }}>{t('lobby.winnerLabel')}</Typography> : 
                  <Typography component="span" color="error.main" sx={{ ml: 1 }}>{t('lobby.loserLabel')}</Typography>
              )}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 0 50%', mb: 1 }}>
            <Typography variant="h6">{t('player2')}:</Typography>
            {gameRoom.player2Name ? (
              <Typography>
                {gameRoom.player2Name}
                {/* Show label if game finished */}
                {gameRoom.status === 'finished' && (
                  gameRoom.winner === gameRoom.player2Uid ? 
                    <Typography component="span" color="success.main" sx={{ ml: 1 }}>{t('lobby.winnerLabel')}</Typography> : 
                    <Typography component="span" color="error.main" sx={{ ml: 1 }}>{t('lobby.loserLabel')}</Typography>
                )}
              </Typography>
            ) : (
              <Typography><i>{t('waitingPlayer')}</i></Typography>
            )}
          </Box>
          {(gameRoom.maxPlayers || 0) >= 3 && (
            <Box sx={{ flex: '1 0 50%', mb: 1 }}>
              <Typography variant="h6">{t('player3')}:</Typography>
              {gameRoom.player3Name ? (
                <Typography>
                  {gameRoom.player3Name}
                  {/* Show label if game finished */}
                  {gameRoom.status === 'finished' && (
                    gameRoom.winner === gameRoom.player3Uid
                      ? <Typography component="span" color="success.main" sx={{ ml: 1 }}>{t('lobby.winnerLabel')}</Typography>
                      : <Typography component="span" color="error.main" sx={{ ml: 1 }}>{t('lobby.loserLabel')}</Typography>
                  )}
                </Typography>
              ) : (
                <Typography><i>{t('waitingPlayer')}</i></Typography>
              )}
            </Box>
          )}
          {(gameRoom.maxPlayers || 0) === 4 && (
            <Box sx={{ flex: '1 0 50%', mb: 1 }}>
              <Typography variant="h6">{t('player4')}:</Typography>
              {gameRoom.player4Name ? (
                <Typography>
                  {gameRoom.player4Name}
                  {/* Show label if game finished */}
                  {gameRoom.status === 'finished' && (
                    gameRoom.winner === gameRoom.player4Uid
                      ? <Typography component="span" color="success.main" sx={{ ml: 1 }}>{t('lobby.winnerLabel')}</Typography>
                      : <Typography component="span" color="error.main" sx={{ ml: 1 }}>{t('lobby.loserLabel')}</Typography>
                  )}
                </Typography>
              ) : (
                <Typography><i>{t('waitingPlayer')}</i></Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Game Status and Controls Area */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h6">{t('status')}: {gameRoom.status === 'stopping' ? `${gameRoom.status.toUpperCase()} (${t('waitingForPlayer')})` : gameRoom.status.toUpperCase()}</Typography>
          {gameRoom.status === 'waiting' && isPlayer1 && (
             <Typography><i>{t('waitingToJoin')}</i></Typography>
          )}
           {gameRoom.status === 'ready' && isPlayer1 && (
             <Button variant="contained" onClick={handleStartGame} disabled={!allReady}>{t('startGame')}</Button>
           )}
           {gameRoom.status === 'ready' && !isPlayer1 && (
             <Button variant="outlined" onClick={handleReady} disabled={isReady} startIcon={isReady ? <CheckCircleIcon /> : <HourglassEmptyIcon />}>
               {isReady ? t('ready') : t('clickToReady')}
             </Button>
           )}
          {/* Auto-draw toggle (host) */}
          {gameRoom.status === 'playing' && isPlayer1 && !gameRoom.winner && (
            <FormControlLabel
              control={<Switch checked={autoDrawEnabled} onChange={() => setAutoDrawEnabled(prev => !prev)} />} 
              label={autoDrawEnabled ? 'Otomatik Çekim Açık' : 'Otomatik Çekim Kapalı'}
              sx={{ ml: 2 }}
            />
          )}
          {gameRoom.status === 'playing' && isPlayer1 && !gameRoom.winner && autoDrawEnabled && (
            <TextField
              label="Çekim Süresi (sn)"
              type="number"
              value={autoDrawInterval}
              onChange={(e) => setAutoDrawInterval(Number(e.target.value))}
              inputProps={{ min: 1 }}
              sx={{ width: '140px', ml: 2 }}
            />
          )}
          {/* Manual draw button (unchanged) */}
          {gameRoom.status === 'playing' && isPlayer1 && !gameRoom.winner && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleDrawNumber}
              disabled={isDrawing || ((gameRoom.drawnNumbers?.length ?? 0) >= 90) || !!gameRoom.winner}
            >
              {isDrawing ? <CircularProgress size={24} /> : ((gameRoom.drawnNumbers?.length ?? 0) >= 90) ? t('allDrawn') : t('drawNextNumber')}
            </Button>
          )}
          {/* Winner Alert - Keep this as it shows the overall winner */}
          {gameRoom! && gameRoom!.winner && gameRoom!.status === 'finished' && (
            <Alert severity="success" sx={{ width: '100%', mt: 1 }}>{t('winner')}: {gameRoom.winner === gameRoom.creatorUid ? gameRoom.creatorName : gameRoom.player2Name}</Alert>
          )}
        </Box>

        {(gameRoom!.status === 'playing' || gameRoom!.status === 'stopping' || gameRoom!.status === 'finished') ? (
          <>
            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
              <NumberDraw drawnNumbers={gameRoom.drawnNumbers} />
            </Paper>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {Array.from({ length: gameRoom.maxPlayers || 2 }).map((_, idx) => {
                  const slot =
                    idx === 0
                      ? { uid: gameRoom.creatorUid, name: gameRoom.creatorName, cardNumbers: gameRoom.player1Card || [], marks: markedNumbersP1Set }
                    : idx === 1
                      ? { uid: gameRoom.player2Uid, name: gameRoom.player2Name || '', cardNumbers: gameRoom.player2Card || [], marks: markedNumbersP2Set }
                    : idx === 2
                      ? { uid: gameRoom.player3Uid, name: gameRoom.player3Name || '', cardNumbers: gameRoom.player3Card || [], marks: markedNumbersP3Set }
                    : { uid: gameRoom.player4Uid, name: gameRoom.player4Name || '', cardNumbers: gameRoom.player4Card || [], marks: markedNumbersP4Set };
                  return (
                    <Box key={idx} sx={{ flex: `1 0 ${colWidth}`, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" align="center" fontSize={{ xs: '1rem', sm: '1.25rem' }}>
                        {slot.name || t('waitingPlayer')}
                        {gameRoom.status === 'finished' && (
                          gameRoom.winner === slot.uid
                            ? <Typography component="span" color="success.main" sx={{ ml: 1 }}>{t('lobby.winnerLabel')}</Typography>
                            : <Typography component="span" color="error.main" sx={{ ml: 1 }}>{t('lobby.loserLabel')}</Typography>
                        )}
                      </Typography>
                      {slot.cardNumbers.length === 25 ? (
                        <BingoCard
                          numbers={slot.cardNumbers}
                          drawnNumbers={drawnNumbersSet}
                          initialMarkedNumbers={slot.marks}
                          isPlayerCard={currentUser?.uid === slot.uid && gameRoom.status === 'playing'}
                          onMarkNumber={handleMarkNumber}
                        />
                      ) : (
                        <Box sx={{ p: 2, border: '1px dashed', borderColor: 'grey', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <Typography>{t('waitingPlayer')}</Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </>
        ) : gameRoom!.status === 'waiting' || gameRoom!.status === 'ready' ? (
          <Paper elevation={3} sx={{ p: 3, mt: 2, textAlign: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {gameRoom.status === 'waiting'
                ? t('waitingToJoin')
                : t('game.waiting', { current: currentPlayersCount, required: gameRoom.maxPlayers || 2 })}
            </Typography>
          </Paper>
        ) : (
          <Typography sx={{ mt: 2 }} color="error"><i>{t('Error: Game in unexpected state or card data missing.')}</i></Typography>
        )}

        {/* Back to Lobby Button - Use new handler */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button variant="outlined" onClick={handleLeaveGame}>
                {t('backToLobby')}
            </Button>
        </Box>
      </Box>

      {/* Game Over Overlay - Rendered conditionally with animation */}
      <AnimatePresence>
        {gameRoom.status === 'finished' && gameRoom.winner && (
          <GameOverOverlay
            winnerName={gameRoom.winner === gameRoom.creatorUid ? gameRoom.creatorName : gameRoom.player2Name}
            isWinner={currentUser?.uid === gameRoom.winner}
            countdownSeconds={endCountdown ?? 0}
          />
        )}
      </AnimatePresence>

      <AchievementModal open={achievementsOpen} achievements={achievements} onClose={() => setAchievementsOpen(false)} />

      {/* Chat Toggle Button and Drawer */}
      <IconButton
        color="primary"
        onClick={() => setOpenChat(true)}
        sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1300 }}
      >
        <ChatBubbleIcon />
      </IconButton>
      <Drawer
        anchor="right"
        open={openChat}
        onClose={() => setOpenChat(false)}
      >
        <Box sx={{ width: 400, height: '100%', p: 2, bgcolor: 'background.paper' }}>
          <Chat roomId={roomId!} />
        </Box>
      </Drawer>

      {(gameRoom?.startDateTime || gameRoom?.endDateTime) && (
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          {gameRoom.startDateTime && (
            <Typography variant="body2">
              {t('lobby.startDateTime')}: {gameRoom.startDateTime.toDate().toLocaleString()}
            </Typography>
          )}
          {gameRoom.endDateTime && (
            <Typography variant="body2">
              {t('lobby.endDateTime')}: {gameRoom.endDateTime.toDate().toLocaleString()}
            </Typography>
          )}
        </Box>
      )}

    </Container>
  );
};

export default GameScreen; 