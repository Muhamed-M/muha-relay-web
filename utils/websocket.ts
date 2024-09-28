import authService from '~/services/auth';

let socket: WebSocket | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectDelay = 3000; // 3 seconds initial delay

export const createWebSocket = () => {
  if (socket) return socket; // Prevent reinitializing the socket

  const user = authService.getUserFromCookie();

  if (!user?.token) return;

  socket = new WebSocket(`ws://localhost:8080?token=${user.token}`);

  socket.onopen = () => {
    console.log('WebSocket connection established');
    reconnectAttempts = 0; // Reset reconnection attempts after a successful connection
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed');
    socket = null; // Reset socket on close
    if (reconnectAttempts < maxReconnectAttempts) {
      attemptReconnect(); // Try reconnecting
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    socket?.close(); // Close the socket on error
  };

  return socket;
};

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

export const getWebSocket = () => socket;

const attemptReconnect = () => {
  reconnectAttempts += 1;
  const delay = Math.min(reconnectDelay * reconnectAttempts, 30000); // Cap delay at 30 seconds

  console.log(`Attempting to reconnect (#${reconnectAttempts}) in ${delay / 1000} seconds...`);

  setTimeout(() => {
    if (reconnectAttempts < maxReconnectAttempts) {
      console.log('Reconnecting...');
      createWebSocket();
    } else {
      console.log('Max reconnection attempts reached. Giving up.');
    }
  }, delay);
};

// Optionally initialize the WebSocket if the user is already logged in
if (process.client) {
  const user = authService.getUserFromCookie();
  if (user?.token) {
    createWebSocket();
  }
}
