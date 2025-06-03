/**
 * src/index.js: 2048 oyununun giriş noktası. React ağacını oluşturur ve Game2048 bileşenini render eder.
 */

/**
 * Game2048 uygulamasının giriş noktası.
 * BoardView ana oyun bileşenini ekrana yerleştirir.
 * Ana başlık ve oyun arayüzünü render eder.
 */
import React from "react";
// ReactDOM: JSON benzeri JSX ağacını gerçek DOM'a çevirir
import ReactDOM from "react-dom/client";
// BoardView: oyun tahtası görünüm bileşeni
import BoardView from "./components/Board";
import "./main.scss";
import "./styles.scss";

/**
 * Game2048 bileşeni: başlık ve oyun tahtası görünümünü içerir.
 */
const Game2048 = () => {
  // Başlık ve BoardView bileşenini render eder
  return (
    <>
      <h1>2048</h1>
      <BoardView />
    </>
  );
};

/**
 * Uygulamayı root elementine render eder
 */
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Game2048 />
);

// Varsayılan olarak Game2048 bileşenini dışa aktarır
export default Game2048;
