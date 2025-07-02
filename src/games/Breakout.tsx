import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  visible: boolean;
}

export const BreakoutGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameOver' | 'won'>('playing');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [started, setStarted] = useState(false);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PADDLE_WIDTH = 100;
  const PADDLE_HEIGHT = 20;
  const BALL_RADIUS = 8;
  const BRICK_ROWS = 5;
  const BRICK_COLS = 10;
  const BRICK_WIDTH = 75;
  const BRICK_HEIGHT = 20;
  const BRICK_PADDING = 5;

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

  const [ball, setBall] = useState<Ball>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 50,
    dx: 4,
    dy: -4,
    radius: BALL_RADIUS
  });

  const [paddle, setPaddle] = useState<Paddle>({
    x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
    y: CANVAS_HEIGHT - 30,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT
  });

  const [bricks, setBricks] = useState<Brick[]>([]);

  const initializeBricks = useCallback(() => {
    const newBricks: Brick[] = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        newBricks.push({
          x: col * (BRICK_WIDTH + BRICK_PADDING) + BRICK_PADDING,
          y: row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_PADDING + 50,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: colors[row],
          visible: true
        });
      }
    }
    setBricks(newBricks);
  }, []);

  const resetBall = useCallback(() => {
    setBall({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      dx: 4,
      dy: -4,
      radius: BALL_RADIUS
    });
  }, []);

  const resetPaddle = useCallback(() => {
    setPaddle({
      x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
      y: CANVAS_HEIGHT - 30,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT
    });
  }, []);

  const checkCollision = useCallback((ball: Ball, paddle: Paddle, bricks: Brick[]) => {
    // Ball collision with walls
    if (ball.x + ball.radius > CANVAS_WIDTH || ball.x - ball.radius < 0) {
      return { ...ball, dx: -ball.dx };
    }
    if (ball.y - ball.radius < 0) {
      return { ...ball, dy: -ball.dy };
    }

    // Ball collision with paddle
    if (ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width) {
      const hitPos = (ball.x - paddle.x) / paddle.width;
      const angle = (hitPos - 0.5) * Math.PI / 3;
      const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      return {
        ...ball,
        dx: speed * Math.sin(angle),
        dy: -speed * Math.cos(angle)
      };
    }

    // Ball collision with bricks
    for (let i = 0; i < bricks.length; i++) {
      const brick = bricks[i];
      if (brick.visible &&
          ball.x + ball.radius > brick.x &&
          ball.x - ball.radius < brick.x + brick.width &&
          ball.y + ball.radius > brick.y &&
          ball.y - ball.radius < brick.y + brick.height) {
        
        const newBricks = [...bricks];
        newBricks[i] = { ...brick, visible: false };
        setBricks(newBricks);
        setScore(prev => prev + 10);
        
        return { ...ball, dy: -ball.dy };
      }
    }

    return ball;
  }, []);

  const updateGame = useCallback(() => {
    if (gameState !== 'playing') return;

    setBall(prevBall => {
      const newBall = {
        x: prevBall.x + prevBall.dx,
        y: prevBall.y + prevBall.dy,
        dx: prevBall.dx,
        dy: prevBall.dy,
        radius: prevBall.radius
      };

      const updatedBall = checkCollision(newBall, paddle, bricks);

      // Check if ball is out of bounds
      if (updatedBall.y + updatedBall.radius > CANVAS_HEIGHT) {
        setLives(prev => {
          if (prev <= 1) {
            setGameState('gameOver');
            return 0;
          }
          resetBall();
          resetPaddle();
          return prev - 1;
        });
        return prevBall;
      }

      // Check if all bricks are destroyed
      if (bricks.every(brick => !brick.visible)) {
        setLevel(prev => prev + 1);
        initializeBricks();
        resetBall();
        resetPaddle();
      }

      return updatedBall;
    });
  }, [gameState, paddle, bricks, checkCollision, resetBall, resetPaddle, initializeBricks]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameState === 'gameOver') return;

    const paddleSpeed = 20;
    
    switch (e.code) {
      case 'ArrowLeft':
        e.preventDefault();
        setPaddle(prev => ({
          ...prev,
          x: Math.max(0, prev.x - paddleSpeed)
        }));
        break;
      case 'ArrowRight':
        e.preventDefault();
        setPaddle(prev => ({
          ...prev,
          x: Math.min(CANVAS_WIDTH - prev.width, prev.x + paddleSpeed)
        }));
        break;
      case 'KeyP':
        e.preventDefault();
        setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
        break;
      case 'Space':
        e.preventDefault();
        if (gameState === 'paused') {
          setGameState('playing');
        }
        break;
    }
  }, [gameState]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.closePath();

    // Draw paddle
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Draw bricks
    bricks.forEach(brick => {
      if (brick.visible) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      }
    });

    // Draw UI
    ctx.fillStyle = '#fbbf24';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Lives: ${lives}`, 10, 60);
    ctx.fillText(`Level: ${level}`, 10, 90);

    if (gameState === 'paused') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#fbbf24';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.font = '24px Arial';
      ctx.fillText('Press SPACE to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    }

    if (gameState === 'gameOver') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#ef4444';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.fillStyle = '#fbbf24';
      ctx.font = '24px Arial';
      ctx.fillText(`Final Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    }
  }, [ball, paddle, bricks, score, lives, level, gameState]);

  useEffect(() => {
    initializeBricks();
  }, [initializeBricks]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      updateGame();
      drawGame();
    }, 16); // ~60 FPS

    return () => clearInterval(gameLoop);
  }, [updateGame, drawGame]);

  const resetGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setLevel(1);
    initializeBricks();
    resetBall();
    resetPaddle();
  };

  if (!started) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 600 }}>
        <button
          onClick={() => setStarted(true)}
          style={{ padding: '16px 40px', fontSize: 24, borderRadius: 8, background: '#00ff00', color: '#222', border: 'none', cursor: 'pointer', marginBottom: 24 }}
        >
          Click to Start
        </button>
        <div style={{ color: '#fff', fontSize: 16 }}>Smash through colorful blocks with your paddle and ball. Don't let the ball fall! Use arrow keys to control.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-amber-400 mb-2">Breakout Arcade</h1>
        </div>

        <div className="flex justify-center mb-6">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-4 border-gray-600 rounded-lg"
          />
        </div>

        {gameState === 'gameOver' && (
          <div className="text-center mb-6">
            <button
              onClick={resetGame}
              className="bg-amber-500 text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors"
            >
              Play Again
            </button>
          </div>
        )}

        <div className="text-center text-gray-400 text-sm">
          <div className="mb-2">
            <strong>Controls:</strong>
          </div>
          <div className="flex justify-center space-x-8 text-xs">
            <div className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Move Left</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowRight className="h-4 w-4" />
              <span>Move Right</span>
            </div>
            <div>
              <strong>P</strong> to pause
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 