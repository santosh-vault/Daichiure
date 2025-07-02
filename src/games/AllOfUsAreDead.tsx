import React, { useRef, useEffect, useState } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const MOB_SIZE = 20;
const SPEED = 2;
const NEUTRAL_SPEED = 0.5;
const MAX_TEAM = 50;
const GROUP_COUNT = 15;

interface Mob {
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  isAlly: boolean;
}

export const AllOfUsAreDead: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const [gameRunning, setGameRunning] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let mobs: Mob[] = [];
    let gameOver = false;

    const keys: Record<string, boolean> = {};

    const createNeutralGroups = () => {
      for (let i = 0; i < GROUP_COUNT; i++) {
        const groupSize = Math.floor(Math.random() * 5) + 1;
        const baseX = Math.random() * (CANVAS_WIDTH - 100) + 50;
        const baseY = Math.random() * (CANVAS_HEIGHT - 100) + 50;

        for (let j = 0; j < groupSize; j++) {
          mobs.push({
            x: baseX + Math.random() * 30 - 15,
            y: baseY + Math.random() * 30 - 15,
            size: MOB_SIZE,
            color: '#888888',
            vx: (Math.random() - 0.5) * NEUTRAL_SPEED,
            vy: (Math.random() - 0.5) * NEUTRAL_SPEED,
            isAlly: false,
          });
        }
      }
    };

    const startGame = () => {
      // Reset game
      mobs = [];
      gameOver = false;
      setGamePaused(false);

      // Add player
      mobs.push({
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        size: MOB_SIZE,
        color: '#00ff00',
        vx: 0,
        vy: 0,
        isAlly: true,
      });

      createNeutralGroups();
      setGameRunning(true);
      requestAnimationFrame(gameLoop);
    };

    window.addEventListener('keydown', (e) => (keys[e.key] = true));
    window.addEventListener('keyup', (e) => (keys[e.key] = false));

    const gameLoop = () => {
      if (!ctx || !gameRunning || gamePaused || gameOver) return;

      const player = mobs.find((m) => m.isAlly);
      const allies = mobs.filter((m) => m.isAlly);
      const neutrals = mobs.filter((m) => !m.isAlly);

      // Player movement
      if (player) {
        if (keys['ArrowLeft'] || keys['a']) player.x -= SPEED;
        if (keys['ArrowRight'] || keys['d']) player.x += SPEED;
        if (keys['ArrowUp'] || keys['w']) player.y -= SPEED;
        if (keys['ArrowDown'] || keys['s']) player.y += SPEED;

        player.x = Math.max(MOB_SIZE, Math.min(CANVAS_WIDTH - MOB_SIZE, player.x));
        player.y = Math.max(MOB_SIZE, Math.min(CANVAS_HEIGHT - MOB_SIZE, player.y));
      }

      // Clear canvas
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Update neutrals
      neutrals.forEach((mob) => {
        mob.x += mob.vx;
        mob.y += mob.vy;
        if (mob.x <= MOB_SIZE || mob.x >= CANVAS_WIDTH - MOB_SIZE) mob.vx *= -1;
        if (mob.y <= MOB_SIZE || mob.y >= CANVAS_HEIGHT - MOB_SIZE) mob.vy *= -1;
      });

      // Collision detection
      for (const ally of allies) {
        for (const mob of neutrals) {
          const dist = Math.hypot(ally.x - mob.x, ally.y - mob.y);
          if (dist < MOB_SIZE * 1.5) {
            if (allies.length >= neutrals.length) {
              mob.isAlly = true;
              mob.color = '#00ff00';
            } else {
              mobs = mobs.filter((m) => m !== ally);
              break;
            }
          }
        }
      }

      // Draw all mobs
      mobs.forEach((mob) => {
        ctx.fillStyle = mob.color;
        ctx.beginPath();
        ctx.arc(mob.x, mob.y, mob.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Info panel
      if (infoRef.current) {
        infoRef.current.innerHTML = `
          <div style="color: white; font-size: 18px;">Team Size: ${allies.length}</div>
        `;
      }

      if (allies.length >= MAX_TEAM) {
        gameOver = true;
        if (infoRef.current) {
          infoRef.current.innerHTML += `
            <div style="color: #00ff00; font-size: 24px;">You Win!</div>
          `;
        }
      }

      if (allies.length === 0) {
        gameOver = true;
        if (infoRef.current) {
          infoRef.current.innerHTML += `
            <div style="color: red; font-size: 24px;">You Lost!</div>
          `;
        }
      }

      requestAnimationFrame(gameLoop);
    };

    // Cleanup
    return () => {
      window.removeEventListener('keydown', (e) => (keys[e.key] = false));
      window.removeEventListener('keyup', (e) => (keys[e.key] = false));
    };
  }, [gameRunning, gamePaused]);

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
      <div style={{ marginTop: 10 }}>
        <button onClick={() => window.location.reload()}>Start New Game</button>
        <button onClick={() => setGamePaused(false)}>Resume</button>
        <button onClick={() => setGamePaused(true)}>Pause</button>
      </div>
      <div style={{ color: '#ffffff', marginTop: 10, fontSize: 14 }}>
        <p>Controls: Arrow Keys or WASD to move</p>
        <p>Touch gray mobs (neutral) to convert them into allies (green)</p>
        <p>If outnumbered, you lose allies. Win by reaching {MAX_TEAM}!</p>
      </div>
    </div>
  );
};

export default AllOfUsAreDead;
