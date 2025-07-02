import React, { useRef, useEffect, useState } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const MOB_SIZE = 20;
const SPEED = 2;
const NEUTRAL_SPEED = 0.5;
const ALLY_FOLLOW_SPEED = 1.8;
const MAX_TEAM = 50;
const GROUP_COUNT = 15;
const FOLLOW_DISTANCE = 40; // Distance allies try to maintain from player

interface Mob {
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  isAlly: boolean;
  groupId?: number;
  offsetX?: number;
  offsetY?: number;
  isPlayer?: boolean;
  followTargetX?: number;
  followTargetY?: number;
}

export const AllOfUsAreDead: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const mobsRef = useRef<Mob[]>([]);
  const gameRunningRef = useRef(false);
  const gamePausedRef = useRef(false);
  const gameOverRef = useRef(false);

  const keys = useRef<Record<string, boolean>>({});
  const [started, setStarted] = useState(false);
  const [gameStats, setGameStats] = useState({ teamSize: 1, gameOver: false, won: false });

  // Initialize game
  const initializeGame = () => {
    const mobs: Mob[] = [];
    
    // Add player
    mobs.push({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      size: MOB_SIZE,
      color: '#00ff00',
      vx: 0,
      vy: 0,
      isAlly: true,
      isPlayer: true,
    });

    // Create neutral groups
    let groupIdCounter = 1;
    for (let i = 0; i < GROUP_COUNT; i++) {
      const groupSize = Math.floor(Math.random() * 5) + 1;
      const baseX = Math.random() * (CANVAS_WIDTH - 100) + 50;
      const baseY = Math.random() * (CANVAS_HEIGHT - 100) + 50;
      const vx = (Math.random() - 0.5) * NEUTRAL_SPEED;
      const vy = (Math.random() - 0.5) * NEUTRAL_SPEED;

      for (let j = 0; j < groupSize; j++) {
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 30;

        mobs.push({
          x: baseX + offsetX,
          y: baseY + offsetY,
          size: MOB_SIZE,
          color: '#888888',
          vx,
          vy,
          isAlly: false,
          groupId: groupIdCounter,
          offsetX,
          offsetY,
        });
      }
      groupIdCounter++;
    }

    mobsRef.current = mobs;
    gameRunningRef.current = true;
    gamePausedRef.current = false;
    gameOverRef.current = false;
    setGameStats({ teamSize: 1, gameOver: false, won: false });
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
      keys.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
      keys.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (!started || !gameRunningRef.current) return;

    const gameLoop = () => {
      if (!gameRunningRef.current || gamePausedRef.current || gameOverRef.current) {
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const mobs = mobsRef.current;
      const allies = mobs.filter((m) => m.isAlly);
      const neutrals = mobs.filter((m) => !m.isAlly);
      const player = allies.find(m => m.isPlayer);

      if (!player) {
        gameOverRef.current = true;
        setGameStats(prev => ({ ...prev, gameOver: true }));
        return;
      }

      // Player movement
      if (keys.current['arrowleft'] || keys.current['a']) player.x -= SPEED;
      if (keys.current['arrowright'] || keys.current['d']) player.x += SPEED;
      if (keys.current['arrowup'] || keys.current['w']) player.y -= SPEED;
      if (keys.current['arrowdown'] || keys.current['s']) player.y += SPEED;

      // Keep player in bounds
      player.x = Math.max(MOB_SIZE, Math.min(CANVAS_WIDTH - MOB_SIZE, player.x));
      player.y = Math.max(MOB_SIZE, Math.min(CANVAS_HEIGHT - MOB_SIZE, player.y));

      // Move allies to follow the player
      const nonPlayerAllies = allies.filter(m => !m.isPlayer);
      nonPlayerAllies.forEach((ally, index) => {
        // Calculate desired position around the player
        const angle = (index / nonPlayerAllies.length) * Math.PI * 2;
        const distance = FOLLOW_DISTANCE + (Math.floor(index / 8) * 25); // Create rings of followers
        const targetX = player.x + Math.cos(angle) * distance;
        const targetY = player.y + Math.sin(angle) * distance;

        // Move towards target position
        const dx = targetX - ally.x;
        const dy = targetY - ally.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 5) { // Only move if not close enough
          const moveX = (dx / dist) * ALLY_FOLLOW_SPEED;
          const moveY = (dy / dist) * ALLY_FOLLOW_SPEED;
          
          ally.x += moveX;
          ally.y += moveY;

          // Keep allies in bounds
          ally.x = Math.max(MOB_SIZE, Math.min(CANVAS_WIDTH - MOB_SIZE, ally.x));
          ally.y = Math.max(MOB_SIZE, Math.min(CANVAS_HEIGHT - MOB_SIZE, ally.y));
        }
      });

      // Group movement for neutrals
      const groupLeaders = new Map<number, Mob>();
      for (const mob of neutrals) {
        if (mob.groupId) {
          if (!groupLeaders.has(mob.groupId)) {
            groupLeaders.set(mob.groupId, mob);
          }
        }
      }

      groupLeaders.forEach((leader) => {
        leader.x += leader.vx;
        leader.y += leader.vy;
        if (leader.x <= MOB_SIZE || leader.x >= CANVAS_WIDTH - MOB_SIZE) leader.vx *= -1;
        if (leader.y <= MOB_SIZE || leader.y >= CANVAS_HEIGHT - MOB_SIZE) leader.vy *= -1;
      });

      for (const mob of neutrals) {
        if (mob.groupId) {
          const leader = groupLeaders.get(mob.groupId);
          if (leader && mob !== leader) {
            mob.x = leader.x + (mob.offsetX || 0);
            mob.y = leader.y + (mob.offsetY || 0);
          }
        }
      }

      // Collision detection
      const collidedGroups = new Set<number>();
      for (const mob of neutrals) {
        const dist = Math.hypot(player.x - mob.x, player.y - mob.y);
        if (dist < MOB_SIZE * 1.5 && mob.groupId) {
          collidedGroups.add(mob.groupId);
        }
      }

      collidedGroups.forEach((groupId) => {
        const groupMobs = neutrals.filter((m) => m.groupId === groupId);
        const groupSize = groupMobs.length;

        if (allies.length >= groupSize) {
          // Convert neutral group to allies
          for (const mob of groupMobs) {
            mob.isAlly = true;
            mob.color = '#00ff00';
            mob.groupId = undefined; // Remove from neutral group
            mob.offsetX = undefined;
            mob.offsetY = undefined;
          }
        } else {
          // Player's team is smaller, lose some allies
          const toRemove = groupSize - allies.length;
          let removed = 0;
          mobsRef.current = mobsRef.current.filter((m) => {
            if (removed < toRemove && m.isAlly && !m.isPlayer) {
              removed++;
              return false;
            }
            return true;
          });
        }
      });

      // Update game stats
      const currentAllies = mobsRef.current.filter(m => m.isAlly);
      setGameStats({
        teamSize: currentAllies.length,
        gameOver: currentAllies.length === 0,
        won: currentAllies.length >= MAX_TEAM
      });

      // Check win/lose conditions
      if (currentAllies.length >= MAX_TEAM) {
        gameOverRef.current = true;
      }

      if (currentAllies.length === 0) {
        gameOverRef.current = true;
      }

      // Draw the game
      draw();

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [started]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw all mobs
    for (const mob of mobsRef.current) {
      ctx.fillStyle = mob.color;
      ctx.beginPath();
      ctx.arc(mob.x, mob.y, mob.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Different stroke for player
      if (mob.isPlayer) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
      }
      ctx.stroke();

      // Draw group size for neutral groups
      if (!mob.isAlly && mob.groupId) {
        const groupSize = mobsRef.current.filter(m => m.groupId === mob.groupId).length;
        const groupLeader = mobsRef.current.find(m => 
          m.groupId === mob.groupId && 
          !mobsRef.current.some(other => 
            other.groupId === mob.groupId && 
            other !== m && 
            (other.x < m.x || (other.x === m.x && other.y < m.y))
          )
        );
        
        if (mob === groupLeader) {
          ctx.fillStyle = "#ffcc00";
          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.fillText(`${groupSize}`, mob.x, mob.y - MOB_SIZE - 5);
        }
      }
    }

    // Draw player team size
    const player = mobsRef.current.find(m => m.isPlayer);
    if (player) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`Team: ${mobsRef.current.filter(m => m.isAlly).length}`, player.x, player.y - MOB_SIZE - 15);
    }
  };

  const handleStart = () => {
    setStarted(true);
    initializeGame();
  };

  const handlePause = () => {
    gamePausedRef.current = !gamePausedRef.current;
  };

  const handleRestart = () => {
    setStarted(false);
    gameRunningRef.current = false;
    gameOverRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setTimeout(() => {
      setStarted(true);
      initializeGame();
    }, 100);
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-red-400 mb-4">All Of Us Are Dead</h1>
          <p className="text-gray-300 mb-6">
            Recruit allies and survive! Move with arrow keys or WASD. Convert smaller groups to grow your team. 
            Your allies will follow you around. Avoid bigger groups or you'll lose members. Reach {MAX_TEAM} allies to win!
          </p>
          <button
            onClick={handleStart}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors"
          >
            Start Survival
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
      <div className="mb-4 text-center">
        <div className="flex items-center justify-center space-x-6 mb-2">
          <div className="text-lg">
            <span className="text-green-400">Team Size: {gameStats.teamSize}</span>
          </div>
          <div className="text-lg">
            <span className="text-blue-400">Target: {MAX_TEAM}</span>
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handlePause}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition-colors"
          >
            {gamePausedRef.current ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={handleRestart}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Restart
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-gray-600 rounded-lg bg-gray-800"
      />

      <div ref={infoRef} className="mt-4 text-center">
        {gameStats.won && (
          <div className="text-green-400 text-2xl font-bold">🎉 YOU WON! 🎉</div>
        )}
        {gameStats.gameOver && !gameStats.won && (
          <div className="text-red-400 text-2xl font-bold">💀 GAME OVER 💀</div>
        )}
      </div>

      <div className="mt-4 text-center text-gray-400 text-sm max-w-md">
        <p><strong>Controls:</strong> Arrow Keys or WASD to move</p>
        <p><strong>Goal:</strong> Touch smaller groups (gray) to recruit them. Your allies will follow you!</p>
        <p><strong>Strategy:</strong> Avoid larger groups that can eliminate your team members</p>
        <p><strong>Win Condition:</strong> Reach {MAX_TEAM} team members</p>
      </div>
    </div>
  );
};

export default AllOfUsAreDead;