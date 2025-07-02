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
  groupId?: number;
  offsetX?: number;
  offsetY?: number;
}

export const AllOfUsAreDead: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  const mobsRef = useRef<Mob[]>([]);
  const gameRunningRef = useRef(false);
  const gamePausedRef = useRef(false);
  const gameOverRef = useRef(false);

  const keys = useRef<Record<string, boolean>>({});
  const [_, forceRender] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    window.addEventListener('keydown', (e) => (keys.current[e.key] = true));
    window.addEventListener('keyup', (e) => (keys.current[e.key] = false));

    const gameLoop = () => {
      if (!ctx || !gameRunningRef.current || gamePausedRef.current || gameOverRef.current) {
        requestAnimationFrame(gameLoop);
        return;
      }

      const mobs = mobsRef.current;
      const allies = mobs.filter((m) => m.isAlly);
      const neutrals = mobs.filter((m) => !m.isAlly);
      const player = allies[0];

      // Player movement
      if (player) {
        if (keys.current['ArrowLeft'] || keys.current['a']) player.x -= SPEED;
        if (keys.current['ArrowRight'] || keys.current['d']) player.x += SPEED;
        if (keys.current['ArrowUp'] || keys.current['w']) player.y -= SPEED;
        if (keys.current['ArrowDown'] || keys.current['s']) player.y += SPEED;

        player.x = Math.max(MOB_SIZE, Math.min(CANVAS_WIDTH - MOB_SIZE, player.x));
        player.y = Math.max(MOB_SIZE, Math.min(CANVAS_HEIGHT - MOB_SIZE, player.y));
      }

      // Group movement
      const groupLeaders = new Map<number, Mob>();
      for (const mob of mobs) {
        if (!mob.isAlly && mob.groupId) {
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

      for (const mob of mobs) {
        if (!mob.isAlly && mob.groupId) {
          const leader = groupLeaders.get(mob.groupId);
          if (leader && mob !== leader) {
            mob.x = leader.x + (mob.offsetX || 0);
            mob.y = leader.y + (mob.offsetY || 0);
          }
        }
      }

      // Clear canvas
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // ✅ Group-based collision logic
      const collidedGroups = new Set<number>();
      for (const mob of neutrals) {
        const dist = player ? Math.hypot(player.x - mob.x, player.y - mob.y) : Infinity;
        if (dist < MOB_SIZE * 1.5 && mob.groupId) {
          collidedGroups.add(mob.groupId);
        }
      }

      collidedGroups.forEach((groupId) => {
        const groupMobs = neutrals.filter((m) => m.groupId === groupId);
        const groupSize = groupMobs.length;

        if (allies.length >= groupSize) {
          for (const mob of groupMobs) {
            mob.isAlly = true;
            mob.color = '#00ff00';
          }
        } else {
          const toRemove = groupSize - allies.length;
          let removed = 0;
          mobsRef.current = mobsRef.current.filter((m) => {
            if (removed < toRemove && m.isAlly) {
              removed++;
              return false;
            }
            return true;
          });
        }
      });

      // Draw all mobs
      for (const mob of mobsRef.current) {
        ctx.fillStyle = mob.color;
        ctx.beginPath();
        ctx.arc(mob.x, mob.y, mob.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Optional: show group sizes above leaders
        if (!mob.isAlly && mob.groupId && groupLeaders.get(mob.groupId) === mob) {
          const groupSize = mobsRef.current.filter((m) => m.groupId === mob.groupId).length;
          ctx.fillStyle = "#ffcc00";
          ctx.font = "14px Arial";
          ctx.textAlign = "center";
          ctx.fillText(`G: ${groupSize}`, mob.x, mob.y - MOB_SIZE - 5);
        }
      }

      // Show player team size
      if (player && ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`Team: ${allies.length}`, player.x, player.y - MOB_SIZE - 10);
      }

      // Update info
      if (infoRef.current) {
        infoRef.current.innerHTML = `<div style="color: white; font-size: 18px;">Team Size: ${allies.length}</div>`;
      }

      if (allies.length >= MAX_TEAM) {
        gameOverRef.current = true;
        if (infoRef.current) {
          infoRef.current.innerHTML += `<div style="color: #00ff00; font-size: 24px;">You Win!</div>`;
        }
      }

      if (allies.length === 0) {
        gameOverRef.current = true;
        if (infoRef.current) {
          infoRef.current.innerHTML += `<div style="color: red; font-size: 24px;">You Lost!</div>`;
        }
      }

      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', (e) => (keys.current[e.key] = false));
      window.removeEventListener('keyup', (e) => (keys.current[e.key] = false));
    };
  }, []);

  const createNeutralGroups = () => {
    const mobs: Mob[] = [];
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

    return mobs;
  };

  const handleStart = () => {
    setStarted(true);
    mobsRef.current = [
      {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        size: MOB_SIZE,
        color: '#00ff00',
        vx: 0,
        vy: 0,
        isAlly: true,
      },
      ...createNeutralGroups(),
    ];
    gameOverRef.current = false;
    gamePausedRef.current = false;
    gameRunningRef.current = true;
    forceRender((x) => x + 1);
  };

  const handlePause = () => {
    gamePausedRef.current = true;
    forceRender((x) => x + 1);
  };

  const handleResume = () => {
    gamePausedRef.current = false;
    forceRender((x) => x + 1);
  };

  if (!started) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 600 }}>
        <button
          onClick={handleStart}
          style={{ padding: '16px 40px', fontSize: 24, borderRadius: 8, background: '#00ff00', color: '#222', border: 'none', cursor: 'pointer', marginBottom: 24 }}
        >
          Click to Start
        </button>
        <div style={{ color: '#fff', fontSize: 16 }}>
          Recruit allies and survive! Move with arrow keys or WASD. Convert smaller groups to grow. Avoid bigger groups!
        </div>
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
      <div style={{ marginTop: 10 }}>
        <button onClick={handlePause}>Pause</button>
        <button onClick={handleResume}>Resume</button>
      </div>
      <div style={{ color: '#ffffff', marginTop: 10, fontSize: 14 }}>
        <p>Controls: Arrow Keys or WASD to move</p>
        <p>Touch smaller mobs/teams (gray) to grow your team (green)</p>
        <p>If you touch a bigger team, you lose. Reach {MAX_TEAM} allies to win!</p>
      </div>
    </div>
  );
};

export default AllOfUsAreDead;