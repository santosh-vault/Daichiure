import React, { useRef, useEffect, useState } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const MOB_SIZE = 20;
const SPEED = 2;
const MAX_TEAM = 50;
const MOB_COUNT = 100;

interface Mob {
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  isAlly: boolean;
}

export const RecruitRushGame: React.FC = () => {
  const [started, setStarted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!started) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let mobs: Mob[] = [];

    // Create initial player mob
    mobs.push({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      size: MOB_SIZE,
      color: '#00ff00',
      vx: 0,
      vy: 0,
      isAlly: true,
    });

    // Create random mobs
    for (let i = 0; i < MOB_COUNT; i++) {
      mobs.push({
        x: Math.random() * (CANVAS_WIDTH - 100) + 50,
        y: Math.random() * (CANVAS_HEIGHT - 100) + 50,
        size: MOB_SIZE,
        color: '#888888',
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        isAlly: false,
      });
    }

    const keys: Record<string, boolean> = {};
    window.addEventListener('keydown', (e) => (keys[e.key] = true));
    window.addEventListener('keyup', (e) => (keys[e.key] = false));

    let gameOver = false;

    function gameLoop() {
      if (!ctx) return;
      if (gameOver) return;

      // Movement input
      const player = mobs.find((m) => m.isAlly);
      if (player) {
        if (keys['ArrowLeft'] || keys['a']) player.x -= SPEED;
        if (keys['ArrowRight'] || keys['d']) player.x += SPEED;
        if (keys['ArrowUp'] || keys['w']) player.y -= SPEED;
        if (keys['ArrowDown'] || keys['s']) player.y += SPEED;

        // Keep in bounds
        player.x = Math.max(MOB_SIZE, Math.min(CANVAS_WIDTH - MOB_SIZE, player.x));
        player.y = Math.max(MOB_SIZE, Math.min(CANVAS_HEIGHT - MOB_SIZE, player.y));
      }

      // Clear screen
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Update mobs
      const allies = mobs.filter((m) => m.isAlly);
      const neutrals = mobs.filter((m) => !m.isAlly);

      neutrals.forEach((mob) => {
        mob.x += mob.vx;
        mob.y += mob.vy;

        // Bounce off walls
        if (mob.x <= MOB_SIZE || mob.x >= CANVAS_WIDTH - MOB_SIZE) mob.vx *= -1;
        if (mob.y <= MOB_SIZE || mob.y >= CANVAS_HEIGHT - MOB_SIZE) mob.vy *= -1;
      });

      // Collision detection
      for (const ally of allies) {
        for (const mob of neutrals) {
          const dist = Math.hypot(ally.x - mob.x, ally.y - mob.y);
          if (dist < MOB_SIZE * 1.5) {
            // Collision: decide if we convert or lose
            if (allies.length > 1) {
              mob.isAlly = true;
              mob.color = '#00ff00';
            } else {
              mobs = mobs.filter((m) => m !== ally); // lose the only ally
              break;
            }
          }
        }
      }

      // Redraw all mobs
      for (const mob of mobs) {
        ctx.fillStyle = mob.color;
        ctx.beginPath();
        ctx.arc(mob.x, mob.y, mob.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Update status
      if (infoRef.current) {
        infoRef.current.innerHTML = `
          <div style="color: white; font-size: 18px;">Team Size: ${allies.length}</div>
        `;
      }

      if (allies.length >= MAX_TEAM) {
        gameOver = true;
        if (infoRef.current) {
          infoRef.current.innerHTML = `
            <div style="color: #00ff00; font-size: 24px; margin-top: 10px;">Victory! You reached max team size!</div>
          `;
        }
      }

      if (allies.length === 0) {
        gameOver = true;
        if (infoRef.current) {
          infoRef.current.innerHTML = `
            <div style="color: red; font-size: 24px; margin-top: 10px;">Defeat! You lost all your allies!</div>
          `;
        }
      }

      requestAnimationFrame(gameLoop);
    }

    gameLoop();

    return () => {
      window.removeEventListener('keydown', (e) => (keys[e.key] = false));
      window.removeEventListener('keyup', (e) => (keys[e.key] = false));
    };
  }, [started]);

  if (!started) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 600 }}>
        <button
          onClick={() => setStarted(true)}
          style={{ padding: '16px 40px', fontSize: 24, borderRadius: 8, background: '#00ff00', color: '#222', border: 'none', cursor: 'pointer', marginBottom: 24 }}
        >
          Click to Start
        </button>
        <div style={{ color: '#fff', fontSize: 16 }}>Recruit allies and survive! Move with arrow keys or WASD. Convert neutrals to allies and reach the max team size to win.</div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          border: '2px solid #ffffff',
          backgroundColor: '#1a1a2e',
          display: 'block',
          margin: '0 auto',
        }}
      />
      <div ref={infoRef} style={{ marginTop: 10 }}></div>
      <div style={{ color: '#ffffff', marginTop: 10, fontSize: 14 }}>
        <p>Controls: Arrow Keys or WASD to move</p>
        <p>Touch neutral mobs (gray) to convert them into allies (green)</p>
        <p>Lose if you are outnumbered. Win if you reach {MAX_TEAM} allies!</p>
      </div>
    </div>
  );
};

const AllOfUsAreDead: React.FC = RecruitRushGame;
export default AllOfUsAreDead;
