import React from 'react';

interface BoardProps {
  board: number[][];
  marks: boolean[][];
  drawnNumbers: number[];
  onMark: (row: number, col: number) => void;
}

const Board: React.FC<BoardProps> = ({ board, marks, drawnNumbers, onMark }) => {
  return (
    <div className="grid grid-cols-5 gap-2 mb-4">
      {board.map((row, i) =>
        row.map((cell, j) => {
          const marked = marks[i][j];
          const drawn = drawnNumbers.includes(cell);
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
