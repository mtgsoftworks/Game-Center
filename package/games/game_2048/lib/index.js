Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _client = _interopRequireDefault(require("react-dom/client"));
var _Board = _interopRequireDefault(require("./components/Board"));
require("./main.scss");
require("./styles.scss");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const Game2048 = () => {
  return /*#__PURE__*/_react.default.createElement(_Board.default, null);
};
const root = _client.default.createRoot(document.getElementById("root"));
root.render(/*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("h1", null, "2048"), /*#__PURE__*/_react.default.createElement(Game2048, null)));
var _default = exports.default = Game2048;