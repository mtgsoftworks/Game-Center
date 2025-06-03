Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _Board = _interopRequireDefault(require("./components/Board"));
require("./main.scss");
require("./styles.scss");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const Game2048 = () => {
  return /*#__PURE__*/_react.default.createElement(_Board.default, null);
};
var _default = exports.default = Game2048;