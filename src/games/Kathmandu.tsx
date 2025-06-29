import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Heart, Star, Flag } from 'lucide-react';

interface Player {
  x: number;
  y: number;
  health: number;
  treasures: number;
}

interface Wall {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Temple {
  x: number;
  y: number;
  visited: boolean;
  type: 'pashupatinath' | 'swyambhunath' | 'boudhanath';
}

interface Treasure {
  x: number;
  y: number;
  collected: boolean;
  type: 'mandala' | 'prayer_flag' | 'singing_bowl';
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const CELL_SIZE = 40;
const MAZE_WIDTH = Math.floor(CANVAS_WIDTH / CELL_SIZE);
const MAZE_HEIGHT = Math.floor(CANVAS_HEIGHT / CELL_SIZE);

export const KathmanduGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameOver' | 'won'>('playing');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [health, setHealth] = useState(100);
  const [treasures, setTreasures] = useState(0);

  const [player, setPlayer] = useState<Player>({
    x: 1,
    y: MAZE_HEIGHT - 2,
    health: 100,
    treasures: 0
  });

  const [maze, setMaze] = useState<boolean[][]>([]);
  const [temples, setTemples] = useState<Temple[]>([]);
  const [treasureItems, setTreasureItems] = useState<Treasure[]>([]);
  const [exit, setExit] = useState({ x: MAZE_WIDTH - 2, y: 1 });

  const generateMaze = useCallback(() => {
    const newMaze = Array(MAZE_HEIGHT).fill(null).map(() => Array(MAZE_WIDTH).fill(true));
    
    // Generate maze using simple algorithm
    for (let y = 1; y < MAZE_HEIGHT - 1; y += 2) {
      for (let x = 1; x < MAZE_WIDTH - 1; x += 2) {
        newMaze[y][x] = false;
        
        // Randomly create paths
        if (y + 2 < MAZE_HEIGHT - 1 && Math.random() > 0.3) {
          newMaze[y + 1][x] = false;
        }
        if (x + 2 < MAZE_WIDTH - 1 && Math.random() > 0.3) {
          newMaze[y][x + 1] = false;
        }
      }
    }
    
    // Ensure start and end are accessible
    newMaze[MAZE_HEIGHT - 2][1] = false;
    newMaze[1][MAZE_WIDTH - 2] = false;
    
    setMaze(newMaze);
  }, []);

  const generateTemples = useCallback(() => {
    const templeTypes: ('pashupatinath' | 'swyambhunath' | 'boudhanath')[] = ['pashupatinath', 'swyambhunath', 'boudhanath'];
    const newTemples: Temple[] = [];
    
    for (let i = 0; i < 3; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * (MAZE_WIDTH - 2)) + 1;
        y = Math.floor(Math.random() * (MAZE_HEIGHT - 2)) + 1;
      } while (maze[y]?.[x] || newTemples.some(t => t.x === x && t.y === y));
      
      newTemples.push({
        x,
        y,
        visited: false,
        type: templeTypes[i]
      });
    }
    
