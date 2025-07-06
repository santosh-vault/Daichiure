import React, { useRef, useEffect, useState } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const MAP_WIDTH = 3000; // Much larger map
const MAP_HEIGHT = 2000; // Much larger map
const PLAYER_W = 40;
const PLAYER_H = 60;
const PLAYER_COLOR = '#0f0';
const ENEMY_COLOR = '#f00';
const BULLET_COLOR = '#ff0';
const AMMO_COLOR = '#00f';
const GROUND = CANVAS_HEIGHT - 60;
const GRAVITY = 0.5;
const MAX_AMMO = 8;
const RELOAD_TIME = 1200; // ms
const AMMO_PICKUP_AMOUNT = 8;

// Enhanced game constants
const DIFFICULTY_INCREASE_INTERVAL = 30000; // 30 seconds
const BOSS_SPAWN_SCORE = 100; // Every 100 points spawn a boss

export const FreeFireGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const healthRef = useRef<HTMLSpanElement>(null);
  const ammoRef = useRef<HTMLSpanElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const reloadRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef<HTMLSpanElement>(null);
  const bossHealthRef = useRef<HTMLDivElement>(null);

  // Enhanced game state
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [bossActive, setBossActive] = useState(false);
  const [gameTime, setGameTime] = useState(0);

  // Game state refs
  const player = useRef({
    x: MAP_WIDTH / 2 - PLAYER_W / 2, // Start in center of large map
    y: MAP_HEIGHT / 2 - PLAYER_H / 2,
    w: PLAYER_W,
    h: PLAYER_H,
    speed: 5,
    color: PLAYER_COLOR,
    jumping: false,
    velocityY: 0,
    health: 100,
    maxHealth: 100,
    ammo: MAX_AMMO,
    score: 0,
    reloading: false,
    angle: 0, // aiming angle
    muzzleFlash: 0, // frames left for muzzle flash
    invulnerable: 0, // frames of invulnerability after taking damage
    powerUpActive: 0, // frames left for power-up
    powerUpType: '', // type of active power-up
  });
  
  // Camera position
  const camera = useRef({
    x: 0,
    y: 0
  });
  
  const bullets = useRef<any[]>([]);
  const enemyBullets = useRef<any[]>([]);
  const enemies = useRef<any[]>([]);
  const bosses = useRef<any[]>([]);
  const ammos = useRef<any[]>([]);
  const powerUps = useRef<any[]>([]);
  const keys = useRef<{ [key: string]: boolean }>({});
  const mouse = useRef<{ x: number; y: number }>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
  const animationRef = useRef<number>();
  const gameOver = useRef(false);
  const reloadTimeout = useRef<NodeJS.Timeout | null>(null);
  const gameLoopRunning = useRef(false);
  const lastDifficultyIncrease = useRef<number>(0);
  const lastBossSpawn = useRef<number>(0);

  const [started, setStarted] = useState(false);

  // Get difficulty settings
  const getDifficultySettings = () => {
    return {
      enemySpeed: 1.5 + (difficultyLevel * 0.3),
      enemySpawnRate: Math.max(1500 - (difficultyLevel * 100), 500), // Faster spawning
      enemyHealth: 1 + Math.floor(difficultyLevel / 3), // Enemies get more health
      bossHealth: 50 + (difficultyLevel * 20),
      bossSpeed: 2 + (difficultyLevel * 0.5),
      bossShootRate: Math.max(2000 - (difficultyLevel * 150), 800),
    };
  };

  // Update camera to follow player
  const updateCamera = () => {
    camera.current.x = player.current.x - CANVAS_WIDTH / 2;
    camera.current.y = player.current.y - CANVAS_HEIGHT / 2;
    
    // Clamp camera to map boundaries
    camera.current.x = Math.max(0, Math.min(MAP_WIDTH - CANVAS_WIDTH, camera.current.x));
    camera.current.y = Math.max(0, Math.min(MAP_HEIGHT - CANVAS_HEIGHT, camera.current.y));
  };

  // Convert world coordinates to screen coordinates
  const worldToScreen = (worldX: number, worldY: number) => {
    return {
      x: worldX - camera.current.x,
      y: worldY - camera.current.y
    };
  };

  // Convert screen coordinates to world coordinates
  const screenToWorld = (screenX: number, screenY: number) => {
    return {
      x: screenX + camera.current.x,
      y: screenY + camera.current.y
    };
  };

  // UI update
  const updateUI = () => {
    if (healthRef.current) healthRef.current.textContent = String(player.current.health);
    if (ammoRef.current) ammoRef.current.textContent = String(player.current.ammo);
    if (scoreRef.current) scoreRef.current.textContent = String(player.current.score);
    if (levelRef.current) levelRef.current.textContent = String(difficultyLevel);
    if (reloadRef.current) reloadRef.current.style.display = player.current.reloading ? 'block' : 'none';
    
    // Boss health display
    if (bossHealthRef.current && bosses.current.length > 0) {
      const boss = bosses.current[0];
      bossHealthRef.current.textContent = `${boss.health}/${boss.maxHealth}`;
      bossHealthRef.current.style.display = 'block';
    } else if (bossHealthRef.current) {
      bossHealthRef.current.style.display = 'none';
    }
  };

  // Drawing functions
  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    // Invulnerability flash
    if (player.current.invulnerable > 0 && Math.floor(player.current.invulnerable / 3) % 2 === 0) {
      return; // Skip drawing to create flash effect
    }

    const screenPos = worldToScreen(player.current.x, player.current.y);

    // Power-up glow
    if (player.current.powerUpActive > 0) {
      ctx.save();
      ctx.shadowColor = player.current.powerUpType === 'rapid' ? '#ff0' : '#0ff';
      ctx.shadowBlur = 20;
    }

    // Body
    ctx.save();
    ctx.shadowColor = '#0f0';
    ctx.shadowBlur = 10;
    ctx.fillStyle = player.current.color;
    ctx.fillRect(screenPos.x, screenPos.y, player.current.w, player.current.h);
    ctx.restore();
    
    // Head
    ctx.save();
    ctx.beginPath();
    ctx.arc(screenPos.x + player.current.w / 2, screenPos.y + 15, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(screenPos.x + player.current.w / 2, screenPos.y + 15, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.restore();
    
    // Gun (rotates to aim)
    ctx.save();
    ctx.translate(screenPos.x + player.current.w / 2, screenPos.y + 30);
    ctx.rotate(player.current.angle);
    ctx.fillStyle = '#444';
    ctx.fillRect(0, -4, 32, 8);
    
    // Muzzle flash
    if (player.current.muzzleFlash > 0) {
      ctx.save();
      ctx.fillStyle = '#ff0';
      ctx.shadowColor = '#ff0';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(36, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    if (player.current.powerUpActive > 0) {
      ctx.restore();
    }
  };

  const drawEnemies = (ctx: CanvasRenderingContext2D) => {
    enemies.current.forEach(e => {
      const screenPos = worldToScreen(e.x, e.y);
      
      ctx.save();
      ctx.shadowColor = '#f00';
      ctx.shadowBlur = 10;
      ctx.fillStyle = ENEMY_COLOR;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, e.r, 0, Math.PI * 2);
      ctx.fill();
      
      // Health bar for enemies with multiple health
      if (e.maxHealth > 1) {
        const barWidth = e.r * 2;
        const barHeight = 4;
        const healthPercent = e.health / e.maxHealth;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(screenPos.x - barWidth/2, screenPos.y - e.r - 10, barWidth, barHeight);
        ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
        ctx.fillRect(screenPos.x - barWidth/2, screenPos.y - e.r - 10, barWidth * healthPercent, barHeight);
      }
      
      // Eyes
      ctx.beginPath();
      ctx.arc(screenPos.x - 7, screenPos.y - 5, 3, 0, Math.PI * 2);
      ctx.arc(screenPos.x + 7, screenPos.y - 5, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.restore();
    });
  };

  const drawBosses = (ctx: CanvasRenderingContext2D) => {
    bosses.current.forEach(boss => {
      const screenPos = worldToScreen(boss.x, boss.y);
      
      ctx.save();
      ctx.shadowColor = '#f00';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#800';
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, boss.r, 0, Math.PI * 2);
      ctx.fill();
      
      // Boss health bar
      const barWidth = boss.r * 2;
      const barHeight = 8;
      const healthPercent = boss.health / boss.maxHealth;
      
      ctx.fillStyle = '#333';
      ctx.fillRect(screenPos.x - barWidth/2, screenPos.y - boss.r - 15, barWidth, barHeight);
      ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
      ctx.fillRect(screenPos.x - barWidth/2, screenPos.y - boss.r - 15, barWidth * healthPercent, barHeight);
      
      // Boss details
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('BOSS', screenPos.x, screenPos.y + 5);
      
      ctx.restore();
    });
  };

  const drawBullets = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.shadowColor = '#ff0';
    ctx.shadowBlur = 8;
    ctx.fillStyle = BULLET_COLOR;
    bullets.current.forEach(b => {
      const screenPos = worldToScreen(b.x, b.y);
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.rotate(b.angle);
      ctx.fillRect(0, -2, 16, 4);
      ctx.restore();
    });
    ctx.restore();
  };

  const drawEnemyBullets = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.shadowColor = '#f00';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#f00';
    enemyBullets.current.forEach(b => {
      const screenPos = worldToScreen(b.x, b.y);
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.rotate(b.angle);
      ctx.fillRect(0, -3, 12, 6);
      ctx.restore();
    });
    ctx.restore();
  };

  const drawAmmos = (ctx: CanvasRenderingContext2D) => {
    ammos.current.forEach(a => {
      const screenPos = worldToScreen(a.x, a.y);
      ctx.save();
      ctx.shadowColor = '#00f';
      ctx.shadowBlur = 10;
      ctx.fillStyle = AMMO_COLOR;
      ctx.fillRect(screenPos.x, screenPos.y, a.w, a.h);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('AMMO', screenPos.x + 2, screenPos.y + 14);
      ctx.restore();
    });
  };

  const drawPowerUps = (ctx: CanvasRenderingContext2D) => {
    powerUps.current.forEach(p => {
      const screenPos = worldToScreen(p.x, p.y);
      ctx.save();
      ctx.shadowColor = p.type === 'rapid' ? '#ff0' : '#0ff';
      ctx.shadowBlur = 15;
      ctx.fillStyle = p.type === 'rapid' ? '#ff0' : '#0ff';
      ctx.fillRect(screenPos.x, screenPos.y, p.w, p.h);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(p.type === 'rapid' ? 'RAPID' : 'HEAL', screenPos.x + 2, screenPos.y + 12);
      ctx.restore();
    });
  };

  // Draw map background with grid and landmarks
  const drawMap = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(1, '#16213e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Grid pattern
    ctx.save();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    
    const gridSize = 100;
    const startX = Math.floor(camera.current.x / gridSize) * gridSize;
    const startY = Math.floor(camera.current.y / gridSize) * gridSize;
    
    for (let x = startX; x < startX + CANVAS_WIDTH + gridSize; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x - camera.current.x, 0);
      ctx.lineTo(x - camera.current.x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    
    for (let y = startY; y < startY + CANVAS_HEIGHT + gridSize; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y - camera.current.y);
      ctx.lineTo(CANVAS_WIDTH, y - camera.current.y);
      ctx.stroke();
    }
    ctx.restore();
    
    // Draw some decorative elements (buildings, trees, etc.)
    drawMapDecorations(ctx);
  };

  const drawMapDecorations = (ctx: CanvasRenderingContext2D) => {
    // Draw buildings and structures
    const buildings = [
      { x: 200, y: 200, w: 80, h: 120 },
      { x: 800, y: 300, w: 100, h: 150 },
      { x: 1500, y: 400, w: 120, h: 180 },
      { x: 2200, y: 250, w: 90, h: 140 },
      { x: 400, y: 800, w: 110, h: 160 },
      { x: 1200, y: 900, w: 95, h: 130 },
      { x: 1800, y: 700, w: 85, h: 110 },
      { x: 2600, y: 600, w: 105, h: 170 }
    ];
    
    buildings.forEach(building => {
      const screenPos = worldToScreen(building.x, building.y);
      
      // Only draw if on screen
      if (screenPos.x + building.w > 0 && screenPos.x < CANVAS_WIDTH && 
          screenPos.y + building.h > 0 && screenPos.y < CANVAS_HEIGHT) {
        
        ctx.save();
        ctx.fillStyle = '#444';
        ctx.fillRect(screenPos.x, screenPos.y, building.w, building.h);
        
        // Windows
        ctx.fillStyle = '#666';
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 4; j++) {
            ctx.fillRect(screenPos.x + 10 + i * 20, screenPos.y + 20 + j * 25, 15, 20);
          }
        }
        ctx.restore();
      }
    });
    
    // Draw trees
    const trees = [
      { x: 100, y: 100 }, { x: 300, y: 150 }, { x: 500, y: 200 },
      { x: 700, y: 100 }, { x: 900, y: 250 }, { x: 1100, y: 180 },
      { x: 1300, y: 300 }, { x: 1700, y: 200 }, { x: 1900, y: 350 },
      { x: 2100, y: 150 }, { x: 2300, y: 280 }, { x: 2500, y: 200 },
      { x: 100, y: 600 }, { x: 300, y: 700 }, { x: 500, y: 650 },
      { x: 700, y: 800 }, { x: 900, y: 750 }, { x: 1100, y: 900 },
      { x: 1300, y: 800 }, { x: 1700, y: 900 }, { x: 1900, y: 750 },
      { x: 2100, y: 850 }, { x: 2300, y: 700 }, { x: 2500, y: 800 }
    ];
    
    trees.forEach(tree => {
      const screenPos = worldToScreen(tree.x, tree.y);
      
      if (screenPos.x > -50 && screenPos.x < CANVAS_WIDTH + 50 && 
          screenPos.y > -50 && screenPos.y < CANVAS_HEIGHT + 50) {
        
        ctx.save();
        // Tree trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(screenPos.x - 5, screenPos.y, 10, 30);
        
        // Tree leaves
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y - 10, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  };

  // Game logic
  const shoot = () => {
    if (player.current.ammo > 0 && !player.current.reloading) {
      const angle = player.current.angle;
      const bulletSpeed = player.current.powerUpType === 'rapid' ? 15 : 12;
      
      bullets.current.push({
        x: player.current.x + player.current.w / 2 + Math.cos(angle) * 32,
        y: player.current.y + 30 + Math.sin(angle) * 32,
        angle,
        speed: bulletSpeed,
        vx: Math.cos(angle) * bulletSpeed,
        vy: Math.sin(angle) * bulletSpeed,
        damage: player.current.powerUpType === 'rapid' ? 2 : 1,
      });
      
      player.current.ammo--;
      player.current.muzzleFlash = 3;
      updateUI();
    }
  };

  const reload = () => {
    if (player.current.reloading || player.current.ammo === MAX_AMMO) return;
    player.current.reloading = true;
    updateUI();
    reloadTimeout.current = setTimeout(() => {
      player.current.ammo = MAX_AMMO;
      player.current.reloading = false;
      updateUI();
    }, RELOAD_TIME);
  };

  const spawnEnemy = () => {
    const settings = getDifficultySettings();
    const side = Math.floor(Math.random() * 4);
    let x, y;
    const r = 24 + Math.random() * 8;
    
    if (side === 0) { // left
      x = -r;
      y = Math.random() * MAP_HEIGHT;
    } else if (side === 1) { // right
      x = MAP_WIDTH + r;
      y = Math.random() * MAP_HEIGHT;
    } else if (side === 2) { // top
      x = Math.random() * MAP_WIDTH;
      y = -r;
    } else { // bottom
      x = Math.random() * MAP_WIDTH;
      y = MAP_HEIGHT + r;
    }
    
    enemies.current.push({ 
      x, y, r, 
      speed: settings.enemySpeed + Math.random() * 0.5,
      health: settings.enemyHealth,
      maxHealth: settings.enemyHealth,
      lastShot: 0,
      canShoot: Math.random() < 0.3 // 30% chance enemy can shoot
    });
  };

  const spawnBoss = () => {
    const settings = getDifficultySettings();
    const side = Math.floor(Math.random() * 4);
    let x, y;
    const r = 40;
    
    if (side === 0) { // left
      x = -r;
      y = MAP_HEIGHT / 2;
    } else if (side === 1) { // right
      x = MAP_WIDTH + r;
      y = MAP_HEIGHT / 2;
    } else if (side === 2) { // top
      x = MAP_WIDTH / 2;
      y = -r;
    } else { // bottom
      x = MAP_WIDTH / 2;
      y = MAP_HEIGHT + r;
    }
    
    bosses.current.push({
      x, y, r,
      speed: settings.bossSpeed,
      health: settings.bossHealth,
      maxHealth: settings.bossHealth,
      lastShot: 0,
      shootRate: settings.bossShootRate,
      phase: 0, // Boss attack phases
      phaseTimer: 0
    });
    
    setBossActive(true);
  };

  const spawnAmmo = () => {
    const w = 40, h = 20;
    const x = Math.random() * (MAP_WIDTH - w - 40) + 20;
    const y = Math.random() * (MAP_HEIGHT - h - 80) + 40;
    ammos.current.push({ x, y, w, h });
  };

  const spawnPowerUp = () => {
    const w = 40, h = 20;
    const x = Math.random() * (MAP_WIDTH - w - 40) + 20;
    const y = Math.random() * (MAP_HEIGHT - h - 80) + 40;
    const type = Math.random() < 0.5 ? 'rapid' : 'heal';
    powerUps.current.push({ x, y, w, h, type });
  };

  const takeDamage = (damage: number) => {
    if (player.current.invulnerable > 0) return;
    
    player.current.health = Math.max(0, player.current.health - damage);
    player.current.invulnerable = 60; // 1 second of invulnerability
    updateUI();
    
    if (player.current.health <= 0 && !gameOver.current) {
      gameOver.current = true;
      setTimeout(() => {
        alert(`Game Over! Score: ${player.current.score} | Level: ${difficultyLevel}`);
        window.location.reload();
      }, 100);
    }
  };

  const update = () => {
    const now = Date.now();
    
    // Update game time and difficulty
    if (now - lastDifficultyIncrease.current > DIFFICULTY_INCREASE_INTERVAL) {
      setDifficultyLevel(prev => prev + 1);
      lastDifficultyIncrease.current = now;
    }
    setGameTime(Math.floor((now - lastDifficultyIncrease.current) / 1000));

    // Player movement
    if (keys.current['ArrowRight'] || keys.current['KeyD']) player.current.x += player.current.speed;
    if (keys.current['ArrowLeft'] || keys.current['KeyA']) player.current.x -= player.current.speed;
    if (keys.current['ArrowUp'] || keys.current['KeyW']) player.current.y -= player.current.speed;
    if (keys.current['ArrowDown'] || keys.current['KeyS']) player.current.y += player.current.speed;
    
    // Clamp player to map boundaries
    player.current.x = Math.max(0, Math.min(MAP_WIDTH - player.current.w, player.current.x));
    player.current.y = Math.max(0, Math.min(MAP_HEIGHT - player.current.h, player.current.y));

    // Update camera to follow player
    updateCamera();

    // Aim angle (convert mouse position to world coordinates)
    const worldMouse = screenToWorld(mouse.current.x, mouse.current.y);
    const px = player.current.x + player.current.w / 2;
    const py = player.current.y + 30;
    player.current.angle = Math.atan2(worldMouse.y - py, worldMouse.x - px);

    // Update timers
    if (player.current.invulnerable > 0) player.current.invulnerable--;
    if (player.current.powerUpActive > 0) {
      player.current.powerUpActive--;
      if (player.current.powerUpActive === 0) {
        player.current.powerUpType = '';
      }
    }

    // Bullets
    bullets.current.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
    });
    bullets.current = bullets.current.filter(b => b.x > -20 && b.x < MAP_WIDTH + 20 && b.y > -20 && b.y < MAP_HEIGHT + 20);

    // Enemy bullets
    enemyBullets.current.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
    });
    enemyBullets.current = enemyBullets.current.filter(b => b.x > -20 && b.x < MAP_WIDTH + 20 && b.y > -20 && b.y < MAP_HEIGHT + 20);

    // Enemies move toward player and shoot
    enemies.current.forEach(e => {
      const dx = (player.current.x + player.current.w / 2) - e.x;
      const dy = (player.current.y + 30) - e.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1) {
        e.x += (dx / dist) * e.speed;
        e.y += (dy / dist) * e.speed;
      }
      
      // Enemy shooting
      if (e.canShoot && now - e.lastShot > 3000) {
        const angle = Math.atan2(dy, dx);
        enemyBullets.current.push({
          x: e.x,
          y: e.y,
          angle,
          vx: Math.cos(angle) * 4,
          vy: Math.sin(angle) * 4,
        });
        e.lastShot = now;
      }
    });

    // Boss movement and attacks
    bosses.current.forEach(boss => {
      const dx = (player.current.x + player.current.w / 2) - boss.x;
      const dy = (player.current.y + 30) - boss.y;
      const dist = Math.hypot(dx, dy);
      
      // Boss movement pattern
      boss.phaseTimer++;
      if (boss.phaseTimer > 120) { // Change phase every 2 seconds
        boss.phase = (boss.phase + 1) % 3;
        boss.phaseTimer = 0;
      }
      
      if (boss.phase === 0) { // Chase player
        if (dist > 1) {
          boss.x += (dx / dist) * boss.speed;
          boss.y += (dy / dist) * boss.speed;
        }
      } else if (boss.phase === 1) { // Circle around player
        const angle = Math.atan2(dy, dx) + 0.02;
        boss.x = player.current.x + player.current.w / 2 + Math.cos(angle) * 150;
        boss.y = player.current.y + 30 + Math.sin(angle) * 150;
      } else { // Retreat
        if (dist < 200) {
          boss.x -= (dx / dist) * boss.speed;
          boss.y -= (dy / dist) * boss.speed;
        }
      }
      
      // Boss shooting
      if (now - boss.lastShot > boss.shootRate) {
        const angle = Math.atan2(dy, dx);
        for (let i = 0; i < 3; i++) { // Triple shot
          const spreadAngle = angle + (i - 1) * 0.3;
          enemyBullets.current.push({
            x: boss.x,
            y: boss.y,
            angle: spreadAngle,
            vx: Math.cos(spreadAngle) * 6,
            vy: Math.sin(spreadAngle) * 6,
          });
        }
        boss.lastShot = now;
      }
    });

    // Collision detection: bullets hit enemies
    bullets.current.forEach((b, bi) => {
      enemies.current.forEach((e, ei) => {
        const dx = b.x - e.x;
        const dy = b.y - e.y;
        if (Math.hypot(dx, dy) < e.r + 6) {
          bullets.current.splice(bi, 1);
          e.health -= b.damage;
          if (e.health <= 0) {
            enemies.current.splice(ei, 1);
            player.current.score += 10;
            
            // Chance to drop power-up
            if (Math.random() < 0.1) {
              spawnPowerUp();
            }
            updateUI();
          }
        }
      });
      
      // Bullets hit bosses
      bosses.current.forEach((boss, bi) => {
        const dx = b.x - boss.x;
        const dy = b.y - boss.y;
        if (Math.hypot(dx, dy) < boss.r + 6) {
          bullets.current.splice(bi, 1);
          boss.health -= b.damage;
          if (boss.health <= 0) {
            bosses.current.splice(bi, 1);
            player.current.score += 100;
            setBossActive(false);
            updateUI();
          }
        }
      });
    });

    // Enemy bullets hit player
    enemyBullets.current.forEach((b, bi) => {
      const px = player.current.x + player.current.w / 2;
      const py = player.current.y + 30;
      if (Math.hypot(b.x - px, b.y - py) < 20) {
        enemyBullets.current.splice(bi, 1);
        takeDamage(10);
      }
    });

    // Enemy hits player
    enemies.current.forEach((e, ei) => {
      const px = player.current.x + player.current.w / 2;
      const py = player.current.y + 30;
      if (Math.hypot(e.x - px, e.y - py) < e.r + 18) {
        enemies.current.splice(ei, 1);
        takeDamage(20);
      }
    });

    // Boss hits player
    bosses.current.forEach((boss, bi) => {
      const px = player.current.x + player.current.w / 2;
      const py = player.current.y + 30;
      if (Math.hypot(boss.x - px, boss.y - py) < boss.r + 18) {
        takeDamage(30);
      }
    });

    // Player collects ammo
    ammos.current.forEach((a, ai) => {
      if (
        player.current.x + player.current.w > a.x &&
        player.current.x < a.x + a.w &&
        player.current.y + player.current.h > a.y &&
        player.current.y < a.y + a.h
      ) {
        ammos.current.splice(ai, 1);
        player.current.ammo = Math.min(player.current.ammo + AMMO_PICKUP_AMOUNT, MAX_AMMO);
        updateUI();
      }
    });

    // Player collects power-ups
    powerUps.current.forEach((p, pi) => {
      if (
        player.current.x + player.current.w > p.x &&
        player.current.x < p.x + p.w &&
        player.current.y + player.current.h > p.y &&
        player.current.y < p.y + p.h
      ) {
        powerUps.current.splice(pi, 1);
        if (p.type === 'rapid') {
          player.current.powerUpActive = 300; // 5 seconds
          player.current.powerUpType = 'rapid';
        } else if (p.type === 'heal') {
          player.current.health = Math.min(player.current.maxHealth, player.current.health + 30);
        }
        updateUI();
      }
    });

    // Muzzle flash timer
    if (player.current.muzzleFlash > 0) player.current.muzzleFlash--;

    // Boss spawn check
    if (player.current.score >= lastBossSpawn.current + BOSS_SPAWN_SCORE && !bossActive) {
      spawnBoss();
      lastBossSpawn.current = player.current.score;
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    // Draw the map background
    drawMap(ctx);
    
    // Draw game objects
    drawAmmos(ctx);
    drawPowerUps(ctx);
    drawPlayer(ctx);
    drawBullets(ctx);
    drawEnemyBullets(ctx);
    drawEnemies(ctx);
    drawBosses(ctx);
  };

  // Main game loop
  useEffect(() => {
    if (!started || gameLoopRunning.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    gameLoopRunning.current = true;
    let running = true;

    function loop() {
      if (!running || gameOver.current || !ctx) return;
      update();
      draw(ctx);
      animationRef.current = requestAnimationFrame(loop);
    }
    
    // Start the game loop
    animationRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      gameLoopRunning.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (reloadTimeout.current) {
        clearTimeout(reloadTimeout.current);
      }
    };
  }, [started]);

  // Controls
  useEffect(() => {
    if (!started) return;

    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === 'KeyZ') {
        e.preventDefault();
        shoot();
      }
      if (e.code === 'KeyR') {
        e.preventDefault();
        reload();
      }
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [started]);

  // Mouse aiming and shooting
  useEffect(() => {
    if (!started) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const move = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    };
    const click = (e: MouseEvent) => {
      e.preventDefault();
      shoot();
    };
    
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mousedown', click);
    return () => {
      canvas.removeEventListener('mousemove', move);
      canvas.removeEventListener('mousedown', click);
    };
  }, [started]);

  // Enemy spawn interval (dynamic based on difficulty)
  useEffect(() => {
    if (!started) return;

    const interval = setInterval(() => {
      if (!gameOver.current) {
        const settings = getDifficultySettings();
        spawnEnemy();
      }
    }, getDifficultySettings().enemySpawnRate);
    
    return () => clearInterval(interval);
  }, [started, difficultyLevel]);

  // Ammo spawn interval
  useEffect(() => {
    if (!started) return;

    const interval = setInterval(() => {
      if (!gameOver.current && ammos.current.length < 2) spawnAmmo();
    }, 4000);
    return () => clearInterval(interval);
  }, [started]);

  // UI update on mount
  useEffect(() => {
    updateUI();
  }, []);

  if (!started) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 600 }}>
        <button
          onClick={() => setStarted(true)}
          style={{ padding: '16px 40px', fontSize: 24, borderRadius: 8, background: '#00ff00', color: '#222', border: 'none', cursor: 'pointer', marginBottom: 24 }}
        >
          Click to Start
        </button>
        <div style={{ color: '#fff', fontSize: 16, textAlign: 'center', maxWidth: 400 }}>
          <h3>Enhanced Free Fire - Open World Shooter</h3>
          <p>Explore a vast map and survive waves of enemies!</p>
          <p>• Large open world map (3000x2000)</p>
          <p>• Camera follows your character</p>
          <p>• Multiple enemy types with health bars</p>
          <p>• Boss battles every 100 points</p>
          <p>• Power-ups: Rapid Fire & Health</p>
          <p>• Increasing difficulty every 30 seconds</p>
          <p>• Enemy shooting mechanics</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: CANVAS_WIDTH, margin: '0 auto' }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ display: 'block', background: '#333', border: '2px solid #fff' }}
      />
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          color: '#fff',
          fontSize: 16,
          zIndex: 2,
          textShadow: '0 2px 8px #000',
        }}
      >
        <div>
          Health: <span ref={healthRef}>100</span>
        </div>
        <div>
          Ammo: <span ref={ammoRef}>{MAX_AMMO}</span>
        </div>
        <div>
          Score: <span ref={scoreRef}>0</span>
        </div>
        <div>
          Level: <span ref={levelRef}>1</span>
        </div>
        <div>
          Position: ({Math.floor(player.current.x)}, {Math.floor(player.current.y)})
        </div>
        <div ref={reloadRef} style={{ color: '#0ff', fontWeight: 'bold', display: 'none', marginTop: 4 }}>Reloading...</div>
        <div ref={bossHealthRef} style={{ color: '#f00', fontWeight: 'bold', display: 'none', marginTop: 4 }}>Boss: 0/0</div>
        <div style={{ marginTop: 8, fontSize: 13, color: '#aaa' }}>
          Controls: Move (←/→/A/D/W/S), Shoot (Z/Left Click), Reload (R)
        </div>
        {player.current.powerUpActive > 0 && (
          <div style={{ color: player.current.powerUpType === 'rapid' ? '#ff0' : '#0ff', fontWeight: 'bold', marginTop: 4 }}>
            {player.current.powerUpType === 'rapid' ? 'RAPID FIRE!' : 'HEALED!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default FreeFireGame;