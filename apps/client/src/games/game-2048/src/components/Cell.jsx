import React from 'react';

/**
 * Cell bileşeni
 * Oyun tahtasındaki boş hücreyi temsil eder.
 * Her bir kareyi (cell) ekranda gösterir.
 * @returns {JSX.Element} Boş hücre arayüzü.
 */
const Cell = ({ id }) => {
  return <span className="cell"></span>;
};

export default Cell;
