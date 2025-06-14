// backend/src/controllers/controllers.game.js

const GameManager = require('../game/GameManager');

// Instantiate the GameManager once, passing the database connection from Fastify.
// We'll create it on the first request and then reuse it.
let gameManager;

const GameCtrl = {
    GameSocket(socket, request) {
        if (!gameManager) {
            gameManager = new GameManager(this.db);
        }

        const token = request.query.token;
        if (!token) {
            return socket.close(4001, 'Authentication token missing');
        }

        try {
            const decoded = request.server.jwt.verify(token);
            const user = decoded.payload;

            // Player object includes id, name, and the live socket
            const player = {
                id: user.id,
                name: user.name,
                socket: socket,
            };

            gameManager.addPlayer(player);

            socket.on('message', (data) => {
                const message = JSON.parse(data.toString());
                if(message.type === 'paddleMove') {
                    gameManager.handlePlayerInput(socket, message.payload);
                }
            });

            socket.on('close', () => {
                gameManager.removePlayer(socket);
            });

        } catch (err) {
            console.error('Game WebSocket auth error:', err.message);
            socket.close(4002, 'Invalid authentication token');
        }
    }
};

module.exports = GameCtrl;
