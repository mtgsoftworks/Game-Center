/**
 * src/components/Game/GameRoom.tsx: Oyun odası arayüzünü ve oyuncu durumunu yöneten bileşen.
 * Oda içindeki oyuncuları, bağlantı durumlarını ve oyun başlangıcını yönetir.
 *
 * @returns {JSX.Element} Oyun odası arayüzü.
 */
import React from 'react';
import Board from './Board';
import OpponentProgress from './OpponentProgress';
import { useGame } from '../../hooks/useGame';

const GameRoom: React.FC = () => {
  const {
    gameState,
    playerBoard,
    marks,
    countdown,
    message,
    setMessage,
    handleNumberMark,
    handleReadyClick,
    handleSendMessage,
  } = useGame();

  if (!gameState || !playerBoard) {
    return <div className="text-center p-4">Yükleniyor...</div>;
  }

  // renderStatus fonksiyonu: Oyun durumuna göre kullanıcıya bilgilendirici mesajlar gösterir
  const renderStatus = () => {
    switch (gameState.status) {
      case 'waiting':
        // Oyun başlamasını beklerken gösterilen mesaj
        return <div className="bg-yellow-100 p-4 rounded mb-4">Oyun başlaması bekleniyor...</div>;
      case 'countdown':
        // Oyun başlamadan önce geri sayım mesajı
        return <div className="bg-blue-100 p-4 rounded mb-4">Oyun {countdown} saniye içinde başlayacak...</div>;
      case 'playing':
        // Oyun oynanırken gösterilen durum
        return (
          <div className="bg-green-100 p-4 rounded mb-4">
            Oyun devam ediyor... ({gameState.drawnNumbers.length} numara çekildi)
          </div>
        );
      case 'finished':
        // Oyun bittiğinde gösterilen mesaj
        return <div className="bg-purple-100 p-4 rounded mb-4">Oyun bitti!</div>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      {renderStatus()}

      // Board bileşeni: Kullanıcıya kendi kartını ve işaretli numaraları gösterir
      <Board
        board={playerBoard}
        marks={marks}
        drawnNumbers={gameState.drawnNumbers}
        onMark={handleNumberMark}
      />

      <div className="mb-4">
        <button
          onClick={handleReadyClick}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Hazır
        </button>
      </div>

      <OpponentProgress players={gameState.players} />

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Çekilen Sayılar</h3>
        <div className="flex flex-wrap gap-2">
          {gameState.drawnNumbers
            .slice()
            .sort((a, b) => a - b)
            .map((n) => (
              <span
                key={n}
                className={`inline-block px-3 py-1 rounded-full text-sm ${
                  n === gameState.currentNumber ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {n}
              </span>
            ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Sohbet</h3>
        <div className="h-64 overflow-y-auto mb-4 space-y-2">
          {gameState.messages && Object.values(gameState.messages).map((msg) => (
            <div key={msg.id} className="p-2 rounded bg-gray-100">
              <div className="text-sm font-semibold">{msg.userName}</div>
              <div>{msg.text}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Bir mesaj yazın..."
            className="flex-1 p-2 border rounded"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;