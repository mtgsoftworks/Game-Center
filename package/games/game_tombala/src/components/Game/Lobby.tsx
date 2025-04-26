import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, push, set, get, remove } from 'firebase/database';
import { database, auth } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Plus, LogOut, Copy, ExternalLink, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../UI/LanguageSwitcher';

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

interface GameRoom {
  id: string;
  name: string;
  roomCode: string;
  createdBy: string;
  createdAt: number;
  status: 'waiting' | 'countdown' | 'playing' | 'finished';
  players: Record<string, unknown>;
  hostId: string;
  maxPlayers: number;
}

// Explicit type for game data from RTDB snapshot
interface RtdbGameData {
  name: string;
  roomCode: string;
  players: Record<string, unknown>;
  status: 'waiting' | 'countdown' | 'playing' | 'finished';
  hostId: string;
  createdBy: string;
  createdAt: number;
  currentNumber: number | null;
  drawnNumbers: number[];
  messages: Record<string, Message>;
  winner: string | null;
  gameType: string;
  maxPlayers: number;
}

const MAX_PLAYERS = 2; // Strictly 2 players for this bingo game

const Lobby: React.FC = () => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const roomsRef = ref(database, 'games');
    const unsubscribe = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const roomsList = Object.entries(data as Record<string, RtdbGameData>).map(([id, room]) => ({
          id,
          ...room,
        }));
        setRooms(roomsList);
      } else {
        setRooms([]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim() || !currentUser) return;

    const roomCode = nanoid(8);
    const roomsRef = ref(database, 'games');
    const newRoomRef = push(roomsRef);
    
    await set(newRoomRef, {
      name: newRoomName,
      roomCode,
      players: {},
      status: 'waiting',
      hostId: currentUser.uid,
      createdBy: currentUser.uid,
      createdAt: Date.now(),
      currentNumber: null,
      drawnNumbers: [],
      messages: {},
      winner: null,
      gameType: 'bingo', // Specify game type as bingo
      maxPlayers: MAX_PLAYERS
    });

    navigate(`/game/${newRoomRef.key}`);
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setJoinError(t('lobby.enterRoomCode'));
      return;
    }

    try {
      console.log("Attempting to join room with code:", roomCode);
      
      const gamesRef = ref(database, 'games');
      const gamesSnapshot = await get(gamesRef);
      
      if (!gamesSnapshot.exists()) {
        setJoinError(t('lobby.roomNotFound'));
        return;
      }
      
      const games = gamesSnapshot.val();
      let foundRoomId: string | null = null;
      let foundRoomData: RtdbGameData | null = null;
      
      // Find the room with matching code
      for (const id in games) {
        if (Object.prototype.hasOwnProperty.call(games, id)) {
          const game = games[id] as RtdbGameData;
          if (game.roomCode === roomCode) {
            foundRoomId = id;
            foundRoomData = game;
            break;
          }
        }
      }
      
      if (!foundRoomId || !foundRoomData) {
        console.error("Room not found with code:", roomCode);
        setJoinError(t('lobby.roomNotFound'));
        return;
      }
      
      console.log("Found room:", foundRoomId);
      
      // Check if the room is full
      const players = foundRoomData.players || {};
      if (Object.keys(players).length >= MAX_PLAYERS) {
        setJoinError(t('lobby.roomIsFull', { maxPlayers: MAX_PLAYERS }));
        return;
      }
      
      // Check if the game is already in progress
      if (foundRoomData.status !== 'waiting') {
        setJoinError(t('lobby.inProgress'));
        return;
      }
      
      // All checks passed, join the room
      setJoinError('');
      setShowJoinModal(false);
      console.log("Joining room:", foundRoomId);
      navigate(`/game/${foundRoomId}`);
    } catch (error) {
      console.error("Error joining room:", error);
      setJoinError('Error joining room. Please try again.');
    }
  };

  const copyRoomCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess(t('lobby.copied'));
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (error) {
      console.error('Clipboard write failed:', error);
      setCopySuccess('Failed to copy');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete || !currentUser) return;
    
    try {
      const roomRef = ref(database, `games/${roomToDelete}`);
      const roomSnapshot = await get(roomRef);
      const room = roomSnapshot.val();
      
      if (room && room.hostId === currentUser.uid) {
        await remove(roomRef);
      }
      
      setShowDeleteConfirmModal(false);
      setRoomToDelete(null);
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-indigo-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">{t('lobby.title')}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <span className="text-gray-600">
              {t('lobby.welcome')}, {currentUser?.displayName || currentUser?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-red-600 hover:text-red-800"
            >
              <LogOut className="w-5 h-5 mr-1" />
              {t('lobby.logout')}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">{t('lobby.createRoom')}</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder={t('lobby.enterRoomName')}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  onClick={handleCreateRoom}
                  className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-200"
                >
                  <Plus className="w-5 h-5 mr-1" />
                  {t('lobby.createBingoRoom')}
                </button>
              </div>
              <div className="mt-4 p-3 bg-indigo-50 rounded text-sm text-indigo-700">
                <p>{t('lobby.bingoDescription')}</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>{t('lobby.bingoInfo1')}</li>
                  <li>{t('lobby.bingoInfo2')}</li>
                  <li>{t('lobby.bingoInfo3')}</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">{t('lobby.joinRoom')}</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  placeholder={t('lobby.enterRoomCode')}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  onClick={() => {
                    setJoinError('');
                    if (!roomCode.trim()) {
                      setJoinError(t('lobby.enterRoomCode'));
                      return;
                    }
                    handleJoinRoom();
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-200"
                >
                  <ExternalLink className="w-5 h-5 mr-1" />
                  {t('lobby.joinRoom')}
                </button>
                {joinError && <p className="text-red-500 text-sm">{joinError}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700">{t('lobby.availableRooms')}</h2>
          </div>
          
          {rooms.length === 0 ? (
            <p className="text-gray-500 italic">{t('lobby.noRooms')}</p>
          ) : (
            <ul className="space-y-4">
              {rooms.map((room) => (
                <li
                  key={room.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                >
                  <div className="flex-grow">
                    <span className="font-semibold text-gray-800">{room.name}</span>
                    {/* Display room code ONLY if current user is the host - REVERTING THIS */}
                    {/* {currentUser && room.hostId === currentUser.uid && ( */}
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500 mr-1">{t('lobby.roomCode')}:</span>
                        <span className="text-xs font-mono bg-gray-200 px-1.5 py-0.5 rounded">
                          {room.roomCode}
                        </span>
                        <button
                          onClick={() => copyRoomCode(room.roomCode)}
                          className="ml-2 text-indigo-500 hover:text-indigo-700"
                          title={t('lobby.copy')}
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {copySuccess && room.roomCode === copySuccess.split(':')[1] && (
                          <span className="ml-1 text-xs text-green-600">{t('lobby.copied')}</span>
                        )}
                      </div>
                    {/* )} */}
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 self-end md:self-center">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {Object.keys(room.players || {}).length}/{MAX_PLAYERS}
                    </span>
                    {/* Remove direct Join button from the list - Force code entry */}
                    {room.status === 'waiting' && Object.keys(room.players || {}).length < MAX_PLAYERS ? (
                      <button
                        onClick={() => navigate(`/game/${room.id}`)}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition duration-200"
                      >
                        {t('lobby.join')}
                      </button>
                    ) : (
                      <span
                        className={`px-3 py-1 text-xs rounded ${room.status !== 'waiting' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {room.status !== 'waiting' ? t('lobby.inProgressShort') : t('lobby.full')}
                      </span>
                    )}
                    {currentUser && room.hostId === currentUser.uid && (
                      <button
                        onClick={() => {
                          setRoomToDelete(room.id);
                          setShowDeleteConfirmModal(true);
                        }}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                        title={t('lobby.deleteRoom')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">{t('lobby.joinConfirm')}</h3>
            <p className="mb-4">{t('lobby.joinRoomDescription')}</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleJoinRoom}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                {t('lobby.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">{t('lobby.deleteConfirm')}</h3>
            <p className="mb-4">{t('lobby.deleteRoomDescription')}</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDeleteRoom}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {copySuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          {copySuccess}
        </div>
      )}
    </div>
  );
};

export default Lobby;