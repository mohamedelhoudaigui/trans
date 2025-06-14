// backend/src/routes/routes.game.js

const GameCtrl = require('../controllers/controllers.game.js');

async function GameRoutes(fastify, options) {
    fastify.get('/socket', {
        websocket: true,
    }, GameCtrl.GameSocket);
}

module.exports = GameRoutes;
