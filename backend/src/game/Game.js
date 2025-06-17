
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const BALL_RADIUS = 10;

class Game {
    constructor(player1, player2, onGameOver) {
        this.player1 = player1;
        this.player2 = player2;
        this.onGameOver = onGameOver; // Callback to notify the manager when the game ends

        this.ball = {
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            dx: 5,
            dy: 5,
            radius: BALL_RADIUS,
        };

        this.paddles = {
            [this.player1.id]: { x: 0, y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT },
            [this.player2.id]: { x: CANVAS_WIDTH - PADDLE_WIDTH, y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT },
        };

        this.score = { [this.player1.id]: 0, [this.player2.id]: 0 };
        this.interval = null;
    }

    // Sends the current game state to both players
    broadcast(type, payload) {
        const message = JSON.stringify({ type, payload });
        this.player1.socket.send(message);
        this.player2.socket.send(message);
    }

    // The main game loop
    update() {
        // Move the ball
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Wall collision (top/bottom)
        if (this.ball.y + this.ball.radius > CANVAS_HEIGHT || this.ball.y - this.ball.radius < 0) {
            this.ball.dy *= -1;
        }

        // Paddle collision
        const paddle1 = this.paddles[this.player1.id];
        const paddle2 = this.paddles[this.player2.id];

        // Player 1 paddle collision
        if (this.ball.x - this.ball.radius < paddle1.x + paddle1.width && this.ball.y > paddle1.y && this.ball.y < paddle1.y + paddle1.height) {
            this.ball.dx *= -1;
        }

        // Player 2 paddle collision
        if (this.ball.x + this.ball.radius > paddle2.x && this.ball.y > paddle2.y && this.ball.y < paddle2.y + paddle2.height) {
            this.ball.dx *= -1;
        }

        // Score points
        if (this.ball.x + this.ball.radius < 0) { // Player 2 scores
            this.score[this.player2.id]++;
            this.resetBall();
        } else if (this.ball.x - this.ball.radius > CANVAS_WIDTH) { // Player 1 scores
            this.score[this.player1.id]++;
            this.resetBall();
        }

        // Check for winner
        if (this.score[this.player1.id] >= 11 || this.score[this.player2.id] >= 11) {
            this.stop();
            return;
        }

        this.broadcast('gameState', { paddles: this.paddles, ball: this.ball, score: this.score });
    }

    resetBall() {
        this.ball.x = CANVAS_WIDTH / 2;
        this.ball.y = CANVAS_HEIGHT / 2;
        this.ball.dx *= -1; // Change direction for the next serve
    }
    
    // Called from the GameManager when a player moves their paddle
    handlePlayerInput(playerId, data) {
        if (this.paddles[playerId]) {
            this.paddles[playerId].y = data.y;
        }
    }

    start() {
        this.broadcast('gameStart', {
            player1: { id: this.player1.id, name: this.player1.name },
            player2: { id: this.player2.id, name: this.player2.name }
        });
        this.interval = setInterval(() => this.update(), 1000 / 60); // 60 FPS
    }

    stop() {
        clearInterval(this.interval);
        const winnerId = this.score[this.player1.id] >= 11 ? this.player1.id : this.player2.id;
        const loserId = winnerId === this.player1.id ? this.player2.id : this.player1.id;
        
        this.broadcast('gameOver', { winner: winnerId, score: this.score });
        
        // Notify the manager so it can clean up and update stats
        if (this.onGameOver) {
            this.onGameOver(winnerId, loserId);
        }
    }
}

module.exports = Game;
