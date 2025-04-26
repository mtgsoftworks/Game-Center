// src/utils/websocket.js
let socket;

export function connectWebSocket(channel, onMessage) {
  socket = new WebSocket(`ws://localhost:8080/${channel}`);

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  return socket;
}

export function sendMessage(channel, message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const data = JSON.stringify({ channel, message });
    socket.send(data);
  }
}