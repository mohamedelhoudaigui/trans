'use client';

import { useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGameSocket, GameStatus } from '../hooks/useGameSocket';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export default function Play() {
  const { accessToken } = useAuth();
  const { status, gameState, movePaddle } = useGameSocket(accessToken);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Keyboard Input Handler ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || !gameState) return;

      const playerPaddle = gameState.paddles[Object.keys(gameState.paddles)[0]]; // Simple assumption for now
      let newY = playerPaddle.y;

      if (e.key === 'ArrowUp') {
        newY -= 20;
      } else if (e.key === 'ArrowDown') {
        newY += 20;
      }
      
      // Clamp paddle position within canvas bounds
      newY = Math.max(0, Math.min(CANVAS_HEIGHT - 100, newY));
      
      movePaddle(newY);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, movePaddle]); // Rerun if gameState changes to get latest paddle position

  // --- Canvas Rendering Loop ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const render = () => {
      // Clear canvas
      context.fillStyle = '#161618'; // Background color
      context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw middle line
      context.fillStyle = '#6b6b6e';
      context.fillRect(CANVAS_WIDTH / 2 - 1, 0, 2, CANVAS_HEIGHT);

      if (gameState) {
        // Draw paddles
        context.fillStyle = '#fcfcfd'; // Paddle color
        for (const playerId in gameState.paddles) {
          const paddle = gameState.paddles[playerId];
          context.fillRect(playerId === Object.keys(gameState.paddles)[0] ? 0 : CANVAS_WIDTH - 10, paddle.y, 10, 100);
        }
        
        // Draw ball
        context.beginPath();
        context.arc(gameState.ball.x, gameState.ball.y, 10, 0, Math.PI * 2);
        context.fill();

        // Draw scores
        context.font = '48px "Geist Sans", sans-serif';
        context.fillText(String(gameState.score[Object.keys(gameState.score)[0]]), CANVAS_WIDTH / 4, 50);
        context.fillText(String(gameState.score[Object.keys(gameState.score)[1]]), (CANVAS_WIDTH * 3) / 4, 50);
      }

      requestAnimationFrame(render);
    };
    
    render();
  }, [gameState]);

  return (
    <div className="page-container flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-white mb-4">Game Status: {status}</h1>
      
      <div className="hero-gradient">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="bg-gray-800 rounded-md"
        />
      </div>

      {status === GameStatus.GameOver && (
        <div className="mt-4 text-2xl text-green-400 font-bold">
            Game Over! Winner has been declared.
        </div>
      )}
    </div>
  );
}
