import React from 'react';

/**
 * Cell bileşeni
 * - Boş bir hücre render eder (oyun tahtasındaki boş alanlar).
 * @returns {JSX.Element}
 */
const Cell = ({ id }) => {
  return <span className="cell"></span>;
};

export default Cell;
