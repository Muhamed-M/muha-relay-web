import authService from '~/services/auth';

let socket: WebSocket | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectDelay = 3000; // 3 seconds initial delay

// Store message handlers for proper cleanup
type MessageHandler = (event: MessageEvent) => void;
const messageHandlers = new Set<MessageHandler>();

export const createWebSocket = () => {
  if (socket && socket.readyState === WebSocket.OPEN) return socket; // Prevent reinitializing if already connected
  if (socket && socket.readyState === WebSocket.CONNECTING) return socket; // Wait for existing connection

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

  // Central message handler that dispatches to all registered handlers
  socket.onmessage = (event: MessageEvent) => {
    messageHandlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in WebSocket message handler:', error);
      }
    });
  };

  return socket;
};

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
  messageHandlers.clear();
};

export const getWebSocket = () => socket;

/**
 * Add a message handler to the WebSocket.
 * Multiple handlers can be registered and will all receive messages.
 * Returns a cleanup function to remove the handler.
 */
export const addMessageHandler = (handler: MessageHandler): (() => void) => {
  messageHandlers.add(handler);
  return () => {
    messageHandlers.delete(handler);
  };
};

/**
 * Remove a specific message handler
 */
export const removeMessageHandler = (handler: MessageHandler): void => {
  messageHandlers.delete(handler);
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

// Optionally initialize the WebSocket if the user is already logged in
if (process.client) {
  const user = authService.getUserFromCookie();
  if (user?.token) {
    createWebSocket();
  }
}
