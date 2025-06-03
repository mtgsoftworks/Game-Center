"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _Tile = _interopRequireDefault(require("./Tile"));
var _Cell = _interopRequireDefault(require("./Cell"));
var _helper = require("../helper");
var _useEvent = _interopRequireDefault(require("../hooks/useEvent"));
var _GameOverlay = _interopRequireDefault(require("./GameOverlay"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const BoardView = () => {
  const [board, setBoard] = (0, _react.useState)(new _helper.Board());
  const handleKeyDown = event => {
    if (board.hasWon()) {
      return;
    }
    if (event.keyCode >= 37 && event.keyCode <= 40) {
      let direction = event.keyCode - 37;
      let boardClone = Object.assign(Object.create(Object.getPrototypeOf(board)), board);
      let newBoard = boardClone.move(direction);
      setBoard(newBoard);
    }
  };
  (0, _useEvent.default)("keydown", handleKeyDown);
  const cells = board.cells.map((row, rowIndex) => {
    return /*#__PURE__*/_react.default.createElement("div", {
      key: rowIndex
    }, row.map((col, colIndex) => {
      return /*#__PURE__*/_react.default.createElement(_Cell.default, {
        key: rowIndex * board.size + colIndex
      });
    }));
  });
  const tiles = board.tiles.filter(tile => tile.value !== 0).map((tile, index) => {
    return /*#__PURE__*/_react.default.createElement(_Tile.default, {
      tile: tile,
      key: index
    });
  });
  const resetGame = () => {
    setBoard(new _helper.Board());
  };
  return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
    className: "details-box"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "resetButton",
    onClick: resetGame
  }, "New Game"), /*#__PURE__*/_react.default.createElement("div", {
    className: "score-box"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "score-header"
  }, "PUNTOS"), /*#__PURE__*/_react.default.createElement("div", null, board.score))), /*#__PURE__*/_react.default.createElement("div", {
    className: "board"
  }, cells, tiles, /*#__PURE__*/_react.default.createElement(_GameOverlay.default, {
    onRestart: resetGame,
    board: board
  })));
};
var _default = exports.default = BoardView;