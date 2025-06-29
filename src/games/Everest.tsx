import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mountain, Thermometer, Heart, Flag } from 'lucide-react';

interface Climber {
  x: number;
  y: number;
  oxygen: number;
  health: number;
  altitude: number;
}

interface Obstacle {
  x: number;
  y: number;
  type: 'rock' | 'ice' | 'crevasse';
  width: number;
  height: number;
}

interface OxygenTank {
  x: number;
  y: number;
  collected: boolean;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const CLIMBER_SIZE = 20;

export const EverestGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameOver' | 'won'>('playing');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [oxygen, setOxygen] = useState(100);
  const [health, setHealth] = useState(100);
  const [altitude, setAltitude] = useState(0);

  const [climber, setClimber] = useState<Climber>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 50,
    oxygen: 100,
    health: 100,
    altitude: 0
  });

  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [oxygenTanks, setOxygenTanks] = useState<OxygenTank[]>([]);
  const [baseCamp, setBaseCamp] = useState({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30 });

  const generateObstacles = useCallback(() => {
    const newObstacles: Obstacle[] = [];
    const obstacleTypes: ('rock' | 'ice' | 'crevasse')[] = ['rock', 'ice', 'crevasse'];
    
    for (let i = 0; i < 8; i++) {
      newObstacles.push({
        x: Math.random() * (CANVAS_WIDTH - 100),
        y: Math.random() * (CANVAS_HEIGHT - 200) + 100,
        type: obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)],
        width: 60 + Math.random() * 40,
        height: 30 + Math.random() * 30
      });
    }
    setObstacles(newObstacles);
  }, []);

  const generateOxygenTanks = useCallback(() => {
    const newTanks: OxygenTank[] = [];
    for (let i = 0; i < 5; i++) {
      newTanks.push({
        x: Math.random() * (CANVAS_WIDTH - 50),
        y: Math.random() * (CANVAS_HEIGHT - 200) + 100,
        collected: false
      });
    }
    setOxygenTanks(newTanks);
  }, []);

  const checkCollision = useCallback((x: number, y: number, width: number, height: number) => {
    return obstacles.some(obstacle => 
      x < obstacle.x + obstacle.width &&
      x + width > obstacle.x &&
      y < obstacle.y + obstacle.height &&
      y + height > obstacle.y
    );
  }, [obstacles]);

  const moveClimber = useCallback((dx: number, dy: number) => {
    if (gameState !== 'playing') return;

    const newX = Math.max(0, Math.min(CANVAS_WIDTH - CLIMBER_SIZE, climber.x + dx));
    const newY = Math.max(0, Math.min(CANVAS_HEIGHT - CLIMBER_SIZE, climber.y + dy));

    // Check for obstacle collision
    if (checkCollision(newX, newY, CLIMBER_SIZE, CLIMBER_SIZE)) {
      setHealth(prev => Math.max(0, prev - 10));
      return;
    }

    // Check for oxygen tank collection
    const tankIndex = oxygenTanks.findIndex(tank => 
      !tank.collected &&
      newX < tank.x + 30 &&
      newX + CLIMBER_SIZE > tank.x &&
      newY < tank.y + 30 &&
      newY + CLIMBER_SIZE > tank.y
    );

    if (tankIndex !== -1) {
      setOxygenTanks(prev => prev.map((tank, index) => 
        index === tankIndex ? { ...tank, collected: true } : tank
      ));
      setOxygen(prev => Math.min(100, prev + 30));
      setScore(prev => prev + 50);
    }

    // Update altitude based on Y position
    const newAltitude = Math.floor(((CANVAS_HEIGHT - newY) / CANVAS_HEIGHT) * 8848); // Everest height in meters
    setAltitude(newAltitude);

    setClimber(prev => ({
      ...prev,
      x: newX,
      y: newY,
      altitude: newAltitude
    }));
  }, [climber, gameState, checkCollision, oxygenTanks]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameState === 'gameOver') return;

    const moveSpeed = 5;
    
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        e.preventDefault();
        moveClimber(0, -moveSpeed);
        break;
      case 'ArrowDown':
      case 'KeyS':
        e.preventDefault();
        moveClimber(0, moveSpeed);
        break;
      case 'ArrowLeft':
      case 'KeyA':
        e.preventDefault();
        moveClimber(-moveSpeed, 0);
        break;
      case 'ArrowRight':
      case 'KeyD':
        e.preventDefault();
        moveClimber(moveSpeed, 0);
        break;
      case 'KeyP':
        e.preventDefault();
        setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
        break;
    }
  }, [gameState, moveClimber]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with gradient sky
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue
    gradient.addColorStop(0.5, '#E6E6FA'); // Light purple
    gradient.addColorStop(1, '#F5F5DC'); // Beige
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw mountains in background
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT);
    ctx.lineTo(200, 300);
    ctx.lineTo(400, 200);
    ctx.lineTo(600, 250);
    ctx.lineTo(800, 150);
    ctx.lineTo(800, CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fill();

    // Draw snow caps
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(150, 320);
    ctx.lineTo(200, 300);
    ctx.lineTo(250, 320);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(350, 220);
    ctx.lineTo(400, 200);
    ctx.lineTo(450, 220);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(550, 270);
    ctx.lineTo(600, 250);
    ctx.lineTo(650, 270);
    ctx.closePath();
    ctx.fill();

    // Draw obstacles
    obstacles.forEach(obstacle => {
      switch (obstacle.type) {
        case 'rock':
          ctx.fillStyle = '#696969';
          break;
        case 'ice':
          ctx.fillStyle = '#B0E0E6';
          break;
        case 'crevasse':
          ctx.fillStyle = '#000000';
          break;
      }
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw oxygen tanks
    oxygenTanks.forEach(tank => {
      if (!tank.collected) {
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(tank.x, tank.y, 30, 30);
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.fillText('O2', tank.x + 8, tank.y + 20);
      }
    });

    // Draw base camp
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(baseCamp.x - 20, baseCamp.y, 40, 20);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(baseCamp.x - 15, baseCamp.y - 10, 30, 10);

    // Draw climber
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(climber.x, climber.y, CLIMBER_SIZE, CLIMBER_SIZE);
    
    // Draw climber details
    ctx.fillStyle = '#000000';
    ctx.fillRect(climber.x + 5, climber.y + 5, 10, 10); // Head
    ctx.fillRect(climber.x + 8, climber.y + 15, 4, 5); // Body

    // Draw UI
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.fillText(`Altitude: ${altitude}m`, 10, 30);
    ctx.fillText(`Score: ${score}`, 10, 60);
    ctx.fillText(`Level: ${level}`, 10, 90);

    // Draw oxygen bar
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(10, 110, oxygen * 2, 20);
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(10, 110, 200, 20);
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.fillText(`Oxygen: ${oxygen}%`, 220, 125);

    // Draw health bar
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(10, 140, health * 2, 20);
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(10, 140, 200, 20);
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.fillText(`Health: ${health}%`, 220, 155);

    if (gameState === 'paused') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.font = '24px Arial';
      ctx.fillText('Press P to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    }

    if (gameState === 'gameOver') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#FF0000';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '24px Arial';
      ctx.fillText(`Final Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
      ctx.fillText(`Altitude Reached: ${altitude}m`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
    }

    if (gameState === 'won') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#00FF00';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('SUMMIT REACHED!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '24px Arial';
      ctx.fillText(`Congratulations! You reached the top of Everest!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
      ctx.fillText(`Final Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
    }
  }, [climber, obstacles, oxygenTanks, baseCamp, altitude, score, level, oxygen, health, gameState]);

  useEffect(() => {
    generateObstacles();
    generateOxygenTanks();
  }, [generateObstacles, generateOxygenTanks]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (gameState === 'playing') {
        // Decrease oxygen over time
        setOxygen(prev => {
          const newOxygen = prev - 0.5;
          if (newOxygen <= 0) {
            setGameState('gameOver');
            return 0;
          }
          return newOxygen;
        });

        // Check if reached summit
        if (altitude >= 8848) {
          setGameState('won');
        }

        // Check if health is depleted
        if (health <= 0) {
          setGameState('gameOver');
        }
      }
      drawGame();
    }, 16);

    return () => clearInterval(gameLoop);
  }, [gameState, altitude, health, drawGame]);

  const resetGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setOxygen(100);
    setHealth(100);
    setAltitude(0);
    setClimber({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      oxygen: 100,
      health: 100,
      altitude: 0
    });
    generateObstacles();
    generateOxygenTanks();
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-amber-400 mb-2">Everest Climb</h1>
          <p className="text-gray-300">Climb to the summit of Mount Everest!</p>
        </div>

        <div className="flex justify-center mb-6">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-4 border-gray-600 rounded-lg"
          />
        </div>

        {(gameState === 'gameOver' || gameState === 'won') && (
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
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div>WASD or Arrow Keys - Move</div>
              <div>P - Pause</div>
            </div>
            <div>
              <div>Collect green O2 tanks</div>
              <div>Avoid obstacles</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 