"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _tryAgain = _interopRequireDefault(require("../assets/img/try-again.gif"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const GameOverlay = _ref => {
  let {
    onRestart,
    board
  } = _ref;
  if (board.hasWon()) {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "tile2048"
    });
  } else if (board.hasLost()) {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "gameOver",
      onClick: onRestart
    }, /*#__PURE__*/_react.default.createElement("img", {
      src: _tryAgain.default,
      alt: "Int\xE9ntalo de nuevo!!",
      style: {
        width: "100%",
        height: "100%",
        cursor: "pointer"
      }
    }));
  }
  return null;
};
var _default = exports.default = GameOverlay;