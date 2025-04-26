import React from "react";
/**
 * Game2048 uygulamasının giriş noktası
 * - BoardView bileşenini render eder
 */
import ReactDOM from "react-dom/client";
import BoardView from "./components/Board";
import "./main.scss";
import "./styles.scss";

/**
 * Game2048 bileşeni
 * - Oyun bileşenlerini bir arada gösterir
 */
const Game2048 = () => {
  return <BoardView />;
};

/**
 * Uygulamayı root elementine bağlıyor ve render ediyor
 */
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <h1>2048</h1>
    <Game2048 />
  </>
);

export default Game2048;
