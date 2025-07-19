"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useGameCoins } from '../hooks/useGameCoins';
import { gameThumbnails } from '../constants/gameThumbnails';


export default function App() {
  return (
    <SnakeGame />
  );
}

export const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(0);

  // Game state variables managed by useRef to avoid re-renders on every game update
  const snakeRef = useRef([{ x: 10, y: 10 }]);
  const directionRef = useRef({ x: 0, y: 0 }); // Initial direction, usually still
  const foodRef = useRef({ x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) });
  const currentScoreRef = useRef(0);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const gridSize = 20;
  const boardSize = 20; // 20x20 grid
  const canvasSize = gridSize * boardSize; // 400x400 pixels

  // Function to draw game elements
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#1a1a1a'; // Dark background for the game board
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw grid lines
    ctx.strokeStyle = '#333333'; // Slightly lighter dark for grid lines
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= canvasSize; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvasSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvasSize, i);
      ctx.stroke();
    }

    // Draw snake
    snakeRef.current.forEach((segment, index) => {
      // Golden head, amber body
      if (index === 0) {
        ctx.fillStyle = '#FFD700'; // Golden color for snake head
      } else {
        ctx.fillStyle = '#FFA500'; // Amber color for snake body
      }
      ctx.fillRect(
        segment.x * gridSize + 1,
        segment.y * gridSize + 1,
        gridSize - 2,
        gridSize - 2
      );
    });

    // Draw food (red apple)
    ctx.fillStyle = '#FF4500'; // Red-orange for food
    ctx.beginPath();
    ctx.arc(
      foodRef.current.x * gridSize + gridSize / 2,
      foodRef.current.y * gridSize + gridSize / 2,
      gridSize / 2 - 3, // Smaller radius for a better look
      0,
      2 * Math.PI
    );
    ctx.fill();
  }, [canvasSize, gridSize]);

  // Function to update game state
  const update = useCallback(() => {
    if (paused || gameOver) return;

    const head = { ...snakeRef.current[0] };
    head.x += directionRef.current.x;
    head.y += directionRef.current.y;

    // Check wall collision
    if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
      setGameOver(true);
      return;
    }

    // Check self collision (start checking from the 4th segment to prevent immediate game over)
    if (snakeRef.current.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      return;
    }

    snakeRef.current.unshift(head); // Add new head

    // Check food collision
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      currentScoreRef.current += 10;
      setScore(currentScoreRef.current);

      let newFoodPos: { x: number; y: number };
      do {
        newFoodPos = {
          x: Math.floor(Math.random() * boardSize),
          y: Math.floor(Math.random() * boardSize)
        };
      } while (snakeRef.current.some(segment => segment.x === newFoodPos.x && segment.y === newFoodPos.y));
      foodRef.current = newFoodPos;
    } else {
      snakeRef.current.pop(); // Remove tail if no food eaten
    }
  }, [paused, gameOver, boardSize]);

  // Use the new game coins hook
  useGameCoins({
    gameId: 'snake',
    trigger: gameOver,
    score: score,
    duration: Math.floor((Date.now() - gameStartTime) / 1000)
  });

  // Facebook share
  const gameName = 'Snake Classic';
  const gameSlug = 'snake';
  const thumbnail = gameThumbnails[gameSlug];
  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(`I scored ${score} in ${gameName}! Can you beat me?`);
    const image = encodeURIComponent(thumbnail);
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}&picture=${image}`;
    window.open(fbShareUrl, '_blank');
  };

  // Brand button style
  const brandBtn = {
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
    transition: 'background 0.2s',
  };

  // Handle keyboard inputs
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    if (gameOver) return;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (directionRef.current.y === 0) directionRef.current = { x: 0, y: -1 };
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (directionRef.current.y === 0) directionRef.current = { x: 0, y: 1 };
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (directionRef.current.x === 0) directionRef.current = { x: -1, y: 0 };
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (directionRef.current.x === 0) directionRef.current = { x: 1, y: 0 };
        break;
      case 'Enter': // Use Enter for pause
        setPaused(prev => !prev);
        break;
    }
  }, [gameOver]);

  // Game loop
  useEffect(() => {
    // Clear any existing interval to prevent multiple loops
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
    }

    if (!gameOver && !paused) {
      gameIntervalRef.current = setInterval(() => {
        update();
        draw();
      }, 150); // Game speed
    }

    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
    };
  }, [update, draw, gameOver, paused]);



  // Initialize game state and event listeners on component mount
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    draw(); // Initial draw of the board

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
    };
  }, [handleKeyPress, draw]); // Only re-run if handleKeyPress or draw changes

  // Reset game function
  const resetGame = () => {
    // Reset internal game state variables
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 0, y: 0 }; // Reset to no movement
    foodRef.current = { x: Math.floor(Math.random() * boardSize), y: Math.floor(Math.random() * boardSize) };
    currentScoreRef.current = 0;

    // Reset React states
    setScore(0);
    setGameOver(false);
    setPaused(false);
    setGameStartTime(Date.now()); // Reset game start time

    // Immediately re-draw to reflect reset state
    draw();
  };

  if (!started) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', minHeight: 600 }}>
        <button
          onClick={() => {
            setStarted(true);
            setGameStartTime(Date.now()); // Start game time when user clicks start
          }}
          style={brandBtn}
        >
          Start
        </button>
        <div style={{ color: '#fff', fontSize: 16, marginTop: 16 }}>The classic snake game. Eat food, grow longer, and avoid walls and your own tail. Use arrow keys or WASD.</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #232946 0%, #1a1a2e 100%)', fontFamily: 'inter' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#18181b', borderRadius: 24, boxShadow: '0 8px 32px #0008', padding: 32, margin: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#FFD700', marginBottom: 12 }}>Snake Game</h2>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, fontSize: 24 }}>
            <div style={{ color: '#FFA500' }}>Score: <span style={{ color: '#FFD700' }}>{score}</span></div>
            {paused && <div style={{ color: '#00bcd4', fontWeight: 700 }}>PAUSED</div>}
            {gameOver && <div style={{ color: '#f44336', fontWeight: 700 }}>GAME OVER!</div>}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button style={brandBtn} onClick={() => setPaused((p) => !p)}>{paused ? 'Resume' : 'Pause'}</button>
            <button style={brandBtn} onClick={resetGame}>Restart</button>
          </div>
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            style={{ border: '4px solid #FFD700', borderRadius: 12, background: '#111', boxShadow: '0 4px 24px #0008', marginBottom: 16 }}
          />
          {(gameOver) && (
            <>
              <button style={brandBtn} onClick={resetGame}>Restart Game</button>
              <button style={{ ...brandBtn, background: '#4267B2', color: '#fff' }} onClick={shareOnFacebook}>Share on Facebook</button>
            </>
          )}
        </div>
        <div style={{ color: '#fff', marginTop: 16, fontSize: 15, textAlign: 'center' }}>
          <p>Use <b>WASD</b> or <b>Arrow Keys</b> to move</p>
          <p>Press <b>Enter</b> to pause/resume</p>
        </div>
      </div>
    </div>
  );
};
