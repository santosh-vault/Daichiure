import React, { useRef, useEffect } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 30;
const CREW_SIZE = 25;
const TASK_SIZE = 20;
const SPEED = 3;

interface Player {
  x: number;
  y: number;
  size: number;
  color: string;
  tasksDone: number;
}

interface CrewMember {
  x: number;
  y: number;
  size: number;
  color: string;
  isImposter: boolean;
  cooldown: number;
  vx: number;
  vy: number;
}

interface Task {
  x: number;
  y: number;
  size: number;
  completed: boolean;
}

export const AmongImposterGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Game state
    const player: Player = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      size: PLAYER_SIZE,
      color: '#00ff00',
      tasksDone: 0
    };

    const crewMembers: CrewMember[] = [];
    const tasks: Task[] = [
      { x: 150, y: 100, size: TASK_SIZE, completed: false },
      { x: 600, y: 100, size: TASK_SIZE, completed: false },
      { x: 150, y: 500, size: TASK_SIZE, completed: false },
      { x: 600, y: 500, size: TASK_SIZE, completed: false }
    ];

    // Create crew members
    const NUM_CREW = 5;
    const imposterIndex = Math.floor(Math.random() * NUM_CREW);
    for (let i = 0; i < NUM_CREW; i++) {
      crewMembers.push({
        x: Math.random() * (CANVAS_WIDTH - 100) + 50,
        y: Math.random() * (CANVAS_HEIGHT - 100) + 50,
        size: CREW_SIZE,
        color: i === imposterIndex ? '#ff0000' : '#0000ff',
        isImposter: i === imposterIndex,
        cooldown: 0,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
      });
    }

    // Input handling
    const keys: { [key: string]: boolean } = {};
    const handleKeyDown = (e: KeyboardEvent) => { keys[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let gameOver = false;
    let gameWon = false;
    let guessPhase = false;
    let guessResult: string | null = null;

    // Mouse click for guess phase
    const handleCanvasClick = (e: MouseEvent) => {
      if (!guessPhase) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      for (let i = 0; i < crewMembers.length; i++) {
        const crew = crewMembers[i];
        const dist = Math.hypot(mx - crew.x, my - crew.y);
        if (dist < crew.size + 8) {
          guessPhase = false;
          if (crew.isImposter) {
            guessResult = 'win';
            if (scoreRef.current) {
              scoreRef.current.innerHTML = '<div style="color: #00ff00; font-size: 24px; text-align: center; margin-top: 20px;">You Win! You correctly identified the imposter!</div>';
            }
          } else {
            guessResult = 'lose';
            if (scoreRef.current) {
              scoreRef.current.innerHTML = '<div style="color: #ff0000; font-size: 24px; text-align: center; margin-top: 20px;">Wrong! That was not the imposter.</div>';
            }
          }
          break;
        }
      }
    };
    canvas.addEventListener('click', handleCanvasClick);

    // Game loop
    function gameLoop() {
      if (gameOver && !guessPhase) return;
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Update player position
      if (!guessPhase) {
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) player.x -= SPEED;
        if (keys['ArrowRight'] || keys['d'] || keys['D']) player.x += SPEED;
        if (keys['ArrowUp'] || keys['w'] || keys['W']) player.y -= SPEED;
        if (keys['ArrowDown'] || keys['s'] || keys['S']) player.y += SPEED;
      }

      // Keep player in bounds
      player.x = Math.max(player.size, Math.min(CANVAS_WIDTH - player.size, player.x));
      player.y = Math.max(player.size, Math.min(CANVAS_HEIGHT - player.size, player.y));

      // Update crew members
      if (!guessPhase) {
        crewMembers.forEach(crew => {
          // Move crew randomly
          crew.x += crew.vx;
          crew.y += crew.vy;
          // Bounce off walls
          if (crew.x <= crew.size || crew.x >= CANVAS_WIDTH - crew.size) crew.vx *= -1;
          if (crew.y <= crew.size || crew.y >= CANVAS_HEIGHT - crew.size) crew.vy *= -1;
          crew.x = Math.max(crew.size, Math.min(CANVAS_WIDTH - crew.size, crew.x));
          crew.y = Math.max(crew.size, Math.min(CANVAS_HEIGHT - crew.size, crew.y));
          // Imposter logic
          if (crew.isImposter && crew.cooldown <= 0) {
            const distance = Math.hypot(player.x - crew.x, player.y - crew.y);
            if (distance < player.size + crew.size) {
              gameOver = true;
              if (scoreRef.current) {
                scoreRef.current.innerHTML = '<div style="color: #ff0000; font-size: 24px; text-align: center; margin-top: 20px;">You were eliminated by the Imposter!</div>';
              }
              return;
            }
          }
          crew.cooldown = Math.max(0, crew.cooldown - 1);
        });
      }

      // Check task completion
      if (!guessPhase) {
        tasks.forEach(task => {
          if (!task.completed) {
            const distance = Math.hypot(player.x - task.x, player.y - task.y);
            if (distance < player.size + task.size) {
              task.completed = true;
              player.tasksDone++;
              if (player.tasksDone >= tasks.length) {
                guessPhase = true;
                if (scoreRef.current) {
                  scoreRef.current.innerHTML = '<div style="color: #ffff00; font-size: 22px; text-align: center; margin-top: 20px;">All tasks done!<br>Now click on the crew member you think is the imposter!</div>';
                }
              }
            }
          }
        });
      }

      // Draw tasks
      tasks.forEach(task => {
        if (!task.completed && ctx) {
          ctx.fillStyle = '#00ff00';
          ctx.fillRect(task.x - task.size/2, task.y - task.size/2, task.size, task.size);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.strokeRect(task.x - task.size/2, task.y - task.size/2, task.size, task.size);
        }
      });

      // Draw crew members
      crewMembers.forEach(crew => {
        if (!ctx) return;
        ctx.save();
        if (guessPhase) {
          ctx.shadowColor = '#ffff00';
          ctx.shadowBlur = 20;
        }
        ctx.fillStyle = crew.color;
        ctx.beginPath();
        ctx.arc(crew.x, crew.y, crew.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Draw eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(crew.x - 8, crew.y - 5, 3, 0, Math.PI * 2);
        ctx.arc(crew.x + 8, crew.y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw player
      if (ctx && !guessPhase) {
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Draw player eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(player.x - 10, player.y - 8, 4, 0, Math.PI * 2);
        ctx.arc(player.x + 10, player.y - 8, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update score
      if (scoreRef.current && !gameOver && !guessPhase) {
        scoreRef.current.innerHTML = `
          <div style="color: #ffffff; font-size: 18px; text-align: center; margin-top: 10px;">
            Tasks Completed: ${player.tasksDone}/${tasks.length}
          </div>
        `;
      }

      requestAnimationFrame(gameLoop);
    }

    gameLoop();

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, []);

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
          margin: '0 auto'
        }}
      />
      <div ref={scoreRef} style={{ marginTop: 10 }}></div>
      <div style={{ color: '#ffffff', marginTop: 10, fontSize: 14 }}>
        <p>Controls: Arrow Keys or WASD to move</p>
        <p>Complete all green tasks, then click on the crew member you think is the imposter!</p>
        <p>Blue crew members are safe, red one is the imposter!</p>
      </div>
    </div>
  );
};

export default AmongImposterGame; 