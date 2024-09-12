let socket: WebSocket | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;
const reconnectDelay = 2000; // 2 seconds initial delay

const createWebSocket = () => {
  if (socket) return socket; // Prevent reinitializing the socket

  // Example: use an auth token if needed
  // const authStore = useAuthStore();
  // const token = authStore?.user?.token;

  // socket = new WebSocket(`ws://localhost:8080?token=${token}`);
  socket = new WebSocket('http://localhost:8080');

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
};

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

if (process.client) createWebSocket();

export default socket;
