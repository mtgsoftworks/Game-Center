import React from 'react';
import PropTypes from 'prop-types';
import TryAgainLogo from "../assets/img/try-again.gif";

/**
 * GameOverlay bileşeni
 * - Oyun kazanıldığında veya kaybedildiğinde ekranda gösterilen katman.
 * @param {function} onRestart - Oyunu yeniden başlatma fonksiyonu.
 * @param {Board} board - Mevcut oyun tahtası örneği.
 * @returns {JSX.Element|null}
 */
const GameOverlay = ({ onRestart, board }) => {
  if (board.hasWon()) {
    return <div className="tile2048"></div>;
  } else if (board.hasLost()) {
    return (
      <div className="gameOver" onClick={onRestart}>
        <img
          src={TryAgainLogo}
          alt="Inténtalo de nuevo!!"
          style={{
            width: "100%",
            height: "100%",
            cursor: "pointer",
          }}
        />
      </div>
    );
  }

  return null;
};

/**
 * PropTypes tanımı
 */
GameOverlay.propTypes = {
  onRestart: PropTypes.func.isRequired,
  board: PropTypes.shape({
    hasWon: PropTypes.func.isRequired,
    hasLost: PropTypes.func.isRequired,
  }).isRequired,
};

export default GameOverlay;