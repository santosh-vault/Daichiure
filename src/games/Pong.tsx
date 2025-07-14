import React, { useEffect, useRef, useState } from 'react';
import { useAwardGameCoins } from './coinAwarder';

export const PongGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ player: 0, computer: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasWidth = 600;
    const canvasHeight = 400;
    
    // Game objects
    const ball = {
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      dx: 4,
      dy: 3,
      radius: 8
    };

    const playerPaddle = {
      x: 20,
      y: canvasHeight / 2 - 40,
      width: 10,
      height: 80,
      dy: 0
    };

    const computerPaddle = {
      x: canvasWidth - 30,
      y: canvasHeight / 2 - 40,
      width: 10,
      height: 80,
      dy: 0
    };

    let currentPlayerScore = 0;
    let currentComputerScore = 0;

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw center line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(canvasWidth / 2, 0);
      ctx.lineTo(canvasWidth / 2, canvasHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw paddles
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
      ctx.fillRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height);

      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Draw scores
      ctx.font = '32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(currentPlayerScore.toString(), canvasWidth / 4, 50);
      ctx.fillText(currentComputerScore.toString(), (3 * canvasWidth) / 4, 50);
    };

    const update = () => {
      if (paused || gameOver) return;

      // Move player paddle
      playerPaddle.y += playerPaddle.dy;
      if (playerPaddle.y < 0) playerPaddle.y = 0;
      if (playerPaddle.y > canvasHeight - playerPaddle.height) {
        playerPaddle.y = canvasHeight - playerPaddle.height;
      }

      // AI for computer paddle
      const ballCenter = ball.y;
      const paddleCenter = computerPaddle.y + computerPaddle.height / 2;
      
      if (paddleCenter < ballCenter - 35) {
        computerPaddle.y += 3;
      } else if (paddleCenter > ballCenter + 35) {
        computerPaddle.y -= 3;
      }

      if (computerPaddle.y < 0) computerPaddle.y = 0;
      if (computerPaddle.y > canvasHeight - computerPaddle.height) {
        computerPaddle.y = canvasHeight - computerPaddle.height;
      }

      // Move ball
      ball.x += ball.dx;
      ball.y += ball.dy;

      // Ball collision with top and bottom walls
      if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvasHeight) {
        ball.dy = -ball.dy;
      }

      // Ball collision with paddles
      if (
        ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height
      ) {
        ball.dx = -ball.dx;
        ball.x = playerPaddle.x + playerPaddle.width + ball.radius;
      }

      if (
        ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
      ) {
        ball.dx = -ball.dx;
        ball.x = computerPaddle.x - ball.radius;
      }

      // Ball out of bounds
      if (ball.x < 0) {
        currentComputerScore++;
        resetBall();
      } else if (ball.x > canvasWidth) {
        currentPlayerScore++;
        resetBall();
      }

      setScore({ player: currentPlayerScore, computer: currentComputerScore });

      // Check for game over
      if (currentPlayerScore >= 5 || currentComputerScore >= 5) {
        setGameOver(true);
      }
    };

    const resetBall = () => {
      ball.x = canvasWidth / 2;
      ball.y = canvasHeight / 2;
      ball.dx = -ball.dx;
      ball.dy = Math.random() > 0.5 ? 3 : -3;
    };

    const keys: { [key: string]: boolean } = {};
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
      
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        playerPaddle.dy = -5;
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        playerPaddle.dy = 5;
      }
      if (e.code === 'KeyP') {
        setPaused(prev => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
      
      if (e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'KeyW' || e.code === 'KeyS') {
        playerPaddle.dy = 0;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    const gameLoop = setInterval(() => {
      update();
      draw();
    }, 16);

    // Initial draw
    draw();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      clearInterval(gameLoop);
    };
  }, [paused, gameOver, started]);

  useAwardGameCoins(gameOver);

  const resetGame = () => {
    setScore({ player: 0, computer: 0 });
    setGameOver(false);
    setPaused(false);
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
        <div style={{ color: '#fff', fontSize: 16 }}>Classic Pong game. Play against the computer. Use arrow keys or W/S to control your paddle.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-900 min-h-full">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white mb-2">Pong</h2>
          <div className="flex justify-center items-center space-x-8 mb-4 text-white">
            <div className="text-lg">
              <div className="text-sm text-gray-300">Player</div>
              <div className="text-2xl font-bold">{score.player}</div>
            </div>
            <div className="text-lg">
              <div className="text-sm text-gray-300">Computer</div>
              <div className="text-2xl font-bold">{score.computer}</div>
            </div>
          </div>
          {paused && (
            <div className="text-yellow-400 font-semibold mb-2">PAUSED</div>
          )}
          {gameOver && (
            <div className="text-red-400 font-semibold mb-2">
              {score.player >= 5 ? 'YOU WIN!' : 'COMPUTER WINS!'}
            </div>
          )}
        </div>
        
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="border-2 border-gray-600 rounded-lg mb-4"
        />
        
        <div className="text-center">
          <div className="text-sm text-gray-300 mb-4">
            Use W/S or Arrow Keys to move • P to pause • First to 5 wins
          </div>
          {gameOver && (
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow"
            >
              Play Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};