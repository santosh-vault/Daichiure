"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';

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

      let newFoodPos;
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

  // Handle keyboard inputs
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    e.preventDefault(); // Prevent default browser actions for arrow keys/space

    if (gameOver) return;

    // Allow changing direction only if not going directly opposite to prevent instant self-collision
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
      case ' ': // Spacebar for pause
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

    // Immediately re-draw to reflect reset state
    draw();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter">
      <div className="bg-gray-900 rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-800 text-gray-100
                  transform transition-all duration-500 ease-in-out hover:scale-[1.01] hover:shadow-[0_0_50px_rgba(255,215,0,0.4)]
                  flex flex-col items-center">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold font-['Orbitron'] text-amber-400 mb-4 drop-shadow-md">Snake Game</h2>
          <div className="flex justify-center items-center space-x-6 mb-4 text-xl">
            <div className="font-semibold text-gray-300">Score: <span className="text-amber-300">{score}</span></div>
            {paused && (
              <div className="text-yellow-500 font-bold font-['Orbitron'] text-shadow-md">PAUSED</div>
            )}
            {gameOver && (
              <div className="text-red-500 font-bold font-['Orbitron'] text-shadow-md">GAME OVER!</div>
            )}
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="border-4 border-amber-600 rounded-lg shadow-xl mb-6 bg-gray-950"
          style={{
            // Ensure canvas is responsive while maintaining aspect ratio
            maxWidth: '100%',
            height: 'auto'
          }}
        />

        <div className="text-center">
          <div className="text-base text-gray-400 mb-6 leading-relaxed">
            Use <span className="font-bold text-amber-300">WASD</span> or <span className="font-bold text-amber-300">Arrow Keys</span> to move <br/>
            Press <span className="font-bold text-amber-300">Space</span> to pause
          </div>
          {(gameOver || paused) && ( // Show play again button if game over or paused
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-amber-500 to-amber-700 text-gray-950 px-8 py-3 rounded-full font-bold text-lg
                         hover:shadow-[0_0_25px_rgba(255,215,0,0.7)] transition-all duration-300 ease-in-out transform hover:scale-105
                         shadow-md"
            >
              {gameOver ? 'Play Again' : 'Resume Game'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
