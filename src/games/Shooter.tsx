import React, { useRef, useEffect, useState, useCallback } from 'react';

const GAME_WIDTH = 1200; // Increased map size
const GAME_HEIGHT = 800; // Increased map size
const PLAYER_RADIUS = 22;
const PLAYER_SPEED = 4.5;
const BULLET_SPEED = 13;
const ENEMY_RADIUS = 20;
const ENEMY_SPEED = 2.2;
const OBSTACLE_COLOR = '#444';
const MAX_AMMO = 8;
const RELOAD_TIME = 1200; // ms
const PLAYER_MAX_HEALTH = 100;
const ENEMY_MAX_HEALTH = 40;
const ENEMY_SPAWN_DELAY = 2000; // 2 seconds after kill
const AMMO_SPAWN_CHANCE = 0.3; // 30% chance to spawn ammo after enemy kill
const AMMO_SPAWN_DELAY = 5000; // 5 seconds minimum between ammo spawns

const CHALLENGES = [
  { name: 'Clear All Enemies', description: 'Eliminate all enemies to win.' },
  { name: 'Survive 60 Seconds', description: 'Survive for 60 seconds.' },
  { name: 'No Reload', description: 'Clear all enemies without reloading.' },
];

// Types
interface Vec2 { x: number; y: number; }
interface Bullet { pos: Vec2; vel: Vec2; fromPlayer: boolean; alive: boolean; }
interface Enemy { pos: Vec2; health: number; alive: boolean; cooldown: number; id: number; }
interface Obstacle { x: number; y: number; w: number; h: number; }

function distance(a: Vec2, b: Vec2) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}
function rectsOverlap(a: Obstacle, b: Obstacle) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function pointInRect(p: Vec2, r: Obstacle) {
  return p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h;
}

