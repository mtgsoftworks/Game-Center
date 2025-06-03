"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const Tile = _ref => {
  let {
    tile,
    id
  } = _ref;
  let classArray = ["tile"];
  classArray.push("tile" + tile.value);
  if (!tile.mergedInto) {
    classArray.push("position_".concat(tile.row, "_").concat(tile.column));
  }
  if (tile.mergedInto) {
    classArray.push("merged");
  }
  if (tile.isNew()) {
    classArray.push("new");
  }
  if (tile.hasMoved()) {
    classArray.push("row_from_".concat(tile.fromRow(), "_to_").concat(tile.toRow()));
    classArray.push("column_from_".concat(tile.fromColumn(), "_to_").concat(tile.toColumn()));
    classArray.push("isMoving");
  }
  let classes = classArray.join(" ");
  return /*#__PURE__*/_react.default.createElement("span", {
    className: classes
  });
};
var _default = exports.default = Tile;