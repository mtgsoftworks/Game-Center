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
  FormControlLabel
} from '@mui/material';
import {
  doc,
  onSnapshot,
  updateDoc,
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

  // UseEffect for Notifications and Sounds based on game state changes
  useEffect(() => {
    const prevGameRoom = prevGameRoomRef.current; // Get previous state from ref
    if (!gameRoom) return;

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
                // Double check status before declaring winner
                 const currentSnap = await getDoc(roomRef);
                 if (currentSnap.exists() && currentSnap.data().status === 'stopping') {
                   await updateDoc(roomRef, {
                      winner: winnerUid, // Current user wins
                      status: 'finished',
                      disconnectTimerStart: null // Clear timer
                   });
                   console.log("Opponent didn't return, winner declared.");
                   // Notification/sound handled by other useEffect watching status change to 'finished'
                 } else {
                    console.log("Game status changed before declaring winner via disconnect timeout.");
                 }
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
    if (!currentUser || !roomId || !gameRoom || gameRoom.creatorUid !== currentUser.uid || gameRoom.status !== 'playing' || gameRoom.winner) {
      console.warn('Cannot draw number: Invalid state, user, or game status is not playing.');
      setError(t('errorCannotDrawNumber'));
      return;
    }
    if (isDrawing) return;
    setError(null);

    const currentDrawnNumbers = gameRoom.drawnNumbers || [];
    if ((currentDrawnNumbers.length ?? 0) >= 90) {
      setError(t('errorAllNumbersDrawn'));
      return;
    }

    setIsDrawing(true);
    try {
      let nextNumber;
      const drawnSet = new Set(currentDrawnNumbers);
      do {
        nextNumber = Math.floor(Math.random() * 90) + 1;
      } while (drawnSet.has(nextNumber));

      const roomRef = doc(db, 'gameRooms', roomId);
      await updateDoc(roomRef, {
        drawnNumbers: arrayUnion(nextNumber),
        currentTurn: (gameRoom.currentTurn || 0) + 1,
      });
      console.log(`Number drawn by ${currentUser.displayName}: ${nextNumber}`);
      // After draw, check for winner
      const updatedDrawn = [...(gameRoom.drawnNumbers || []), nextNumber];
      const cardsToCheck = [
        { id: gameRoom.creatorUid, cardNumbers: gameRoom.player1Card || [] },
        { id: gameRoom.player2Uid || '', cardNumbers: gameRoom.player2Card || [] }
      ];
      const result = checkForWinner(cardsToCheck, updatedDrawn);
      if (result.winnerId) {
        await updateDoc(roomRef, {
          winner: result.winnerId,
          status: 'finished'
        });
        console.log(`Winner detected: ${result.winnerId} (${result.winType})`);
      }
      // Notification is now handled by the useEffect watching gameRoom changes

    } catch (e) {
      console.error('Error drawing number:', e);
      setError(t('errorDrawingNumber'));
      showNotification(t('errorDrawingNumber'), 'error');
    } finally {
      setIsDrawing(false);
    }
  }, [currentUser, roomId, gameRoom, isDrawing, showNotification, t]);

  // Auto-draw every 5 seconds when enabled (host only)
  useEffect(() => {
    if (!autoDrawEnabled) return;
    if (currentUser?.uid !== gameRoom?.creatorUid) return;
    if (gameRoom?.status !== 'playing' || gameRoom.winner) return;
    const interval = setInterval(() => {
      handleDrawNumber();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoDrawEnabled, currentUser?.uid, gameRoom?.status, gameRoom?.winner, handleDrawNumber, gameRoom?.creatorUid]);

  // --- Win Check Logic (Reverted to Standard Bingo Lines) ---
  const checkForWinAfterAction = useCallback(async (playerFieldName: 'markedNumbersP1' | 'markedNumbersP2', roomRef: DocumentReference<DocumentData>, updatedRoomData?: GameRoomData) => {
    const currentRoomState = updatedRoomData || gameRoom;
    // Only check if playing and no winner yet
    if (!currentRoomState || currentRoomState.status !== 'playing' || currentRoomState.winner) {
        return;
    }
    const cardNumbers = playerFieldName === 'markedNumbersP1' ? currentRoomState.player1Card : currentRoomState.player2Card;
    // Get the set of numbers MARKED by this player
    const markedNumbersSet = playerFieldName === 'markedNumbersP1' ? new Set(currentRoomState.markedNumbersP1 || []) : new Set(currentRoomState.markedNumbersP2 || []);

    if (!cardNumbers || cardNumbers.length !== 25) return; // Card not ready or invalid

    // Check for standard Bingo win using the utility function
    const hasWon = checkBingoWin(cardNumbers, markedNumbersSet);

    console.log(`Checking Standard Bingo Win for ${playerFieldName}. Won: ${hasWon}`);

    if (hasWon) {
        const winnerUid = playerFieldName === 'markedNumbersP1' ? currentRoomState.creatorUid : currentRoomState.player2Uid;
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
      console.warn('Cannot mark number: Invalid state, user, or game status is not playing.');
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
    const playerFieldName = isPlayer1 ? 'markedNumbersP1' : isPlayer2 ? 'markedNumbersP2' : null;

    if (!playerFieldName) {
      console.error('Current user is neither player 1 nor player 2.');
      return;
    }

    const roomRef = doc(db, 'gameRooms', roomId);

    // Optimistically create the potential next state for win check
    const currentMarks = gameRoom[playerFieldName] || [];
    let nextMarks;
    if (isMarking) {
        nextMarks = [...currentMarks, number];
    } else {
        nextMarks = currentMarks.filter(n => n !== number);
    }
     const potentialNextState = {
        ...gameRoom,
        [playerFieldName]: nextMarks
    };

    try {
      const updatePayload = {
        [playerFieldName]: isMarking ? arrayUnion(number) : arrayRemove(number)
      };
      await updateDoc(roomRef, updatePayload);
      console.log(`Player ${currentUser.uid} ${isMarking ? 'marked' : 'unmarked'} number ${number}`);

      // Check for win condition AFTER Firestore update is successful (using potential state)
      await checkForWinAfterAction(playerFieldName, roomRef, potentialNextState as GameRoomData);

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

  // Check if game is paused due to disconnect (now checks for 'stopping' status)
  const isGamePaused = gameRoom?.status === 'stopping';

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
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/lobby')}>
          {t('backToLobby')}
        </Button>
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
    <Container maxWidth="lg" sx={{ position: 'relative' }}>
      {/* Penalty overlay */}
      {penaltyCountdown !== null && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', bgcolor: 'rgba(0,0,0,0.7)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'white' }}>
          <Typography variant="h4">Ceza yediniz, {penaltyCountdown} sn bekleyin</Typography>
        </Box>
      )}
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          {t('gameTitleBasic')}
          {isPlayer1 && (
            <>
              <Box component="span" sx={{ ml: 1 }}>{`${t('roomLabel')}: ${roomId!}`}</Box>
              <IconButton size="small" onClick={() => { navigator.clipboard.writeText(roomId!); showNotification(t('copiedCode'), 'success'); }} sx={{ ml: 1 }}>
                <ContentCopyIcon fontSize="inherit" />
              </IconButton>
            </>
          )}
        </Typography>

        {/* Disconnect Countdown Alert - Show only when 'stopping' */}
        {gameRoom.status === 'stopping' && disconnectCountdown !== null && (
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
          {gameRoom.winner && gameRoom.status === 'finished' && (
            <Alert severity="success" sx={{ width: '100%', mt: 1 }}>{t('winner')}: {gameRoom.winner === gameRoom.creatorUid ? gameRoom.creatorName : gameRoom.player2Name}</Alert>
          )}
        </Box>

        {(gameRoom.status === 'playing' || gameRoom.status === 'stopping' || gameRoom.status === 'finished') ? (
          <>
            <NumberDraw drawnNumbers={gameRoom.drawnNumbers} />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 2,
                opacity: isGamePaused ? 0.5 : 1,
                pointerEvents: isGamePaused ? 'none' : 'auto'
              }}
            >
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
                  <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
                      <Box sx={{ p: 2, border: '1px dashed', borderColor: 'grey', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography>{t('waitingPlayer')}</Typography>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </>
        ) : gameRoom.status === 'waiting' || gameRoom.status === 'ready' ? (
          <Typography sx={{ mt: 2 }}><i>{t('Game will start once Player 2 joins and the creator starts the game.')}</i></Typography>
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

    </Container>
  );
};

export default GameScreen; 