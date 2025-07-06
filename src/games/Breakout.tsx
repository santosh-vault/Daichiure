"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gameThumbnails } from '../constants/gameThumbnails';

export default function App() {
  return (
    <BreakoutGame />
  );
}

export const BreakoutGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [difficultyPhase, setDifficultyPhase] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PADDLE_WIDTH = 100;
  const PADDLE_HEIGHT = 20;
  const BALL_RADIUS = 8;
  const BRICK_ROWS = 5;
  const BRICK_COLS = 10;
  const BRICK_WIDTH = 70;
  const BRICK_HEIGHT = 20;
  const BRICK_PADDING = 5;
  const POWER_UP_SIZE = 20;
  const POWER_UP_DURATION = 5000; // 5 seconds

  // Game state refs
  const paddleRef = useRef({
    x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    y: CANVAS_HEIGHT - 40,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 8,
    enlargedUntil: 0
  });

  const ballsRef = useRef<Array<{
    x: number;
    y: number;
    dx: number;
    dy: number;
    radius: number;
    id: number;
  }>>([]);

  const bricksRef = useRef<Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    broken: boolean;
    type: 'normal' | 'strong';
    hits: number;
    maxHits: number;
  }>>([]);

  const powerUpsRef = useRef<Array<{
    x: number;
    y: number;
    type: 'double' | 'enlarge';
    active: boolean;
  }>>([]);

  const keysRef = useRef<Record<string, boolean>>({});
  const animationRef = useRef<number>();
  const ballIdCounterRef = useRef(0);
  const phaseTransitioningRef = useRef(false);

  // Calculate difficulty based on phase
  const getDifficultySettings = useCallback((phase: number) => {
    return {
      ballSpeed: 4 + Math.floor(phase / 2),
      brickHits: Math.min(phase, 5), // Max 5 hits per brick
      powerUpChance: Math.min(0.1 + (phase * 0.02), 0.3), // Max 30% chance
      paddleSpeed: 8 + Math.floor(phase / 3)
    };
  }, []);

  // Initialize game
  const initGame = useCallback(() => {
    if (phaseTransitioningRef.current) return; // Prevent multiple calls
    
    const settings = getDifficultySettings(difficultyPhase);
    
    // Reset paddle
    paddleRef.current = {
      x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      y: CANVAS_HEIGHT - 40,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: settings.paddleSpeed,
      enlargedUntil: 0
    };

    // Reset ball
    ballsRef.current = [{
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      dx: settings.ballSpeed,
      dy: -settings.ballSpeed,
      radius: BALL_RADIUS,
      id: ballIdCounterRef.current++
    }];

    // Create bricks (no unbreakable bricks)
    bricksRef.current = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        const brickType = row === 0 ? 'strong' : 'normal';
        const maxHits = settings.brickHits;
        
        bricksRef.current.push({
          x: col * (BRICK_WIDTH + BRICK_PADDING) + BRICK_PADDING,
          y: row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_PADDING + 50,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          broken: false,
          type: brickType,
          hits: maxHits,
          maxHits
        });
      }
    }

    // Clear power-ups
    powerUpsRef.current = [];
  }, [difficultyPhase, getDifficultySettings]);

  // Add multiple balls in a line
  const addMultipleBalls = useCallback(() => {
    const settings = getDifficultySettings(difficultyPhase);
    const baseSpeed = settings.ballSpeed;
    
    // Add 3 balls in a horizontal line
    for (let i = -1; i <= 1; i++) {
      ballsRef.current.push({
        x: CANVAS_WIDTH / 2 + (i * 30), // Spread balls horizontally
        y: CANVAS_HEIGHT / 2,
        dx: baseSpeed + (i * 0.5), // Slightly different speeds
        dy: -baseSpeed,
        radius: BALL_RADIUS,
        id: ballIdCounterRef.current++
      });
    }
  }, [difficultyPhase, getDifficultySettings]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!started || paused || gameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const paddle = paddleRef.current;

    // Paddle movement
    if (keysRef.current['ArrowLeft'] && paddle.x > 0) {
      paddle.x -= paddle.speed;
    }
    if (keysRef.current['ArrowRight'] && paddle.x + paddle.width < CANVAS_WIDTH) {
      paddle.x += paddle.speed;
    }

    // Reset paddle size if power-up expired
    const now = Date.now();
    if (now > paddle.enlargedUntil) {
      paddle.width = PADDLE_WIDTH;
    }

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw paddle
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Update and draw balls
    const activeBalls: typeof ballsRef.current = [];
    for (const ball of ballsRef.current) {
      ball.x += ball.dx;
      ball.y += ball.dy;

      // Wall collision
      if (ball.x - ball.radius < 0 || ball.x + ball.radius > CANVAS_WIDTH) {
        ball.dx *= -1;
      }
      if (ball.y - ball.radius < 0) {
        ball.dy *= -1;
      }

      // Paddle collision
      if (
        ball.y + ball.radius >= paddle.y &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.width
      ) {
        ball.dy *= -1;
        ball.y = paddle.y - ball.radius;
      }

      // Brick collision
      for (const brick of bricksRef.current) {
        if (!brick.broken && 
            ball.x > brick.x && 
            ball.x < brick.x + brick.width && 
            ball.y > brick.y && 
            ball.y < brick.y + brick.height) {
          
          brick.hits--;
          if (brick.hits <= 0) {
            brick.broken = true;
            setScore(prev => prev + 10 * difficultyPhase);

            // Drop power-up based on difficulty
            const settings = getDifficultySettings(difficultyPhase);
            if (Math.random() < settings.powerUpChance) {
              const kind = Math.random() < 0.5 ? 'double' : 'enlarge';
              powerUpsRef.current.push({
                x: brick.x + brick.width / 2 - 10,
                y: brick.y,
                type: kind,
                active: true
              });
            }
          }
          ball.dy *= -1;
          break;
        }
      }

      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffff00';
      ctx.fill();
      ctx.closePath();

      // Keep ball if it's still in play
      if (ball.y - ball.radius < CANVAS_HEIGHT) {
        activeBalls.push(ball);
      }
    }

    ballsRef.current = activeBalls;

    // Update and draw power-ups
    for (const power of powerUpsRef.current) {
      if (power.active) {
        power.y += 2;
        
        // Check if power-up hits paddle
        if (
          power.y + POWER_UP_SIZE >= paddle.y &&
          power.x + POWER_UP_SIZE >= paddle.x &&
          power.x <= paddle.x + paddle.width
        ) {
          power.active = false;
          if (power.type === 'double') {
            addMultipleBalls();
          } else if (power.type === 'enlarge') {
            paddle.width = PADDLE_WIDTH * 1.5;
            paddle.enlargedUntil = Date.now() + POWER_UP_DURATION;
          }
        }

        // Draw power-up
        ctx.fillStyle = power.type === 'double' ? '#ffaa00' : '#00ff00';
        ctx.fillRect(power.x, power.y, POWER_UP_SIZE, POWER_UP_SIZE);
      }
    }

    // Draw bricks with hit indicators
    for (const brick of bricksRef.current) {
      if (!brick.broken) {
        // Color based on remaining hits
        const hitRatio = brick.hits / brick.maxHits;
        if (hitRatio > 0.6) {
          ctx.fillStyle = '#ff6699'; // Pink for full health
        } else if (hitRatio > 0.3) {
          ctx.fillStyle = '#ff9900'; // Orange for medium health
        } else {
          ctx.fillStyle = '#ff0000'; // Red for low health
        }
        
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        
        // Draw hit count indicator
        if (brick.maxHits > 1) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(
            brick.hits.toString(),
            brick.x + brick.width / 2,
            brick.y + brick.height / 2 + 4
          );
        }
      }
    }

    // Check if all bricks are broken - advance to next phase (BEFORE game over check)
    const remainingBricks = bricksRef.current.filter(b => !b.broken);
    if (remainingBricks.length === 0 && !phaseTransitioningRef.current) {
      phaseTransitioningRef.current = true;
      setDifficultyPhase(prev => prev + 1);
      setTimeout(() => {
        phaseTransitioningRef.current = false;
        initGame(); // Initialize with new difficulty
      }, 1000); // Brief pause before next phase
      return;
    }

    // Check game over (AFTER phase check)
    if (ballsRef.current.length === 0) {
      setGameOver(true);
      if (infoRef.current) {
        infoRef.current.innerHTML = `<div style="color: red; font-size: 22px;">Game Over! Score: ${score}</div>`;
      }
      return;
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [started, paused, gameOver, score, difficultyPhase, initGame, addMultipleBalls, getDifficultySettings]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      
      if (e.key === 'Enter' && !started) {
        setStarted(true);
        initGame();
      }
      
      if (e.key === 'p' || e.key === 'P') {
        setPaused(prev => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [started, initGame]);

  // Start game loop
  useEffect(() => {
    if (started && !paused && !gameOver) {
      gameLoop();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [started, paused, gameOver, gameLoop]);

  // Initial render to show game elements
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Initialize game state for display
    const paddle = {
      x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      y: CANVAS_HEIGHT - 40,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT
    };

    const ball = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      radius: BALL_RADIUS
    };

    // Create initial bricks for display (no unbreakable)
    const bricks = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        const brickType = row === 0 ? 'strong' : 'normal';
        const maxHits = 1; // Start with 1 hit for display
        
        bricks.push({
          x: col * (BRICK_WIDTH + BRICK_PADDING) + BRICK_PADDING,
          y: row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_PADDING + 50,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          broken: false,
          type: brickType,
          hits: maxHits,
          maxHits
        });
      }
    }

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw paddle
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffff00';
    ctx.fill();
    ctx.closePath();

    // Draw bricks
    for (const brick of bricks) {
      ctx.fillStyle = brick.type === 'strong' ? '#ff9900' : '#ff6699';
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    }
  }, []); // Run only once on mount

  // Game info
  const gameName = 'Breakout';
  const gameSlug = 'breakout';
  const thumbnail = gameThumbnails[gameSlug];

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(`I scored ${score} in ${gameName}! Can you beat me?`);
    const image = encodeURIComponent(thumbnail);
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}&picture=${image}`;
    window.open(fbShareUrl, '_blank');
  };

  const restart = () => {
    setScore(0);
    setDifficultyPhase(1);
    setGameOver(false);
    setStarted(false);
    setPaused(false);
    ballIdCounterRef.current = 0;
    phaseTransitioningRef.current = false;
    if (infoRef.current) {
      infoRef.current.innerHTML = '';
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          border: '2px solid #ffffff',
          backgroundColor: '#000',
          display: 'block',
          margin: '0 auto',
        }}
      />
      <div ref={infoRef} style={{ marginTop: 10 }}></div>
      
      {!started && (
        <div style={{ color: '#ffffff', marginTop: 10 }}>
          <h2>Infinite Breakout</h2>
          <p>Press Enter to start</p>
          <p>Use Arrow Keys ⬅️➡️ to move paddle</p>
          <p>Press P to pause</p>
          <p>Destroy all bricks to advance to next phase!</p>
        </div>
      )}
      
      {gameOver && (
        <div style={{ marginTop: 10 }}>
          <button 
            onClick={restart}
            style={{
              background: '#00bcd4',
              color: '#222',
              border: 'none',
              borderRadius: 8,
              fontWeight: 'bold',
              fontSize: 18,
              padding: '10px 32px',
              margin: 8,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #0004',
            }}
          >
            Restart Game
          </button>
          <button 
            onClick={shareOnFacebook}
            style={{
              background: '#1877f2',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 'bold',
              fontSize: 18,
              padding: '10px 32px',
              margin: 8,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #0004',
            }}
          >
            Share on Facebook
          </button>
        </div>
      )}
      
      <div style={{ color: '#ffffff', marginTop: 10, fontSize: 16 }}>
        <p>Phase: {difficultyPhase} | Score: {score}</p>
        {started && !gameOver && <p>Use Arrow Keys ⬅️➡️ to move | Press P to pause</p>}
        {started && !gameOver && <p>Destroy all bricks to advance to Phase {difficultyPhase + 1}!</p>}
      </div>
    </div>
  );
};