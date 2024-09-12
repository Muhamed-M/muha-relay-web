let socket: WebSocket | null = null;

if (process.client) {
  socket = new WebSocket('ws://localhost:8080');

  socket.onopen = () => {
    console.log('Connected to WebSocket server');
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed');
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

export default socket;