    setTemples(newTemples);
  }, [maze]);

  const generateTreasures = useCallback(() => {
    const treasureTypes: ('mandala' | 'prayer_flag' | 'singing_bowl')[] = ['mandala', 'prayer_flag', 'singing_bowl'];
    const newTreasures: Treasure[] = [];
    
    for (let i = 0; i < 5; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * (MAZE_WIDTH - 2)) + 1;
        y = Math.floor(Math.random() * (MAZE_HEIGHT - 2)) + 1;
      } while (maze[y]?.[x] || newTreasures.some(t => t.x === x && t.y === y));
      
      newTreasures.push({
        x,
        y,
        collected: false,
        type: treasureTypes[Math.floor(Math.random() * treasureTypes.length)]
      });
    }
    
    setTreasureItems(newTreasures);
  }, [maze]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameState !== 'playing') return;

    const newX = player.x + dx;
    const newY = player.y + dy;

    // Check wall collision
    if (newX < 0 || newX >= MAZE_WIDTH || newY < 0 || newY >= MAZE_HEIGHT || maze[newY]?.[newX]) {
      setHealth(prev => Math.max(0, prev - 5));
      return;
    }

    // Check temple visit
    const templeIndex = temples.findIndex(temple => 
      !temple.visited &&
      newX === temple.x &&
      newY === temple.y
    );

    if (templeIndex !== -1) {
      setTemples(prev => prev.map((temple, index) => 
        index === templeIndex ? { ...temple, visited: true } : temple
      ));
      setScore(prev => prev + 100);
      setHealth(prev => Math.min(100, prev + 20));
    }

    // Check treasure collection
    const treasureIndex = treasureItems.findIndex(treasure => 
      !treasure.collected &&
      newX === treasure.x &&
      newY === treasure.y
    );

    if (treasureIndex !== -1) {
      setTreasureItems(prev => prev.map((treasure, index) => 
        index === treasureIndex ? { ...treasure, collected: true } : treasure
      ));
      setTreasures(prev => prev + 1);
      setScore(prev => prev + 50);
    }

    // Check if reached exit
    if (newX === exit.x && newY === exit.y) {
      setGameState('won');
    }

    setPlayer(prev => ({
      ...prev,
      x: newX,
      y: newY
    }));
  }, [player, gameState, maze, temples, treasureItems, exit]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameState === 'gameOver') return;

    const moveSpeed = 1;
    
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        e.preventDefault();
        movePlayer(0, -moveSpeed);
        break;
      case 'ArrowDown':
      case 'KeyS':
        e.preventDefault();
        movePlayer(0, moveSpeed);
        break;
      case 'ArrowLeft':
      case 'KeyA':
        e.preventDefault();
        movePlayer(-moveSpeed, 0);
        break;
      case 'ArrowRight':
      case 'KeyD':
        e.preventDefault();
        movePlayer(moveSpeed, 0);
        break;
      case 'KeyP':
        e.preventDefault();
        setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
        break;
    }
  }, [gameState, movePlayer]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with warm background
    ctx.fillStyle = '#F5DEB3';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw maze walls
    ctx.fillStyle = '#8B4513';
    for (let y = 0; y < MAZE_HEIGHT; y++) {
      for (let x = 0; x < MAZE_WIDTH; x++) {
        if (maze[y]?.[x]) {
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw temples
    temples.forEach(temple => {
      if (!temple.visited) {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(temple.x * CELL_SIZE + 5, temple.y * CELL_SIZE + 5, CELL_SIZE - 10, CELL_SIZE - 10);
        ctx.fillStyle = '#8B4513';
        ctx.font = '12px Arial';
        ctx.fillText('🏛️', temple.x * CELL_SIZE + 8, temple.y * CELL_SIZE + 25);
      } else {
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(temple.x * CELL_SIZE + 5, temple.y * CELL_SIZE + 5, CELL_SIZE - 10, CELL_SIZE - 10);
        ctx.fillStyle = '#006400';
        ctx.font = '12px Arial';
        ctx.fillText('✅', temple.x * CELL_SIZE + 8, temple.y * CELL_SIZE + 25);
      }
    });

    // Draw treasures
    treasureItems.forEach(treasure => {
      if (!treasure.collected) {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(treasure.x * CELL_SIZE + 8, treasure.y * CELL_SIZE + 8, CELL_SIZE - 16, CELL_SIZE - 16);
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        let symbol = '💎';
        switch (treasure.type) {
          case 'mandala':
            symbol = '🌀';
            break;
          case 'prayer_flag':
            symbol = '🏳️';
            break;
          case 'singing_bowl':
            symbol = '🔔';
            break;
        }
        ctx.fillText(symbol, treasure.x * CELL_SIZE + 12, treasure.y * CELL_SIZE + 25);
      }
    });

    // Draw exit
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(exit.x * CELL_SIZE + 5, exit.y * CELL_SIZE + 5, CELL_SIZE - 10, CELL_SIZE - 10);
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.fillText('🚪', exit.x * CELL_SIZE + 8, exit.y * CELL_SIZE + 25);

    // Draw player
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(player.x * CELL_SIZE + 5, player.y * CELL_SIZE + 5, CELL_SIZE - 10, CELL_SIZE - 10);
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.fillText('🧘', player.x * CELL_SIZE + 8, player.y * CELL_SIZE + 25);

    // Draw UI
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Level: ${level}`, 10, 60);
    ctx.fillText(`Treasures: ${treasures}/5`, 10, 90);

    // Draw health bar
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(10, 110, health * 2, 20);
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(10, 110, 200, 20);
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.fillText(`Health: ${health}%`, 220, 125);

    // Draw instructions
    ctx.fillStyle = '#000000';
    ctx.font = '14px Arial';
    ctx.fillText('🏛️ = Temple (visit for health)', 10, 160);
    ctx.fillText('💎 = Treasure (collect for points)', 10, 180);
    ctx.fillText('🚪 = Exit (reach to win)', 10, 200);

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
      ctx.fillText(`Treasures Found: ${treasures}/5`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
    }

    if (gameState === 'won') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#00FF00';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('MAZE COMPLETED!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '24px Arial';
      ctx.fillText(`Congratulations! You explored Kathmandu!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
      ctx.fillText(`Final Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
      ctx.fillText(`Treasures Found: ${treasures}/5`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 110);
    }
  }, [player, maze, temples, treasureItems, exit, score, level, treasures, health, gameState]);

  useEffect(() => {
    generateMaze();
  }, [generateMaze]);

  useEffect(() => {
    if (maze.length > 0) {
      generateTemples();
      generateTreasures();
    }
  }, [maze, generateTemples, generateTreasures]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (gameState === 'playing') {
        // Check if health is depleted
        if (health <= 0) {
          setGameState('gameOver');
        }
      }
      drawGame();
    }, 16);

    return () => clearInterval(gameLoop);
  }, [gameState, health, drawGame]);

  const resetGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setHealth(100);
    setTreasures(0);
    setPlayer({
      x: 1,
      y: MAZE_HEIGHT - 2,
      health: 100,
      treasures: 0
    });
    generateMaze();
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-amber-400 mb-2">Kathmandu Maze</h1>
          <p className="text-gray-300">Explore the ancient streets of Kathmandu!</p>
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
              <div>Visit temples for health</div>
              <div>Collect treasures for points</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 