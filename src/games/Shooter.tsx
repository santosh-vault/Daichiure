import React, { useRef, useEffect, useState, useCallback } from 'react';

const GAME_WIDTH = 900;
const GAME_HEIGHT = 600;
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
const CHALLENGES = [
  { name: 'Clear All Enemies', description: 'Eliminate all enemies to win.' },
  { name: 'Survive 60 Seconds', description: 'Survive for 60 seconds.' },
  { name: 'No Reload', description: 'Clear all enemies without reloading.' },
];

// Types
interface Vec2 { x: number; y: number; }
interface Bullet { pos: Vec2; vel: Vec2; fromPlayer: boolean; alive: boolean; }
interface Enemy { pos: Vec2; health: number; alive: boolean; cooldown: number; }
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
  const keys = useRef<{ [k: string]: boolean }>({});
  const mouse = useRef<{ x: number; y: number }>({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
  const lastTime = useRef<number>(0);
  const reloadTimeout = useRef<NodeJS.Timeout | null>(null);
  const surviveStart = useRef<number>(0);
  const noReloadUsed = useRef<boolean>(true);
  const [started, setStarted] = useState(false);

  // Setup obstacles, enemies, etc.
  const setupLevel = useCallback(() => {
    setPlayer({
      pos: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 80 },
      health: PLAYER_MAX_HEALTH,
      ammo: MAX_AMMO,
      reloading: false,
      angle: 0,
    });
    setBullets([]);
    setScore(0);
    setMessage(null);
    setReloadMsg(false);
    noReloadUsed.current = true;
    setTimer(0);
    surviveStart.current = Date.now();
    // Obstacles
    setObstacles([
      { x: 200, y: 200, w: 120, h: 30 },
      { x: 600, y: 300, w: 40, h: 140 },
      { x: 400, y: 100, w: 80, h: 40 },
      { x: 300, y: 400, w: 200, h: 30 },
    ]);
    // Enemies
    setEnemies([
      { pos: { x: 120, y: 120 }, health: ENEMY_MAX_HEALTH, alive: true, cooldown: 0 },
      { pos: { x: 700, y: 180 }, health: ENEMY_MAX_HEALTH, alive: true, cooldown: 0 },
      { pos: { x: 500, y: 500 }, health: ENEMY_MAX_HEALTH, alive: true, cooldown: 0 },
      { pos: { x: 800, y: 400 }, health: ENEMY_MAX_HEALTH, alive: true, cooldown: 0 },
    ]);
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
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

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
    // eslint-disable-next-line
  }, [gameState, player, bullets, enemies, obstacles, challenge]);

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
      if (e.code === 'Space') shoot();
      if (e.code === 'KeyR') reload();
    };
    window.addEventListener('keydown', onDown);
    return () => window.removeEventListener('keydown', onDown);
  });
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (gameState === 'playing') shoot();
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

    // Player movement
    const newPos = { ...player.pos };
    if (keys.current['KeyW'] || keys.current['ArrowUp']) newPos.y -= PLAYER_SPEED * dt;
    if (keys.current['KeyS'] || keys.current['ArrowDown']) newPos.y += PLAYER_SPEED * dt;
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) newPos.x -= PLAYER_SPEED * dt;
    if (keys.current['KeyD'] || keys.current['ArrowRight']) newPos.x += PLAYER_SPEED * dt;
    
    // Clamp to screen
    newPos.x = clamp(newPos.x, PLAYER_RADIUS, GAME_WIDTH - PLAYER_RADIUS);
    newPos.y = clamp(newPos.y, PLAYER_RADIUS, GAME_HEIGHT - PLAYER_RADIUS);
    setPlayer(p => ({ ...p, pos: newPos }));

    // Update bullets
    setBullets(bullets => bullets.map(bullet => {
      if (!bullet.alive) return bullet;
      const newPos = {
        x: bullet.pos.x + bullet.vel.x * dt,
        y: bullet.pos.y + bullet.vel.y * dt,
      };
      // Check if bullet is off screen
      if (newPos.x < 0 || newPos.x > GAME_WIDTH || newPos.y < 0 || newPos.y > GAME_HEIGHT) {
        return { ...bullet, alive: false };
      }
      return { ...bullet, pos: newPos };
    }).filter(b => b.alive));

    // Update enemies
    setEnemies(enemies => enemies.map(enemy => {
      if (!enemy.alive) return enemy;
      
      // Simple AI: move towards player
      const dx = player.pos.x - enemy.pos.x;
      const dy = player.pos.y - enemy.pos.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist > 0) {
        const newPos = {
          x: enemy.pos.x + (dx / dist) * ENEMY_SPEED * dt,
          y: enemy.pos.y + (dy / dist) * ENEMY_SPEED * dt,
        };
        // Clamp to screen
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
      
      // Check bullet-enemy collisions
      if (bullet.fromPlayer) {
        for (const enemy of enemies) {
          if (enemy.alive && distance(bullet.pos, enemy.pos) < ENEMY_RADIUS) {
            setEnemies(enemies => enemies.map(e => 
              e === enemy ? { ...e, health: e.health - 20 } : e
            ));
            setScore(s => s + 10);
            return { ...bullet, alive: false };
          }
        }
      } else {
        // Check bullet-player collisions
        if (distance(bullet.pos, player.pos) < PLAYER_RADIUS) {
          setPlayer(p => ({ ...p, health: p.health - 15 }));
          return { ...bullet, alive: false };
        }
      }
      
      return bullet;
    }));

    // Check win/lose conditions
    const aliveEnemies = enemies.filter(e => e.alive && e.health > 0);
    const playerDead = player.health <= 0;
    
    if (playerDead) {
      setGameState('lose');
      return;
    }
    
    if (challenge === 0 && aliveEnemies.length === 0) {
      setGameState('win');
      return;
    }
    
    if (challenge === 1 && timer >= 60) {
      setGameState('win');
      return;
    }
    
    if (challenge === 2 && aliveEnemies.length === 0 && noReloadUsed.current) {
      setGameState('win');
      return;
    }
  }, [gameState, player, enemies, challenge, timer]);

  // Drawing function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw background
    ctx.fillStyle = '#1a1a1a';
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
    obstacles.forEach(obs => {
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
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
      ctx.fillStyle = '#ff0000';
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
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.pos.x - 20, player.pos.y - 35, 40 * healthPercent, 5);
    
    // UI
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Health: ${Math.max(0, player.health)}`, 10, 30);
    ctx.fillText(`Ammo: ${player.ammo}/${MAX_AMMO}`, 10, 55);
    ctx.fillText(`Score: ${score}`, 10, 80);
    
    if (challenge === 1) {
      ctx.fillText(`Time: ${60 - timer}s`, 10, 105);
    }
    
    if (reloadMsg) {
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('RELOADING...', GAME_WIDTH / 2, GAME_HEIGHT / 2);
    }
    
    if (message) {
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(message, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30);
    }
  }, [player, bullets, enemies, obstacles, score, timer, reloadMsg, message, challenge]);

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
        <div style={{ color: '#fff', fontSize: 16 }}>A realistic 2D top-down shooting game. Move, aim, shoot, and complete challenges in an urban environment!</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 font-inter p-4">
      <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">Urban Shooter</h1>
      <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-gray-700 flex flex-col items-center p-2 md:p-4 lg:p-6" style={{ width: GAME_WIDTH, aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}` }}>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="bg-gray-900 rounded-lg border-2 border-gray-300"
        ></canvas>
        
        {/* Start Screen */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-white text-5xl font-extrabold mb-6 animate-pulse">Urban Shooter</h2>
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
        <p className="text-lg">Instructions:</p>
        <p className="text-md">Move: <span className="text-yellow-300">WASD</span> or <span className="text-yellow-300">Arrow Keys</span></p>
        <p className="text-md">Aim: <span className="text-yellow-300">Mouse</span> &nbsp; Shoot: <span className="text-yellow-300">Left Click / Space</span></p>
        <p className="text-md">Reload: <span className="text-yellow-300">R</span></p>
        <p className="text-md">Complete the challenge to win!</p>
      </div>
    </div>
  );
};

export default Shooter; 