const Shooter: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'win' | 'lose'>('start');
  const [challenge, setChallenge] = useState(0);
  const [timer, setTimer] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [reloadMsg, setReloadMsg] = useState(false);
  const [score, setScore] = useState(0);
  const [enemiesKilled, setEnemiesKilled] = useState(0);
  const [player, setPlayer] = useState({
    pos: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 80 },
    health: PLAYER_MAX_HEALTH,
    ammo: MAX_AMMO,
    reloading: false,
    angle: 0,
  });
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [ammoPickups, setAmmoPickups] = useState<Vec2[]>([]);
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  
  const keys = useRef<{ [k: string]: boolean }>({});
  const mouse = useRef<{ x: number; y: number }>({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
  const lastTime = useRef<number>(0);
  const reloadTimeout = useRef<NodeJS.Timeout | null>(null);
  const surviveStart = useRef<number>(0);
  const noReloadUsed = useRef<boolean>(true);
  const nextEnemyId = useRef<number>(0);
  const lastAmmoSpawn = useRef<number>(0);
  const [started, setStarted] = useState(false);

  // Generate random obstacles for each game
  const generateRandomObstacles = useCallback(() => {
    const newObstacles: Obstacle[] = [];
    const numObstacles = 15 + Math.floor(Math.random() * 10); // 15-25 obstacles
    
    for (let i = 0; i < numObstacles; i++) {
      let attempts = 0;
      let obstacle: Obstacle;
      
      do {
        obstacle = {
          x: Math.random() * (GAME_WIDTH - 100) + 50,
          y: Math.random() * (GAME_HEIGHT - 100) + 50,
          w: 40 + Math.random() * 80, // Random width 40-120
          h: 40 + Math.random() * 80, // Random height 40-120
        };
        attempts++;
      } while (
        attempts < 50 && 
        (
          // Don't place obstacles too close to player spawn
          distance(obstacle, { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 80 }) < 100 ||
          // Don't overlap with existing obstacles
          newObstacles.some(existing => rectsOverlap(obstacle, existing))
        )
      );
      
      if (attempts < 50) {
        newObstacles.push(obstacle);
      }
    }
    
    setObstacles(newObstacles);
  }, []);

  // Check collision between player/enemy and obstacles
  const checkObstacleCollision = useCallback((pos: Vec2, radius: number): boolean => {
    return obstacles.some(obstacle => {
      const closestX = clamp(pos.x, obstacle.x, obstacle.x + obstacle.w);
      const closestY = clamp(pos.y, obstacle.y, obstacle.y + obstacle.h);
      const distanceToObstacle = distance(pos, { x: closestX, y: closestY });
      return distanceToObstacle < radius;
    });
  }, [obstacles]);

  // Setup level with random obstacles
  const setupLevel = useCallback(() => {
    setPlayer({
      pos: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 80 },
      health: PLAYER_MAX_HEALTH,
      ammo: MAX_AMMO,
      reloading: false,
      angle: 0,
    });
    setBullets([]);
    setEnemies([]);
    setAmmoPickups([]);
    setScore(0);
    setEnemiesKilled(0);
    setMessage(null);
    setReloadMsg(false);
    noReloadUsed.current = true;
    setTimer(0);
    surviveStart.current = Date.now();
    nextEnemyId.current = 0;
    lastAmmoSpawn.current = 0;
    setCameraOffset({ x: 0, y: 0 });
    
    // Generate random obstacles for this game
    generateRandomObstacles();
    
    // Spawn initial enemies
    spawnEnemy();
    spawnEnemy();
  }, [generateRandomObstacles]);

  // Spawn enemy at random location
  const spawnEnemy = useCallback(() => {
    let attempts = 0;
    let enemyPos: Vec2;
    
    do {
      // Spawn enemies at map edges
      const side = Math.floor(Math.random() * 4);
      switch (side) {
        case 0: // Top
          enemyPos = { x: Math.random() * GAME_WIDTH, y: -ENEMY_RADIUS };
          break;
        case 1: // Right
          enemyPos = { x: GAME_WIDTH + ENEMY_RADIUS, y: Math.random() * GAME_HEIGHT };
          break;
        case 2: // Bottom
          enemyPos = { x: Math.random() * GAME_WIDTH, y: GAME_HEIGHT + ENEMY_RADIUS };
          break;
        default: // Left
          enemyPos = { x: -ENEMY_RADIUS, y: Math.random() * GAME_HEIGHT };
      }
      attempts++;
    } while (
      attempts < 20 && 
      (checkObstacleCollision(enemyPos, ENEMY_RADIUS) || 
       distance(enemyPos, player.pos) < 150)
    );
    
    if (attempts < 20) {
      setEnemies(prev => [...prev, {
        pos: enemyPos,
        health: ENEMY_MAX_HEALTH,
        alive: true,
        cooldown: 0,
        id: nextEnemyId.current++
      }]);
    }
  }, [player.pos, checkObstacleCollision]);

  // Spawn ammo pickup
  const spawnAmmoPickup = useCallback((pos: Vec2) => {
    const now = Date.now();
    if (now - lastAmmoSpawn.current < AMMO_SPAWN_DELAY) return;
    
    if (Math.random() < AMMO_SPAWN_CHANCE) {
      setAmmoPickups(prev => [...prev, { x: pos.x, y: pos.y }]);
      lastAmmoSpawn.current = now;
    }
  }, []);

  // Handle keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const up = (e: KeyboardEvent) => (keys.current[e.code] = false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // Handle mouse
  useEffect(() => {
    const move = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.current.x = e.clientX - rect.left + cameraOffset.x;
      mouse.current.y = e.clientY - rect.top + cameraOffset.y;
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [cameraOffset]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    let animId: number;
    const loop = (t: number) => {
      if (!lastTime.current) lastTime.current = t;
      const dt = Math.min((t - lastTime.current) / 16.6667, 2);
      lastTime.current = t;
      updateGame(dt);
      draw();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, player, bullets, enemies, obstacles, ammoPickups, challenge, cameraOffset]);

  // Timer for challenges
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (challenge === 1) {
      const interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - surviveStart.current) / 1000));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [gameState, challenge]);

  // Shooting
  const shoot = () => {
    if (player.reloading || player.ammo <= 0) return;
    setBullets(bullets => [
      ...bullets,
      {
        pos: { x: player.pos.x, y: player.pos.y },
        vel: {
          x: Math.cos(player.angle) * BULLET_SPEED,
          y: Math.sin(player.angle) * BULLET_SPEED,
        },
        fromPlayer: true,
        alive: true,
      },
    ]);
    setPlayer(p => ({ ...p, ammo: p.ammo - 1 }));
    if (challenge === 2) noReloadUsed.current = false;
  };

  // Reload
  const reload = () => {
    if (player.reloading || player.ammo === MAX_AMMO) return;
    setPlayer(p => ({ ...p, reloading: true }));
    setReloadMsg(true);
    reloadTimeout.current = setTimeout(() => {
      setPlayer(p => ({ ...p, ammo: MAX_AMMO, reloading: false }));
      setReloadMsg(false);
    }, RELOAD_TIME);
  };

  // Handle controls
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        shoot();
      }
      if (e.code === 'KeyR') {
        e.preventDefault();
        reload();
      }
    };
    window.addEventListener('keydown', onDown);
    return () => window.removeEventListener('keydown', onDown);
  }, [player]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (gameState === 'playing') {
        e.preventDefault();
        shoot();
      }
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [gameState, player]);

  // Game update logic
  const updateGame = useCallback((dt: number) => {
    if (gameState !== 'playing') return;

    // Update player angle (aiming)
    const dx = mouse.current.x - player.pos.x;
    const dy = mouse.current.y - player.pos.y;
    const newAngle = Math.atan2(dy, dx);
    setPlayer(p => ({ ...p, angle: newAngle }));

    // Player movement with obstacle collision
    const newPos = { ...player.pos };
    const moveSpeed = PLAYER_SPEED * dt;
    
    if (keys.current['KeyW'] || keys.current['ArrowUp']) {
      const testPos = { x: newPos.x, y: newPos.y - moveSpeed };
      if (!checkObstacleCollision(testPos, PLAYER_RADIUS)) {
        newPos.y = testPos.y;
      }
    }
    if (keys.current['KeyS'] || keys.current['ArrowDown']) {
      const testPos = { x: newPos.x, y: newPos.y + moveSpeed };
      if (!checkObstacleCollision(testPos, PLAYER_RADIUS)) {
        newPos.y = testPos.y;
      }
    }
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) {
      const testPos = { x: newPos.x - moveSpeed, y: newPos.y };
      if (!checkObstacleCollision(testPos, PLAYER_RADIUS)) {
        newPos.x = testPos.x;
      }
    }
    if (keys.current['KeyD'] || keys.current['ArrowRight']) {
      const testPos = { x: newPos.x + moveSpeed, y: newPos.y };
      if (!checkObstacleCollision(testPos, PLAYER_RADIUS)) {
        newPos.x = testPos.x;
      }
    }
    
    // Clamp to map bounds
    newPos.x = clamp(newPos.x, PLAYER_RADIUS, GAME_WIDTH - PLAYER_RADIUS);
    newPos.y = clamp(newPos.y, PLAYER_RADIUS, GAME_HEIGHT - PLAYER_RADIUS);
    setPlayer(p => ({ ...p, pos: newPos }));

    // Update camera to follow player
    const canvas = canvasRef.current;
    if (canvas) {
      const viewWidth = canvas.width;
      const viewHeight = canvas.height;
      
      setCameraOffset({
        x: clamp(newPos.x - viewWidth / 2, 0, GAME_WIDTH - viewWidth),
        y: clamp(newPos.y - viewHeight / 2, 0, GAME_HEIGHT - viewHeight)
      });
    }

    // Update bullets
    setBullets(bullets => bullets.map(bullet => {
      if (!bullet.alive) return bullet;
      const newBulletPos = {
        x: bullet.pos.x + bullet.vel.x * dt,
        y: bullet.pos.y + bullet.vel.y * dt,
      };
      
      // Check if bullet hits obstacles
      if (checkObstacleCollision(newBulletPos, 2)) {
        return { ...bullet, alive: false };
      }
      
      // Check if bullet is off map
      if (newBulletPos.x < 0 || newBulletPos.x > GAME_WIDTH || 
          newBulletPos.y < 0 || newBulletPos.y > GAME_HEIGHT) {
        return { ...bullet, alive: false };
      }
      return { ...bullet, pos: newBulletPos };
    }).filter(b => b.alive));

    // Update enemies with obstacle collision
    setEnemies(enemies => enemies.map(enemy => {
      if (!enemy.alive) return enemy;
      
      // Simple AI: move towards player while avoiding obstacles
      const dx = player.pos.x - enemy.pos.x;
      const dy = player.pos.y - enemy.pos.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist > 0) {
        const moveX = (dx / dist) * ENEMY_SPEED * dt;
        const moveY = (dy / dist) * ENEMY_SPEED * dt;
        
        const testPos = {
          x: enemy.pos.x + moveX,
          y: enemy.pos.y + moveY
        };
        
        // Only move if not colliding with obstacles
        let newPos = enemy.pos;
        if (!checkObstacleCollision(testPos, ENEMY_RADIUS)) {
          newPos = testPos;
        } else {
          // Try moving only in X direction
          const testPosX = { x: enemy.pos.x + moveX, y: enemy.pos.y };
          if (!checkObstacleCollision(testPosX, ENEMY_RADIUS)) {
            newPos = testPosX;
          } else {
            // Try moving only in Y direction
            const testPosY = { x: enemy.pos.x, y: enemy.pos.y + moveY };
            if (!checkObstacleCollision(testPosY, ENEMY_RADIUS)) {
              newPos = testPosY;
            }
          }
        }
        
        // Clamp to map bounds
        newPos.x = clamp(newPos.x, ENEMY_RADIUS, GAME_WIDTH - ENEMY_RADIUS);
        newPos.y = clamp(newPos.y, ENEMY_RADIUS, GAME_HEIGHT - ENEMY_RADIUS);
        
        // Enemy shooting
        let newCooldown = enemy.cooldown - dt;
        if (newCooldown <= 0 && dist < 200) {
          // Shoot at player
          const angle = Math.atan2(dy, dx);
          setBullets(bullets => [...bullets, {
            pos: { x: enemy.pos.x, y: enemy.pos.y },
            vel: { x: Math.cos(angle) * BULLET_SPEED * 0.8, y: Math.sin(angle) * BULLET_SPEED * 0.8 },
            fromPlayer: false,
            alive: true,
          }]);
          newCooldown = 60; // Reset cooldown
        }
        
        return { ...enemy, pos: newPos, cooldown: newCooldown };
      }
      return enemy;
    }));

    // Check bullet collisions
    setBullets(bullets => bullets.map(bullet => {
      if (!bullet.alive) return bullet;
      
      // Check bullet-enemy collisions (player bullets only)
      if (bullet.fromPlayer) {
        for (const enemy of enemies) {
          if (enemy.alive && distance(bullet.pos, enemy.pos) < ENEMY_RADIUS) {
            // Damage enemy (2 bullets to kill)
            setEnemies(enemies => enemies.map(e => 
              e.id === enemy.id ? { ...e, health: e.health - 20 } : e
            ));
            
            // Check if enemy died
            if (enemy.health <= 20) {
              setEnemies(enemies => enemies.map(e => 
                e.id === enemy.id ? { ...e, alive: false } : e
              ));
              setScore(s => s + 10);
              setEnemiesKilled(k => k + 1);
              
              // Chance to spawn ammo pickup
              spawnAmmoPickup(enemy.pos);
              
              // Spawn new enemy after delay
              setTimeout(() => {
                if (gameState === 'playing') {
                  spawnEnemy();
                }
              }, ENEMY_SPAWN_DELAY);
            }
            
            return { ...bullet, alive: false };
          }
        }
      } else {
        // Check bullet-player collisions (enemy bullets)
        if (distance(bullet.pos, player.pos) < PLAYER_RADIUS) {
          setPlayer(p => ({ ...p, health: p.health - 15 }));
          return { ...bullet, alive: false };
        }
      }
      
      return bullet;
    }));

    // Check ammo pickup collection
    setAmmoPickups(pickups => pickups.filter(pickup => {
      if (distance(pickup, player.pos) < PLAYER_RADIUS + 10) {
        setPlayer(p => ({ ...p, ammo: Math.min(p.ammo + 4, MAX_AMMO) }));
        return false; // Remove pickup
      }
      return true;
    }));

    // Check win/lose conditions
    const aliveEnemies = enemies.filter(e => e.alive);
    const playerDead = player.health <= 0;
    
    if (playerDead) {
      setGameState('lose');
      return;
    }
    
    if (challenge === 0 && aliveEnemies.length === 0 && enemiesKilled >= 10) {
      setGameState('win');
      return;
    }
    
    if (challenge === 1 && timer >= 60) {
      setGameState('win');
      return;
    }
    
    if (challenge === 2 && aliveEnemies.length === 0 && enemiesKilled >= 5 && noReloadUsed.current) {
      setGameState('win');
      return;
    }
  }, [gameState, player, enemies, challenge, timer, enemiesKilled, checkObstacleCollision, spawnAmmoPickup, spawnEnemy]);

  // Drawing function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context for camera transform
    ctx.save();
    ctx.translate(-cameraOffset.x, -cameraOffset.y);
    
    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#444');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw grid pattern
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let x = 0; x < GAME_WIDTH; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GAME_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < GAME_HEIGHT; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GAME_WIDTH, y);
      ctx.stroke();
    }
    
    // Draw obstacles
    ctx.fillStyle = OBSTACLE_COLOR;
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    obstacles.forEach(obs => {
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
    });
    
    // Draw ammo pickups
    ammoPickups.forEach(pickup => {
      ctx.save();
      ctx.fillStyle = '#00ff00';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pickup.x, pickup.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Draw ammo symbol
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('A', pickup.x, pickup.y + 3);
      ctx.restore();
    });
    
    // Draw bullets
    bullets.forEach(bullet => {
      if (!bullet.alive) return;
      ctx.beginPath();
      ctx.arc(bullet.pos.x, bullet.pos.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = bullet.fromPlayer ? '#00ff00' : '#ff0000';
      ctx.fill();
    });
    
    // Draw enemies
    enemies.forEach(enemy => {
      if (!enemy.alive || enemy.health <= 0) return;
      ctx.beginPath();
      ctx.arc(enemy.pos.x, enemy.pos.y, ENEMY_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#ff4444';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Health bar
      const healthPercent = enemy.health / ENEMY_MAX_HEALTH;
      ctx.fillStyle = '#333';
      ctx.fillRect(enemy.pos.x - 15, enemy.pos.y - 30, 30, 4);
      ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : '#ff0000';
      ctx.fillRect(enemy.pos.x - 15, enemy.pos.y - 30, 30 * healthPercent, 4);
    });
    
    // Draw player
    ctx.beginPath();
    ctx.arc(player.pos.x, player.pos.y, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#4444ff';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Player direction indicator
    ctx.beginPath();
    ctx.moveTo(player.pos.x, player.pos.y);
    ctx.lineTo(
      player.pos.x + Math.cos(player.angle) * 30,
      player.pos.y + Math.sin(player.angle) * 30
    );
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Player health bar
    const healthPercent = player.health / PLAYER_MAX_HEALTH;
    ctx.fillStyle = '#333';
    ctx.fillRect(player.pos.x - 20, player.pos.y - 35, 40, 5);
    ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : '#ff0000';
    ctx.fillRect(player.pos.x - 20, player.pos.y - 35, 40 * healthPercent, 5);
    
    // Restore context
    ctx.restore();
    
    // UI (fixed position)
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Health: ${Math.max(0, player.health)}`, 10, 30);
    ctx.fillText(`Ammo: ${player.ammo}/${MAX_AMMO}`, 10, 55);
    ctx.fillText(`Score: ${score}`, 10, 80);
    ctx.fillText(`Enemies Killed: ${enemiesKilled}`, 10, 105);
    
    if (challenge === 1) {
      ctx.fillText(`Time: ${60 - timer}s`, 10, 130);
    }
    
    if (reloadMsg) {
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('RELOADING...', canvas.width / 2, canvas.height / 2);
    }
    
    if (message) {
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 30);
    }
  }, [player, bullets, enemies, obstacles, ammoPickups, score, enemiesKilled, timer, reloadMsg, message, challenge, cameraOffset]);

  // Start game
  const startGame = () => {
    setupLevel();
    setGameState('playing');
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
        <div style={{ color: '#fff', fontSize: 16 }}>Enhanced PUBG 2D with larger map, smarter enemies, and optimized ammo system!</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 font-inter p-4">
      <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">PUBG 2D Enhanced</h1>
      <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-gray-700 flex flex-col items-center p-2 md:p-4 lg:p-6" style={{ width: 900, height: 600 }}>
        <canvas
          ref={canvasRef}
          width={900}
          height={600}
          className="bg-gray-900 rounded-lg border-2 border-gray-300"
        ></canvas>
        
        {/* Start Screen */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-white text-5xl font-extrabold mb-6 animate-pulse">PUBG 2D Enhanced</h2>
            <div className="bg-gray-800 rounded-xl p-6 mb-6 max-w-md">
              <h3 className="text-amber-400 text-xl font-bold mb-4">Select Challenge:</h3>
              {CHALLENGES.map((ch, index) => (
                <button
                  key={index}
                  onClick={() => setChallenge(index)}
                  className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                    challenge === index 
                      ? 'bg-amber-500 text-gray-900' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  <div className="font-bold">{ch.name}</div>
                  <div className="text-sm opacity-80">{ch.description}</div>
                </button>
              ))}
            </div>
            <button
              onClick={startGame}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Start Game
            </button>
          </div>
        )}
        
        {/* Win Screen */}
        {gameState === 'win' && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-green-400 text-6xl font-extrabold mb-4 animate-bounce">MISSION COMPLETE!</h2>
            <p className="text-white text-2xl mb-2">Score: {score}</p>
            <p className="text-white text-xl mb-2">Enemies Killed: {enemiesKilled}</p>
            <p className="text-white text-xl mb-8">Challenge completed successfully!</p>
            <button
              onClick={() => setGameState('start')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Play Again
            </button>
          </div>
        )}
        
        {/* Lose Screen */}
        {gameState === 'lose' && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-red-500 text-6xl font-extrabold mb-4 animate-shake">MISSION FAILED!</h2>
            <p className="text-white text-2xl mb-2">Score: {score}</p>
            <p className="text-white text-xl mb-2">Enemies Killed: {enemiesKilled}</p>
            <p className="text-white text-xl mb-8">Try again to complete the challenge!</p>
            <button
              onClick={() => setGameState('start')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
      <div className="mt-8 text-center text-white">
        <p className="text-lg">Enhanced Features:</p>
        <p className="text-md">• Larger map with camera following • Random obstacle generation</p>
        <p className="text-md">• Enemies take 2 bullets to kill • Rare ammo pickups after kills</p>
        <p className="text-md">• Smart enemy spawning • Improved collision detection</p>
        <p className="text-md">Move: <span className="text-yellow-300">WASD</span> • Aim: <span className="text-yellow-300">Mouse</span> • Shoot: <span className="text-yellow-300">Click/Space</span> • Reload: <span className="text-yellow-300">R</span></p>
      </div>
    </div>
  );
};

export default Shooter;