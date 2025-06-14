import { useState, useEffect, useRef } from 'react';

// Define the shapes of the data we expect from the server
export interface GameState {
  paddles: { [key: number]: { y: number } };
  ball: { x: number; y: number };
  score: { [key:number]: number };
}

export enum GameStatus {
  Connecting = 'Connecting',
  Waiting = 'Waiting for Opponent',
  InProgress = 'In Progress',
  GameOver = 'Game Over',
  Disconnected = 'Disconnected',
}

export const useGameSocket = (accessToken: string | null) => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.Disconnected);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [winner, setWinner] = useState<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const socket = new WebSocket(`ws://localhost:13333/api/game/socket?token=${accessToken}`);
    socketRef.current = socket;
    setStatus(GameStatus.Connecting);

    socket.onopen = () => {
      setStatus(GameStatus.Waiting);
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'gameStart':
          setStatus(GameStatus.InProgress);
          setGameState(message.payload); // Initial state
          break;
        case 'gameState':
          setGameState(message.payload);
          break;
        case 'gameOver':
          setStatus(GameStatus.GameOver);
          setWinner(message.payload.winner);
          break;
      }
    };

    socket.onclose = () => {
      setStatus(GameStatus.Disconnected);
    };

    return () => {
      socket.close();
    };
  }, [accessToken]);

  // Function to send paddle movement to the server
  const movePaddle = (y: number) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'paddleMove',
        payload: { y },
      }));
    }
  };

  return { status, gameState, winner, movePaddle };
};
