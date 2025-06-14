const Game = require('./Game');
const UserModel = require('../models/models.users');

class GameManager {
    constructor(db) {
        this.db = db;
        this.queue = [];
        this.games = new Map(); // Maps a player's ID to their game instance
        // --- NEW --- Map sockets directly to player IDs for reliable lookups
        this.socketToPlayerId = new Map();
        console.log("GameManager initialized.");
    }

    addPlayer(player) {
        if (this.queue.some(p => p.id === player.id) || this.games.has(player.id)) {
            console.log(`Player ${player.id} is already in the queue or a game.`);
            player.socket.send(JSON.stringify({ type: 'error', payload: 'Already in queue or game.' }));
            return;
        }

        console.log(`Player ${player.name} (${player.id}) added to the matchmaking queue.`);
        this.socketToPlayerId.set(player.socket, player.id);
        this.queue.push(player);
        this._tryStartGame();
    }

    removePlayer(socket) {
        const playerId = this.socketToPlayerId.get(socket);
        if (!playerId) return; // Socket was not associated with a player

        // Remove from queue
        const queueIndex = this.queue.findIndex(p => p.id === playerId);
        if (queueIndex > -1) {
            this.queue.splice(queueIndex, 1);
            console.log(`Player ${playerId} removed from queue.`);
        }

        // Find and stop any active game they are in
        const game = this.games.get(playerId);
        if (game) {
            console.log(`Player ${playerId} from an active game disconnected. Stopping game.`);
            game.stop(); // This will trigger onGameOver which handles cleanup
        }
        
        this.socketToPlayerId.delete(socket);
    }
    
    handlePlayerInput(socket, data) {
        const playerId = this.socketToPlayerId.get(socket);
        const game = this.games.get(playerId);
        
        if (game && playerId) {
            game.handlePlayerInput(playerId, data);
        }
    }

    _tryStartGame() {
        if (this.queue.length >= 2) {
            console.log("Two players in queue. Starting a new game.");
            const player1 = this.queue.shift();
            const player2 = this.queue.shift();

            const onGameOver = async (winnerId, loserId) => {
                console.log(`Game over. Winner: ${winnerId}, Loser: ${loserId}`);
                await UserModel.user_add_win(this.db, winnerId);
                await UserModel.user_add_loss(this.db, loserId);

                this.games.delete(player1.id);
                this.games.delete(player2.id);
                console.log("Game instance cleaned up.");
            };
            
            const game = new Game(player1, player2, onGameOver);
            this.games.set(player1.id, game);
            this.games.set(player2.id, game);
            
            game.start();
        }
    }
}

module.exports = GameManager;
