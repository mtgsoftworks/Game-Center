/**
 * BoardView bileşeni
 * Oyun tahtasını ve tuş girişlerini yönetir, skoru günceller ve oyun arayüzünü oluşturur.
 * @returns {JSX.Element} Oyun tahtası ve kontrol arayüzü.
 */
import React, { useState, useRef, useEffect } from 'react';
import Tile from "./Tile";
import Cell from "./Cell";
import { Board } from "../helper";
import useEvent from "../hooks/useEvent";
import GameOverlay from "./GameOverlay";
import { postGame2048Stat } from '../services/firebase';

// Oyun tahtası bileşeni
const BoardView = () => {
  // Oyun tahtası durumunu tutan state
  const [board, setBoard] = useState(new Board());
  const startTimeRef = useRef(Date.now());
  const [statPosted, setStatPosted] = useState(false);

  // Klavye ile yön tuşlarına basıldığında oyunun hareketini yöneten fonksiyon
  // Eğer oyun kazanıldıysa (2048'e ulaşıldıysa) hiçbir işlem yapılmaz.
  // 37-40 arası keyCode: Sol, Yukarı, Sağ, Aşağı yön tuşlarıdır.
  const handleKeyDown = (event) => {
    if (board.hasWon()) {
      return;
    }

    if (event.keyCode >= 37 && event.keyCode <= 40) {
      // Yönü belirle (0: sol, 1: yukarı, 2: sağ, 3: aşağı)
      let direction = event.keyCode - 37;
      // Board nesnesinin klonunu oluştur
      let boardClone = Object.assign(
        Object.create(Object.getPrototypeOf(board)),
        board
      );
      // Hareketi gerçekleştir ve yeni board'u ata
      let newBoard = boardClone.move(direction);
      setBoard(newBoard);
    }
  };

  // useEvent: Belirtilen olaya (keydown) fonksiyonu bağlar.
  useEvent("keydown", handleKeyDown);

  // Tüm hücreleri (cell) oluşturur
  const cells = board.cells.map((row, rowIndex) => {
    return (
      <div key={rowIndex}>
        {row.map((col, colIndex) => {
          // Her satır ve sütun için Cell bileşeni oluşturulur
          return <Cell key={rowIndex * board.size + colIndex} />;
        })}
      </div>
    );
  });

  // Tahtadaki taşları (tile) oluşturur
  const tiles = board.tiles
    .filter((tile) => tile.value !== 0)
    .map((tile, index) => {
      return <Tile tile={tile} key={index} />;
    });

  // Oyunu sıfırlayan fonksiyon
  const resetGame = () => {
    // Süreyi resetle ve istatistik gönderimini yeniden aktif et
    startTimeRef.current = Date.now();
    setStatPosted(false);
    setBoard(new Board());
  };

  // Oyun bittiğinde istatistik kaydet
  useEffect(() => {
    if (!statPosted && (board.hasWon() || board.hasLost())) {
      const duration = Date.now() - startTimeRef.current;
      const success = board.hasWon();
      postGame2048Stat({ score: board.score, duration, success })
        .then(id => console.log('2048 stat saved, id:', id))
        .catch(err => console.error('Error saving 2048 stat:', err));
      setStatPosted(true);
    }
  }, [board, statPosted]);

  return (
    <div>
      <div className="details-box">
        <div className="resetButton" onClick={resetGame}>
          Yeni Oyun
        </div>
        <div className="score-box">
          <div className="score-header">PUAN</div>
          <div className="score-value">{board.score}</div>
        </div>
      </div>
      <div className="board">
        {cells}
        {tiles}
      </div>
      {/* Oyun bittiğinde veya kazanıldığında üstte gösterilen arayüz */}
      <GameOverlay board={board} resetGame={resetGame} />
    </div>
  );
};

export default BoardView;
