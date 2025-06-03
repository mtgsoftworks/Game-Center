"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useEvent;
var _react = require("react");
function useEvent(event, handler) {
  let passive = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  (0, _react.useEffect)(() => {
    window.addEventListener(event, handler, passive);
    return function cleanUp() {
      window.removeEventListener(event, handler, passive);
    };
  });
}