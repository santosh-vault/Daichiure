import React, { useRef, useEffect, useState } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
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

export const FreeFireGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const healthRef = useRef<HTMLSpanElement>(null);
  const ammoRef = useRef<HTMLSpanElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const reloadRef = useRef<HTMLDivElement>(null);

  // Game state refs
  const player = useRef({
    x: CANVAS_WIDTH / 2 - PLAYER_W / 2,
    y: GROUND - PLAYER_H,
    w: PLAYER_W,
    h: PLAYER_H,
    speed: 5,
    color: PLAYER_COLOR,
    jumping: false,
    velocityY: 0,
    health: 100,
    ammo: MAX_AMMO,
    score: 0,
    reloading: false,
    angle: 0, // aiming angle
    muzzleFlash: 0, // frames left for muzzle flash
  });
  const bullets = useRef<any[]>([]);
  const enemies = useRef<any[]>([]);
  const ammos = useRef<any[]>([]);
  const keys = useRef<{ [key: string]: boolean }>({});
  const mouse = useRef<{ x: number; y: number }>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
  const animationRef = useRef<number>();
  const gameOver = useRef(false);
  const reloadTimeout = useRef<NodeJS.Timeout | null>(null);

  // UI update
  const updateUI = () => {
    if (healthRef.current) healthRef.current.textContent = String(player.current.health);
    if (ammoRef.current) ammoRef.current.textContent = String(player.current.ammo);
    if (scoreRef.current) scoreRef.current.textContent = String(player.current.score);
    if (reloadRef.current) reloadRef.current.style.display = player.current.reloading ? 'block' : 'none';
  };

  // Drawing functions
  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    // Body
    ctx.save();
    ctx.shadowColor = '#0f0';
    ctx.shadowBlur = 10;
    ctx.fillStyle = player.current.color;
    ctx.fillRect(player.current.x, player.current.y, player.current.w, player.current.h);
    ctx.restore();
    // Head
    ctx.save();
    ctx.beginPath();
    ctx.arc(player.current.x + player.current.w / 2, player.current.y + 15, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.current.x + player.current.w / 2, player.current.y + 15, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.restore();
    // Gun (rotates to aim)
    ctx.save();
    ctx.translate(player.current.x + player.current.w / 2, player.current.y + 30);
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
  };

  const drawEnemies = (ctx: CanvasRenderingContext2D) => {
    enemies.current.forEach(e => {
      ctx.save();
      ctx.shadowColor = '#f00';
      ctx.shadowBlur = 10;
      ctx.fillStyle = ENEMY_COLOR;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.beginPath();
      ctx.arc(e.x - 7, e.y - 5, 3, 0, Math.PI * 2);
      ctx.arc(e.x + 7, e.y - 5, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.restore();
    });
  };

  const drawBullets = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.shadowColor = '#ff0';
    ctx.shadowBlur = 8;
    ctx.fillStyle = BULLET_COLOR;
    bullets.current.forEach(b => {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
      ctx.fillRect(0, -2, 16, 4);
      ctx.restore();
    });
    ctx.restore();
  };

  const drawAmmos = (ctx: CanvasRenderingContext2D) => {
    ammos.current.forEach(a => {
      ctx.save();
      ctx.shadowColor = '#00f';
      ctx.shadowBlur = 10;
      ctx.fillStyle = AMMO_COLOR;
      ctx.fillRect(a.x, a.y, a.w, a.h);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('AMMO', a.x + 2, a.y + 14);
      ctx.restore();
    });
  };

  // Game logic
  const shoot = () => {
    if (player.current.ammo > 0 && !player.current.reloading) {
      const angle = player.current.angle;
      bullets.current.push({
        x: player.current.x + player.current.w / 2 + Math.cos(angle) * 32,
        y: player.current.y + 30 + Math.sin(angle) * 32,
        angle,
        speed: 12,
        vx: Math.cos(angle) * 12,
        vy: Math.sin(angle) * 12,
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
    // Randomly pick a side (0: left, 1: right, 2: top, 3: bottom)
    const side = Math.floor(Math.random() * 4);
    let x, y;
    const r = 24 + Math.random() * 8;
    if (side === 0) { // left
      x = -r;
      y = Math.random() * (CANVAS_HEIGHT - 100) + 50;
    } else if (side === 1) { // right
      x = CANVAS_WIDTH + r;
      y = Math.random() * (CANVAS_HEIGHT - 100) + 50;
    } else if (side === 2) { // top
      x = Math.random() * (CANVAS_WIDTH - 100) + 50;
      y = -r;
    } else { // bottom
      x = Math.random() * (CANVAS_WIDTH - 100) + 50;
      y = CANVAS_HEIGHT + r;
    }
    enemies.current.push({ x, y, r, speed: 1.5 + Math.random() * 1.5 });
  };

  const spawnAmmo = () => {
    const w = 40, h = 20;
    const x = Math.random() * (CANVAS_WIDTH - w - 40) + 20;
    const y = Math.random() * (CANVAS_HEIGHT - h - 80) + 40;
    ammos.current.push({ x, y, w, h });
  };

  const update = () => {
    // Player movement
    if (keys.current['ArrowRight'] || keys.current['KeyD']) player.current.x += player.current.speed;
    if (keys.current['ArrowLeft'] || keys.current['KeyA']) player.current.x -= player.current.speed;
    if (keys.current['ArrowUp'] || keys.current['KeyW']) {
      if (!player.current.jumping && player.current.y >= GROUND - player.current.h) {
        player.current.jumping = true;
        player.current.velocityY = -11;
      }
    }
    if (keys.current['ArrowDown'] || keys.current['KeyS']) player.current.y += player.current.speed;
    // Clamp player
    player.current.x = Math.max(0, Math.min(CANVAS_WIDTH - player.current.w, player.current.x));
    player.current.y = Math.max(0, Math.min(GROUND - player.current.h, player.current.y));

    // Jumping
    if (player.current.jumping) {
      player.current.velocityY += GRAVITY;
      player.current.y += player.current.velocityY;
      if (player.current.y >= GROUND - player.current.h) {
        player.current.y = GROUND - player.current.h;
        player.current.jumping = false;
        player.current.velocityY = 0;
      }
    }

    // Aim angle
    const px = player.current.x + player.current.w / 2;
    const py = player.current.y + 30;
    player.current.angle = Math.atan2(mouse.current.y - py, mouse.current.x - px);

    // Bullets
    bullets.current.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
    });
    bullets.current = bullets.current.filter(b => b.x > -20 && b.x < CANVAS_WIDTH + 20 && b.y > -20 && b.y < CANVAS_HEIGHT + 20);

    // Enemies move toward player
    enemies.current.forEach(e => {
      const dx = (player.current.x + player.current.w / 2) - e.x;
      const dy = (player.current.y + 30) - e.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1) {
        e.x += (dx / dist) * e.speed;
        e.y += (dy / dist) * e.speed;
      }
    });

    // Ammo pickups
    // (no movement)

    // Collision detection: bullets hit enemies
    bullets.current.forEach((b, bi) => {
      enemies.current.forEach((e, ei) => {
        const dx = b.x - e.x;
        const dy = b.y - e.y;
        if (Math.hypot(dx, dy) < e.r + 6) {
          bullets.current.splice(bi, 1);
          enemies.current.splice(ei, 1);
          player.current.score += 10;
          updateUI();
        }
      });
    });

    // Enemy hits player
    enemies.current.forEach((e, ei) => {
      const px = player.current.x + player.current.w / 2;
      const py = player.current.y + 30;
      if (Math.hypot(e.x - px, e.y - py) < e.r + 18) {
        enemies.current.splice(ei, 1);
        player.current.health -= 20;
        updateUI();
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

    // Muzzle flash timer
    if (player.current.muzzleFlash > 0) player.current.muzzleFlash--;

    // Game over
    if (player.current.health <= 0 && !gameOver.current) {
      gameOver.current = true;
      setTimeout(() => {
        alert('Game Over! Score: ' + player.current.score);
        window.location.reload();
      }, 100);
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, '#222');
    grad.addColorStop(1, '#444');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Ground
    ctx.fillStyle = '#222';
    ctx.fillRect(0, GROUND, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND);
    // Decorative
    for (let i = 0; i < 10; i++) {
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.beginPath();
      ctx.arc(80 * i + 40, GROUND + 20, 30, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.restore();
    }
    drawAmmos(ctx);
    drawPlayer(ctx);
    drawBullets(ctx);
    drawEnemies(ctx);
  };

  // Main game loop
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    let running = true;
    function loop() {
      if (!running) return;
      update();
      if (ctx) draw(ctx);
      animationRef.current = requestAnimationFrame(loop);
    }
    loop();
    return () => {
      running = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (reloadTimeout.current) clearTimeout(reloadTimeout.current);
    };
    // eslint-disable-next-line
  }, []);

  // Controls
  useEffect(() => {
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
    // eslint-disable-next-line
  }, []);

  // Mouse aiming and shooting
  useEffect(() => {
    const move = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    };
    const click = (e: MouseEvent) => {
      e.preventDefault();
      shoot();
    };
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', move);
      canvas.addEventListener('mousedown', click);
      return () => {
        canvas.removeEventListener('mousemove', move);
        canvas.removeEventListener('mousedown', click);
      };
    }
    // eslint-disable-next-line
  }, []);

  // Enemy spawn interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver.current) spawnEnemy();
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Ammo spawn interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver.current && ammos.current.length < 2) spawnAmmo();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // UI update on mount
  useEffect(() => {
    updateUI();
  }, []);

  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 600 }}>
        <button
          onClick={() => setStarted(true)}
          style={{ padding: '16px 40px', fontSize: 24, borderRadius: 8, background: '#00ff00', color: '#222', border: 'none', cursor: 'pointer', marginBottom: 24 }}
        >
          Click to Start
        </button>
        <div style={{ color: '#fff', fontSize: 16 }}>A beautiful 2D action shooter. Move, jump, and shoot enemies. Survive as long as you can!</div>
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
        <div ref={reloadRef} style={{ color: '#0ff', fontWeight: 'bold', display: 'none', marginTop: 4 }}>Reloading...</div>
        <div style={{ marginTop: 8, fontSize: 13, color: '#aaa' }}>
          Controls: Move (←/→/A/D/W/S), Shoot (Z/Left Click), Reload (R)
        </div>
      </div>
    </div>
  );
};

export default FreeFireGame;