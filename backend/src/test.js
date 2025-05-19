const fastify = require('fastify')({ logger: true });
const websocketPlugin = require('@fastify/websocket');

// Register WebSocket support
fastify.register(websocketPlugin);

// Store connected clients
const clients = new Set();

// WebSocket route
fastify.register(async function (fastify) {
  fastify.get('/chat', { websocket: true }, (socket, req) => {
    // Add new client to the set
    clients.add(socket);
    console.log('New client connected. Total clients:', clients.size);

    // Message handler
    socket.on('message', (message) => {
      console.log('Received message:', message.toString());
      
      // Broadcast to all clients
      for (const client of clients) {
        if (client.readyState === client.OPEN) {
          client.send(message.toString());
        }
      }
    });

    // Close handler
    socket.on('close', () => {
      clients.delete(socket);
      console.log('Client disconnected. Total clients:', clients.size);
    });
  });
});

// Start the server
const start = async () => {
  try {
    await fastify.listen({host: '0.0.0.0', port: 3000 });
    console.log('Server listening on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();