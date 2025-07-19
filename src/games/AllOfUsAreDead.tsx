import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const CANVAS_WIDTH = 1200; // Increased map width
const CANVAS_HEIGHT = 900; // Increased map height
const MOB_SIZE = 20;
const SPEED = 2;
const NEUTRAL_SPEED = 0.5;
const ALLY_FOLLOW_SPEED = 1.8;
const MAX_TEAM = 50;
const GROUP_COUNT = 20; // Increased group count for bigger map
const FOLLOW_DISTANCE = 40; // Distance allies try to maintain from player
const FIGHT_ANIMATION_FRAMES = 30; // Frames for fighting animation
const FIGHT_DISTANCE = 25; // Distance for fighting animation
const LEVEL1_HP = 60; // 2 seconds at 30fps
const LEVEL2_HP = 120; // 4 seconds at 30fps
const FIGHT_DAMAGE_PER_FRAME = 1; // Damage per frame when fighting
const SPAWN_LEVEL2_AFTER = 30; // Spawn level 2 mobs after 30 seconds

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
  fighting?: boolean;
  fightFrame?: number;
  fightTarget?: Mob;
  level?: number;
  hp?: number;
  maxHp?: number;
  isFighting?: boolean;
  fightingWith?: Mob[];
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
  const gameTimeRef = useRef(0);
  const level2SpawnedRef = useRef(false);
  const { user } = useAuth();

  // Initialize game
  // Spawn level 2 mobs
  const spawnLevel2Mobs = () => {
    const mobs = mobsRef.current;
    let groupIdCounter = Math.max(...mobs.map(m => m.groupId || 0)) + 1;
    
    // Spawn 5 level 2 groups
    for (let i = 0; i < 5; i++) {
      const groupSize = Math.floor(Math.random() * 4) + 2; // 2-5 mobs per group
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
          color: '#ff4444', // Red color for level 2
          vx,
          vy,
          isAlly: false,
          groupId: groupIdCounter,
          offsetX,
          offsetY,
          level: 2,
          hp: LEVEL2_HP,
          maxHp: LEVEL2_HP,
          fightingWith: [],
        });
      }
      groupIdCounter++;
    }
  };

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
      level: 1,
      hp: 100,
      maxHp: 100,
    });

    // Create level 1 neutral groups only
    let groupIdCounter = 1;
    for (let i = 0; i < GROUP_COUNT; i++) {
      const groupSize = Math.floor(Math.random() * 3) + 1; // Smaller groups initially
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
          level: 1,
          hp: LEVEL1_HP,
          maxHp: LEVEL1_HP,
          fightingWith: [],
        });
      }
      groupIdCounter++;
    }

    mobsRef.current = mobs;
    gameRunningRef.current = true;
    gamePausedRef.current = false;
    gameOverRef.current = false;
    gameTimeRef.current = 0;
    level2SpawnedRef.current = false;
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

      // Update game time
      gameTimeRef.current++;
      
      // Spawn level 2 mobs after 30 seconds
      if (!level2SpawnedRef.current && gameTimeRef.current >= SPAWN_LEVEL2_AFTER * 30) {
        spawnLevel2Mobs();
        level2SpawnedRef.current = true;
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

      // Complex fighting system with HP and levels
      const fightingGroups = new Map<number, { mobs: Mob[], allies: Mob[] }>();
      
      // Check for collisions between allies and neutral groups
      for (const ally of allies) {
        for (const neutral of neutrals) {
          const dist = Math.hypot(ally.x - neutral.x, ally.y - neutral.y);
          if (dist < MOB_SIZE * 1.5 && neutral.groupId) {
            if (!fightingGroups.has(neutral.groupId)) {
              fightingGroups.set(neutral.groupId, { mobs: [], allies: [] });
            }
            const group = fightingGroups.get(neutral.groupId)!;
            if (!group.mobs.includes(neutral)) {
              group.mobs.push(neutral);
            }
            if (!group.allies.includes(ally)) {
              group.allies.push(ally);
            }
          }
        }
      }

      // Process fighting groups
      fightingGroups.forEach((group, groupId) => {
        const { mobs, allies } = group;
        
        // Start fighting for all involved mobs
        mobs.forEach(mob => {
          if (!mob.isFighting) {
            mob.isFighting = true;
            mob.fightingWith = [...allies];
          }
        });
        
        allies.forEach(ally => {
          if (!ally.isFighting) {
            ally.isFighting = true;
            ally.fightingWith = [...mobs];
          }
        });

        // Apply damage to neutral mobs
        mobs.forEach(mob => {
          if (mob.hp !== undefined) {
            mob.hp -= allies.length * FIGHT_DAMAGE_PER_FRAME;
            
            // Check if mob is defeated
            if (mob.hp <= 0) {
              mob.isAlly = true;
              mob.color = mob.level === 2 ? '#00aa00' : '#00ff00'; // Darker green for level 2
              mob.groupId = undefined;
              mob.offsetX = undefined;
              mob.offsetY = undefined;
              mob.isFighting = false;
              mob.fightingWith = [];
              mob.hp = undefined;
              mob.maxHp = undefined;
              
              // Start conversion animation
              mob.fighting = true;
              mob.fightFrame = 0;
              mob.fightTarget = player;
            }
          }
        });

        // Apply damage to allies from neutral mobs
        allies.forEach(ally => {
          if (ally.hp !== undefined) {
            ally.hp -= mobs.length * FIGHT_DAMAGE_PER_FRAME;
            
            // Check if ally dies
            if (ally.hp <= 0) {
              // Remove dead ally but don't end game
              const index = mobsRef.current.indexOf(ally);
              if (index > -1) {
                mobsRef.current.splice(index, 1);
              }
            }
          }
        });
      });

      // Check for direct player collision with neutral groups
      for (const neutral of neutrals) {
        const dist = Math.hypot(player.x - neutral.x, player.y - neutral.y);
        if (dist < MOB_SIZE * 1.5 && neutral.groupId) {
          const groupMobs = neutrals.filter((m) => m.groupId === neutral.groupId);
          const groupSize = groupMobs.length;
          
          if (allies.length < groupSize) {
            // Player's team is smaller - GAME OVER
            gameOverRef.current = true;
            setGameStats(prev => ({ ...prev, gameOver: true }));
            return;
          }
        }
      }

      // Heal allies after fights (when they're not fighting anymore)
      allies.forEach(ally => {
        if (ally.hp !== undefined && !ally.isFighting && ally.hp < ally.maxHp!) {
          ally.hp = Math.min(ally.hp + 2, ally.maxHp!); // Heal 2 HP per frame when not fighting
        }
      });

      // Update fighting animations and stop fighting when not in range
      for (const mob of mobsRef.current) {
        if (mob.fighting && mob.fightFrame !== undefined) {
          mob.fightFrame++;
          if (mob.fightFrame >= FIGHT_ANIMATION_FRAMES) {
            mob.fighting = false;
            mob.fightFrame = undefined;
            mob.fightTarget = undefined;
          }
        }
        
        // Stop fighting if no longer in range
        if (mob.isFighting && mob.fightingWith) {
          const stillInRange = mob.fightingWith.some(target => {
            const dist = Math.hypot(mob.x - target.x, mob.y - target.y);
            return dist < MOB_SIZE * 1.5;
          });
          
          if (!stillInRange) {
            mob.isFighting = false;
            mob.fightingWith = [];
          }
        }
      }

      // Update game stats
      const currentAllies = mobsRef.current.filter(m => m.isAlly);
      const hasPlayer = currentAllies.some(m => m.isPlayer);
      
      setGameStats({
        teamSize: currentAllies.length,
        gameOver: !hasPlayer || gameOverRef.current,
        won: currentAllies.length >= MAX_TEAM
      });

      // Check win/lose conditions
      if (currentAllies.length >= MAX_TEAM) {
        gameOverRef.current = true;
        setGameStats(prev => ({ ...prev, won: true }));
      }

      if (!hasPlayer) {
        gameOverRef.current = true;
        setGameStats(prev => ({ ...prev, gameOver: true }));
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

      // Draw HP bar for neutral mobs
      if (!mob.isAlly && mob.hp !== undefined && mob.maxHp !== undefined) {
        const hpBarWidth = 30;
        const hpBarHeight = 4;
        const hpPercentage = mob.hp / mob.maxHp;
        
        // HP bar background
        ctx.fillStyle = '#333';
        ctx.fillRect(mob.x - hpBarWidth/2, mob.y - mob.size - 10, hpBarWidth, hpBarHeight);
        
        // HP bar fill
        ctx.fillStyle = hpPercentage > 0.5 ? '#00ff00' : hpPercentage > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(mob.x - hpBarWidth/2, mob.y - mob.size - 10, hpBarWidth * hpPercentage, hpBarHeight);
      }

      // Draw fighting animation with sword
      if (mob.fighting && mob.fightFrame !== undefined && mob.fightTarget) {
        const progress = mob.fightFrame / FIGHT_ANIMATION_FRAMES;
        const angle = Math.atan2(mob.fightTarget.y - mob.y, mob.fightTarget.x - mob.x);
        
        // Sword animation
        const swordLength = 30;
        const swordStartX = mob.x + Math.cos(angle) * (mob.size + 5);
        const swordStartY = mob.y + Math.sin(angle) * (mob.size + 5);
        const swordEndX = swordStartX + Math.cos(angle) * swordLength;
        const swordEndY = swordStartY + Math.sin(angle) * swordLength;
        
        // Sword blade
        ctx.strokeStyle = '#ffd700'; // Gold color for sword
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(swordStartX, swordStartY);
        ctx.lineTo(swordEndX, swordEndY);
        ctx.stroke();
        
        // Sword handle
        ctx.strokeStyle = '#8b4513'; // Brown handle
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mob.x, mob.y);
        ctx.lineTo(swordStartX, swordStartY);
        ctx.stroke();
        
        // Fighting effect particles
        const particleCount = 5;
        for (let i = 0; i < particleCount; i++) {
          const particleAngle = angle + (Math.random() - 0.5) * Math.PI / 4;
          const particleDist = Math.random() * 20 + 10;
          const particleX = mob.x + Math.cos(particleAngle) * particleDist;
          const particleY = mob.y + Math.sin(particleAngle) * particleDist;
          
          ctx.fillStyle = `rgba(255, 215, 0, ${1 - progress})`; // Fading gold particles
          ctx.beginPath();
          ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw fighting indicator for mobs in combat
      if (mob.isFighting && mob.fightingWith && mob.fightingWith.length > 0) {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(mob.x, mob.y, mob.size + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

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
          ctx.fillStyle = mob.level === 2 ? "#ff4444" : "#ffcc00";
          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.fillText(`L${mob.level} ${groupSize}`, mob.x, mob.y - MOB_SIZE - 5);
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
            Recruit allies and survive! Move with arrow keys or WASD. Fight level 1 mobs (2s) and level 2 mobs (4s) to convert them. 
            Your allies will fight automatically. Touch bigger groups and you'll DIE! Level 2 mobs spawn after 30s. Reach {MAX_TEAM} allies to win!
          </p>
          <button
            onClick={handleStart}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors"
          >
            Start Survival
          </button>
          <div className="mt-4 text-center text-gray-400 text-sm max-w-md">
            <p><strong>Controls:</strong> Arrow Keys or WASD to move</p>
            <p><strong>Goal:</strong> Fight level 1 mobs (gray, 2s) and level 2 mobs (red, 4s) to recruit them!</p>
            <p><strong>Strategy:</strong> Multiple allies can fight simultaneously. Avoid larger groups - instant death!</p>
            <p><strong>Win Condition:</strong> Reach {MAX_TEAM} team members</p>
          </div>
        </div>
      </div>
    );
  }

  // Game over screen
  if (gameStats.gameOver || gameStats.won) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8">
        <div className="text-center max-w-md">
          {gameStats.won ? (
            <>
              <h1 className="text-4xl font-bold text-green-400 mb-4">Victory!</h1>
              <p className="text-gray-300 mb-6">
                Congratulations! You've successfully recruited {gameStats.teamSize} allies and survived the apocalypse!
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-red-400 mb-4">Game Over</h1>
              <p className="text-gray-300 mb-6">
                You were defeated! Your team size was {gameStats.teamSize}. Try again to reach {MAX_TEAM} allies!
              </p>
            </>
          )}
          <button
            onClick={handleRestart}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors mb-4"
          >
            Play Again
          </button>
          <div className="mt-4 text-center text-gray-400 text-sm">
            <p><strong>Final Team Size:</strong> {gameStats.teamSize}</p>
            <p><strong>Target:</strong> {MAX_TEAM} allies</p>
          </div>
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
        {/* Game stats displayed during gameplay */}
      </div>

      <div className="mt-4 text-center text-gray-400 text-sm max-w-md">
        <p><strong>Controls:</strong> Arrow Keys or WASD to move</p>
        <p><strong>Goal:</strong> Fight level 1 mobs (gray, 2s) and level 2 mobs (red, 4s) to recruit them!</p>
        <p><strong>Strategy:</strong> Multiple allies can fight simultaneously. Avoid larger groups - instant death!</p>
        <p><strong>Win Condition:</strong> Reach {MAX_TEAM} team members</p>
      </div>
    </div>
  );
};

export default AllOfUsAreDead;