"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface GameProps {
  navigateTo: (page: string) => void;
}

interface Player {
  id: string;
  name: string;
  score: number;
  paddleY: number;
  paddleSpeed: number;
}

interface Ball {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  speed: number;
}

interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  gameOver: boolean;
  winner: string | null;
}

interface Particle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  maxLife: number;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_RADIUS = 8;
const PADDLE_SPEED = 3;
const BALL_SPEED = 2;
const DEFAULT_WINNING_SCORE = 10;

export default function Game({ navigateTo }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const keysPressed = useRef<Set<string>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  const [player1Name, setPlayer1Name] = useState<string>('');
  const [player2Name, setPlayer2Name] = useState<string>('');
  const [winningScore, setWinningScore] = useState<number>(DEFAULT_WINNING_SCORE);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  
  const [players, setPlayers] = useState<Player[]>([
    {
      id: 'player1',
      name: '',
      score: 0,
      paddleY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      paddleSpeed: PADDLE_SPEED
    },
    {
      id: 'player2',
      name: '',
      score: 0,
      paddleY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      paddleSpeed: PADDLE_SPEED
    }
  ]);

  const [ball, setBall] = useState<Ball>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    velocityX: BALL_SPEED,
    velocityY: BALL_SPEED,
    speed: BALL_SPEED
  });

  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    gameOver: false,
    winner: null
  });

  // Create particles for effects
  const createParticles = useCallback((x: number, y: number, count: number = 8) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        x,
        y,
        velocityX: (Math.random() - 0.5) * 4,
        velocityY: (Math.random() - 0.5) * 4,
        life: 30,
        maxLife: 30
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Update particles
  const updateParticles = useCallback(() => {
    setParticles(prev => 
      prev.map(particle => ({
        ...particle,
        x: particle.x + particle.velocityX,
        y: particle.y + particle.velocityY,
        life: particle.life - 1,
        velocityX: particle.velocityX * 0.98,
        velocityY: particle.velocityY * 0.98
      })).filter(particle => particle.life > 0)
    );
  }, []);

  // Fullscreen functionality
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Reset ball to center
  const resetBall = useCallback(() => {
    setBall({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      velocityX: Math.random() > 0.5 ? BALL_SPEED : -BALL_SPEED,
      velocityY: (Math.random() - 0.5) * BALL_SPEED,
      speed: BALL_SPEED
    });
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
      
      // Pause/Resume game
      if (e.key === ' ' && gameStarted && !gameState.gameOver) {
        e.preventDefault();
        setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
      }

      // Fullscreen toggle
      if (e.key === 'f' && gameStarted) {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, gameState.gameOver, toggleFullscreen]);

  // Update paddle positions based on input
  const updatePaddles = useCallback(() => {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      
      // Player 1 controls (W/S)
      if (keysPressed.current.has('w')) {
        newPlayers[0].paddleY = Math.max(0, newPlayers[0].paddleY - PADDLE_SPEED);
      }
      if (keysPressed.current.has('s')) {
        newPlayers[0].paddleY = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newPlayers[0].paddleY + PADDLE_SPEED);
      }
      
      // Player 2 controls (Arrow Up/Down)
      if (keysPressed.current.has('arrowup')) {
        newPlayers[1].paddleY = Math.max(0, newPlayers[1].paddleY - PADDLE_SPEED);
      }
      if (keysPressed.current.has('arrowdown')) {
        newPlayers[1].paddleY = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newPlayers[1].paddleY + PADDLE_SPEED);
      }
      
      return newPlayers;
    });
  }, []);

  // Ball collision detection
  const checkCollisions = useCallback(() => {
    setBall(prevBall => {
      let newBall = { ...prevBall };
      
      // Top and bottom wall collisions
      if (newBall.y - BALL_RADIUS <= 0 || newBall.y + BALL_RADIUS >= CANVAS_HEIGHT) {
        newBall.velocityY = -newBall.velocityY;
        newBall.y = newBall.y - BALL_RADIUS <= 0 ? BALL_RADIUS : CANVAS_HEIGHT - BALL_RADIUS;
        createParticles(newBall.x, newBall.y, 6);
      }
      
      // Paddle collisions
      const player1Paddle = players[0];
      const player2Paddle = players[1];
      
      // Left paddle (Player 1)
      if (newBall.x - BALL_RADIUS <= PADDLE_WIDTH && 
          newBall.y >= player1Paddle.paddleY && 
          newBall.y <= player1Paddle.paddleY + PADDLE_HEIGHT &&
          newBall.velocityX < 0) {
        newBall.velocityX = Math.abs(newBall.velocityX);
        newBall.x = PADDLE_WIDTH + BALL_RADIUS;
        
        // Add spin based on where ball hits paddle
        const hitPos = (newBall.y - player1Paddle.paddleY) / PADDLE_HEIGHT;
        newBall.velocityY = (hitPos - 0.5) * BALL_SPEED * 2;
        createParticles(newBall.x, newBall.y, 8);
      }
      
      // Right paddle (Player 2)
      if (newBall.x + BALL_RADIUS >= CANVAS_WIDTH - PADDLE_WIDTH && 
          newBall.y >= player2Paddle.paddleY && 
          newBall.y <= player2Paddle.paddleY + PADDLE_HEIGHT &&
          newBall.velocityX > 0) {
        newBall.velocityX = -Math.abs(newBall.velocityX);
        newBall.x = CANVAS_WIDTH - PADDLE_WIDTH - BALL_RADIUS;
        
        // Add spin based on where ball hits paddle
        const hitPos = (newBall.y - player2Paddle.paddleY) / PADDLE_HEIGHT;
        newBall.velocityY = (hitPos - 0.5) * BALL_SPEED * 2;
        createParticles(newBall.x, newBall.y, 8);
      }
      
      return newBall;
    });
  }, [players, createParticles]);

  // Check for scoring
  const checkScoring = useCallback(() => {
    if (ball.x < -BALL_RADIUS) {
      // Player 2 scores
      setPlayers(prev => {
        const newPlayers = [...prev];
        newPlayers[1].score += 1;
        return newPlayers;
      });
      createParticles(CANVAS_WIDTH * 0.75, CANVAS_HEIGHT / 2, 15);
      resetBall();
    } else if (ball.x > CANVAS_WIDTH + BALL_RADIUS) {
      // Player 1 scores
      setPlayers(prev => {
        const newPlayers = [...prev];
        newPlayers[0].score += 1;
        return newPlayers;
      });
      createParticles(CANVAS_WIDTH * 0.25, CANVAS_HEIGHT / 2, 15);
      resetBall();
    }
  }, [ball.x, resetBall, createParticles]);

  // Check for game over
  useEffect(() => {
    const maxScore = Math.max(players[0].score, players[1].score);
    if (maxScore >= winningScore) {
      const winner = players[0].score >= winningScore ? players[0].name : players[1].name;
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        gameOver: true,
        winner
      }));
      // Victory particles
      createParticles(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 25);
    }
  }, [players, winningScore, createParticles]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.gameOver) {
      if (gameState.isPlaying || gameState.gameOver) {
        updateParticles();
      }
      animationRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    // Update paddles
    updatePaddles();

    // Update ball position
    setBall(prevBall => ({
      ...prevBall,
      x: prevBall.x + prevBall.velocityX,
      y: prevBall.y + prevBall.velocityY
    }));

    // Update particles
    updateParticles();

    // Check collisions
    checkCollisions();

    // Check scoring
    checkScoring();

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, updatePaddles, updateParticles, checkCollisions, checkScoring]);

  // Start game loop
  useEffect(() => {
    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop]);

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a1a1c');
    gradient.addColorStop(1, '#161618');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw center line with glow effect
    ctx.save();
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur = 10;
    ctx.setLineDash([8, 12]);
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 20);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Draw paddles with rounded corners and glow
    ctx.save();
    ctx.shadowColor = '#fcfcfd';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#fcfcfd';
    
    // Player 1 paddle
    ctx.beginPath();
    ctx.roundRect(5, players[0].paddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
    ctx.fill();
    
    // Player 2 paddle
    ctx.beginPath();
    ctx.roundRect(CANVAS_WIDTH - PADDLE_WIDTH - 5, players[1].paddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
    ctx.fill();
    ctx.restore();

    // Draw ball with glow effect
    ctx.save();
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#fcfcfd';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    // Ball inner glow
    const ballGradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, BALL_RADIUS);
    ballGradient.addColorStop(0, '#4ade80');
    ballGradient.addColorStop(0.7, '#fcfcfd');
    ballGradient.addColorStop(1, '#d1d5db');
    ctx.fillStyle = ballGradient;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw particles
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw scores with glow
    ctx.save();
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur = 20;
    ctx.font = 'bold 64px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fcfcfd';
    ctx.fillText(players[0].score.toString(), CANVAS_WIDTH / 4, 80);
    ctx.fillText(players[1].score.toString(), (3 * CANVAS_WIDTH) / 4, 80);
    ctx.restore();

    // Draw player names
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#4ade80';
    ctx.fillText(players[0].name, CANVAS_WIDTH / 4, 110);
    ctx.fillText(players[1].name, (3 * CANVAS_WIDTH) / 4, 110);

    // Draw pause message with animation
    if (gameState.isPaused) {
      const time = Date.now() * 0.003;
      const alpha = 0.8 + Math.sin(time) * 0.2;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 20;
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fcfcfd';
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.font = 'bold 16px monospace';
      ctx.fillText('Press SPACE to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
      ctx.restore();
    }

    // Draw game over animation
    if (gameState.gameOver) {
      const time = Date.now() * 0.002;
      const scale = 1 + Math.sin(time) * 0.1;
      
      ctx.save();
      ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
      ctx.scale(scale, scale);
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 30;
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#4ade80';
      ctx.fillText('🏆 VICTORY! 🏆', 0, 0);
      ctx.restore();
    }
  }, [players, ball, gameState.isPaused, gameState.gameOver, particles]);

  const startGame = () => {
    if (!player1Name.trim() || !player2Name.trim()) {
      alert('Please enter names for both players');
      return;
    }

    setPlayers(prev => [
      { ...prev[0], name: player1Name.trim() },
      { ...prev[1], name: player2Name.trim() }
    ]);

    setGameStarted(true);
    setGameState({
      isPlaying: true,
      isPaused: false,
      gameOver: false,
      winner: null
    });
    resetBall();
  };

  const resetGame = () => {
    setPlayers(prev => [
      { ...prev[0], score: 0, paddleY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
      { ...prev[1], score: 0, paddleY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 }
    ]);
    setGameState({
      isPlaying: true,
      isPaused: false,
      gameOver: false,
      winner: null
    });
    setParticles([]);
    resetBall();
  };

  const backToMenu = () => {
    setGameStarted(false);
    setGameState({
      isPlaying: false,
      isPaused: false,
      gameOver: false,
      winner: null
    });
    setPlayer1Name('');
    setPlayer2Name('');
    setParticles([]);
  };

  if (!gameStarted) {
    return (
      <div className="page-container">
        <div className="play-content">
          <div className="play-section">
            <div className="hero-gradient">
              <div className="hero-container solid-effect">
                <h1 className="hero-title">Local Multiplayer Pong</h1>
                <p className="hero-subtitle">
                  Two players, one keyboard. Enter your names to begin the battle!
                </p>
                
                <div className="form-grid" style={{ maxWidth: '400px', margin: '40px auto' }}>
                  <div className="form-group">
                    <label className="form-label">Player 1 Name (W/S keys)</label>
                    <div className="input-gradient">
                      <input
                        type="text"
                        value={player1Name}
                        onChange={(e) => setPlayer1Name(e.target.value)}
                        placeholder="Enter Player 1 name"
                        className="form-input"
                        maxLength={20}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Player 2 Name (Arrow keys)</label>
                    <div className="input-gradient">
                      <input
                        type="text"
                        value={player2Name}
                        onChange={(e) => setPlayer2Name(e.target.value)}
                        placeholder="Enter Player 2 name"
                        className="form-input"
                        maxLength={20}
                      />
                    </div>
                  </div>
                </div>

                <div className="hero-actions">
                  <div className="button-gradient">
                    <button onClick={startGame} className="btn btn-primary">
                      Start Game
                    </button>
                  </div>
                  <div className="button-gradient">
                    <button onClick={() => navigateTo('play')} className="btn btn-secondary">
                      Back to Game Menu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="play-content">
        <div className="play-section">
          <div className="hero-gradient">
            <div className="hero-container solid-effect">
              {gameState.gameOver ? (
                <div style={{ textAlign: 'center' }}>
                  <h1 className="hero-title">Game Over!</h1>
                  <p className="hero-subtitle" style={{ fontSize: '2rem', color: '#4ade80', margin: '20px 0' }}>
                    🏆 {gameState.winner} Wins! 🏆
                  </p>
                  <p className="hero-subtitle">
                    Final Score: {players[0].name} {players[0].score} - {players[1].score} {players[1].name}
                  </p>
                  <div className="hero-actions">
                    <div className="button-gradient">
                      <button onClick={resetGame} className="btn btn-primary">
                        Play Again
                      </button>
                    </div>
                    <div className="button-gradient">
                      <button onClick={backToMenu} className="btn btn-secondary">
                        New Game
                      </button>
                    </div>
                    <div className="button-gradient">
                      <button onClick={() => navigateTo('play')} className="btn btn-secondary">
                        Game Menu
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div 
                    ref={containerRef}
                    style={{ 
                      marginBottom: '20px', 
                      position: 'relative',
                      display: 'inline-block'
                    }}
                  >
                    <canvas
                      ref={canvasRef}
                      width={CANVAS_WIDTH}
                      height={CANVAS_HEIGHT}
                      style={{
                        border: '3px solid #6b6b6e',
                        borderRadius: '16px',
                        background: '#161618',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(77, 222, 128, 0.2)',
                        transition: 'transform 0.3s ease',
                        transform: isFullscreen ? 'none' : 'scale(1)',
                      }}
                    />
                    
                    <button
                      onClick={toggleFullscreen}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(22, 22, 24, 0.8)',
                        border: '1px solid #6b6b6e',
                        borderRadius: '8px',
                        color: '#fcfcfd',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        backdropFilter: 'blur(4px)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(77, 222, 128, 0.2)';
                        e.currentTarget.style.borderColor = '#4ade80';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(22, 22, 24, 0.8)';
                        e.currentTarget.style.borderColor = '#6b6b6e';
                      }}
                    >
                      {isFullscreen ? '🗗 Exit Fullscreen' : '🗖 Fullscreen'}
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '20px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p className="form-label">Player 1 Controls</p>
                      <p style={{ color: '#fcfcfd', fontSize: '14px' }}>W - Move Up<br/>S - Move Down</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p className="form-label">Player 2 Controls</p>
                      <p style={{ color: '#fcfcfd', fontSize: '14px' }}>↑ - Move Up<br/>↓ - Move Down</p>
                    </div>
                  </div>

                  <p className="text-white mb-5">
                    Press <strong>SPACE</strong> to pause/resume • Press <strong>F</strong> for fullscreen • First to {winningScore} wins!
                  </p>

                  <div className="hero-actions">
                    <div className="button-gradient">
                      <button 
                        onClick={() => setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }))}
                        className="btn"
                      >
                        {gameState.isPaused ? 'Resume' : 'Pause'}
                      </button>
                    </div>
                    <div className="button-gradient">
                      <button onClick={resetGame} className="btn">
                        Reset Game
                      </button>
                    </div>
                    <div className="button-gradient">
                      <button onClick={backToMenu} className="btn btn-secondary">
                        New Game
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}