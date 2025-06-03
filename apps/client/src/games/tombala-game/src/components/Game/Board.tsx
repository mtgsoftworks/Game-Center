/**
 * src/components/Game/Board.tsx: Oyun tahtasını ve çekilen numaraları gösteren bileşen.
 * Tüm çekilen numaraları ve oyun durumunu kullanıcıya sunar.
 *
 * @param {object} props - Oyun tahtası ve çekilen numaralar.
 * @returns {JSX.Element} Oyun tahtası arayüzü.
 */

import React from 'react'; // React: JSX desteği

// BoardProps: oyun tahtasının matrisi ve işaret bilgileri için prop tipleri
interface BoardProps {
  board: number[][];
  marks: boolean[][];
  drawnNumbers: number[];
  onMark: (row: number, col: number) => void;
}

// Board: Tombala tahtasını ve işaretlenmiş hücreleri render eder
const Board: React.FC<BoardProps> = ({ board, marks, drawnNumbers, onMark }) => {
  // Grid konteyner: 5 sütunlu tablo düzeni
  return (
    <div className="grid grid-cols-5 gap-2 mb-4">
      {board.map((row, i) =>
        row.map((cell, j) => {
          const marked = marks[i][j];
          const drawn = drawnNumbers.includes(cell);
          // Hücre: değer, tıklama ve stil durumu
          return (
            <div
              key={`${i}-${j}`}
              onClick={() => onMark(i, j)}
              className={
                `p-4 text-center rounded-md cursor-pointer transition-all aspect-square flex items-center justify-center text-lg font-medium
                ${marked ? 'bg-indigo-600 text-white shadow-inner' : 'bg-white hover:bg-indigo-100 shadow'}
                ${drawn && !marked ? 'ring-2 ring-indigo-400 animate-pulse' : ''}`
              }
            >
              {cell}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Board;
