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
    return <div className="text-center p-4">Loading...</div>;
  }

  const renderStatus = () => {
    switch (gameState.status) {
      case 'waiting':
        return <div className="bg-yellow-100 p-4 rounded mb-4">Waiting for game to start...</div>;
      case 'countdown':
        return <div className="bg-blue-100 p-4 rounded mb-4">Game starting in {countdown} seconds...</div>;
      case 'playing':
        return (
          <div className="bg-green-100 p-4 rounded mb-4">
            Game in progress... ({gameState.drawnNumbers.length} numbers drawn)
          </div>
        );
      case 'finished':
        return <div className="bg-purple-100 p-4 rounded mb-4">Game finished!</div>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      {renderStatus()}

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
          Ready
        </button>
      </div>

      <OpponentProgress players={gameState.players} />

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Drawn Numbers</h3>
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
        <h3 className="text-lg font-semibold mb-4">Chat</h3>
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
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;