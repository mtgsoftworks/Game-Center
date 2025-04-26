import React from "react";
import PropTypes from "prop-types";

/**
 * Tile bileşeni
 * - Tek bir karo hücresini render eder ve animasyon sınıflarını belirler.
 * @param {object} tile - Karo objesi: değer, konum ve animasyon bilgisi.
 * @returns {JSX.Element}
 */
const Tile = ({ tile }) => {
  let classArray = ["tile"];
  classArray.push("tile" + tile.value);
  if (!tile.mergedInto) {
    classArray.push(`position_${tile.row}_${tile.column}`);
  }
  if (tile.mergedInto) {
    classArray.push("merged");
  }
  if (tile.isNew()) {
    classArray.push("new");
  }
  if (tile.hasMoved()) {
    classArray.push(`row_from_${tile.fromRow()}_to_${tile.toRow()}`);
    classArray.push(`column_from_${tile.fromColumn()}_to_${tile.toColumn()}`);
    classArray.push("isMoving");
  }

  let classes = classArray.join(" ");
  return <span className={classes}></span>;
};

/**
 * PropTypes tanımı
 */
Tile.propTypes = {
  tile: PropTypes.shape({
    value: PropTypes.number.isRequired,
    row: PropTypes.number.isRequired,
    column: PropTypes.number.isRequired,
    mergedInto: PropTypes.object,
    isNew: PropTypes.func.isRequired,
    hasMoved: PropTypes.func.isRequired,
    fromRow: PropTypes.func.isRequired,
    fromColumn: PropTypes.func.isRequired,
    toRow: PropTypes.func.isRequired,
    toColumn: PropTypes.func.isRequired,
  }).isRequired,
};

export default Tile;
