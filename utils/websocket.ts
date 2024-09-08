let socket: WebSocket | null = null;

if (process.client) {
  socket = new WebSocket('ws://192.168.1.6/api');

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
