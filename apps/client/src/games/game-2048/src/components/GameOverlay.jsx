import React from 'react';
import PropTypes from 'prop-types';
import TryAgainLogo from "../assets/img/try-again.gif";

/**
 * GameOverlay bileşeni
 * Oyun kazanıldığında veya kaybedildiğinde ekranda gösterilen katman (overlay).
 * Kazanma durumunda kutlama, kaybetme durumunda ise yeniden dene görseli gösterir.
 * @param {function} resetGame - Oyunu yeniden başlatma fonksiyonu.
 * @param {Board} board - Mevcut oyun tahtası örneği.
 * @returns {JSX.Element|null} Oyun sonu katmanı veya null.
 */
const GameOverlay = ({ resetGame, board }) => {
  if (board.hasWon()) {
    return <div className="tile2048"></div>;
  } else if (board.hasLost()) {
    return (
      <div className="gameOver" onClick={resetGame}>
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
 * GameOverlay.propTypes: Bileşenin beklediği prop türlerini tanımlar
 */
GameOverlay.propTypes = {
  resetGame: PropTypes.func.isRequired,
  board: PropTypes.shape({
    hasWon: PropTypes.func.isRequired,
    hasLost: PropTypes.func.isRequired,
  }).isRequired,
};

export default GameOverlay;