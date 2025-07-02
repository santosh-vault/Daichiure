import React, { useRef, useEffect, useState, useCallback } from 'react';

const GAME_WIDTH = 900;
const GAME_HEIGHT = 500;
const FIELD_MARGIN = 40;
const PLAYER_RADIUS = 22;
const BALL_RADIUS = 12;
const GOAL_WIDTH = 120;
const GOAL_HEIGHT = 80;
const PLAYER_SPEED = 5;
const BALL_FRICTION = 0.98;
const KICK_STRENGTH = 9;
const MATCH_TIME = 90; // seconds

// Types
interface Vec2 { x: number; y: number; }

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

const distance = (a: Vec2, b: Vec2) => Math.hypot(a.x - b.x, a.y - b.y);

const Football: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState<Vec2>({ x: GAME_WIDTH / 3, y: GAME_HEIGHT / 2 });
  const [ai, setAI] = useState<Vec2>({ x: (2 * GAME_WIDTH) / 3, y: GAME_HEIGHT / 2 });
  const [ball, setBall] = useState<{ pos: Vec2; vel: Vec2 }>({ pos: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 }, vel: { x: 0, y: 0 } });
  const [score, setScore] = useState<{ player: number; ai: number }>({ player: 0, ai: 0 });
  const [timer, setTimer] = useState(MATCH_TIME);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'goal' | 'end'>('start');
  const keys = useRef<{ [k: string]: boolean }>({});
  const lastTime = useRef<number>(0);
  const goalTimeout = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [started, setStarted] = useState(false);

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

  // Game loop
  useEffect(() => {
    if (gameState === 'end') return;
    let animId: number;
    const loop = (t: number) => {
      if (!lastTime.current) lastTime.current = t;
      const dt = Math.min((t - lastTime.current) / 16.6667, 2); // normalize to 60fps
      lastTime.current = t;
      if (gameState === 'playing') {
        updateGame(dt);
      }
      draw();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
    // eslint-disable-next-line
  }, [gameState, player, ai, ball, timer, score]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timer <= 0) {
      setGameState('end');
      return;
    }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [gameState, timer]);

  // Fullscreen logic
  const handleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Keyboard shortcut for fullscreen (F)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyF') {
        handleFullscreen();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleFullscreen]);

  // Game logic
  const updateGame = (dt: number) => {
    // Player movement
    const nextPlayer = { ...player };
    if (keys.current['ArrowUp'] || keys.current['KeyW']) nextPlayer.y -= PLAYER_SPEED * dt;
    if (keys.current['ArrowDown'] || keys.current['KeyS']) nextPlayer.y += PLAYER_SPEED * dt;
    if (keys.current['ArrowLeft'] || keys.current['KeyA']) nextPlayer.x -= PLAYER_SPEED * dt;
    if (keys.current['ArrowRight'] || keys.current['KeyD']) nextPlayer.x += PLAYER_SPEED * dt;
    // Clamp to field
    nextPlayer.x = clamp(nextPlayer.x, FIELD_MARGIN + PLAYER_RADIUS, GAME_WIDTH - FIELD_MARGIN - PLAYER_RADIUS);
    nextPlayer.y = clamp(nextPlayer.y, FIELD_MARGIN + PLAYER_RADIUS, GAME_HEIGHT - FIELD_MARGIN - PLAYER_RADIUS);
    setPlayer(nextPlayer);

    // AI movement (simple: chase ball, defend goal)
    const nextAI = { ...ai };
    const aiGoal = { x: GAME_WIDTH - FIELD_MARGIN - GOAL_WIDTH / 2, y: GAME_HEIGHT / 2 };
    const defend = ball.pos.x > GAME_WIDTH / 2;
    const target = defend ? { x: aiGoal.x - 40, y: ball.pos.y } : ball.pos;
    const dx = target.x - ai.x, dy = target.y - ai.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 2) {
      nextAI.x += (dx / dist) * PLAYER_SPEED * 0.9 * dt;
      nextAI.y += (dy / dist) * PLAYER_SPEED * 0.9 * dt;
    }
    nextAI.x = clamp(nextAI.x, FIELD_MARGIN + PLAYER_RADIUS, GAME_WIDTH - FIELD_MARGIN - PLAYER_RADIUS);
    nextAI.y = clamp(nextAI.y, FIELD_MARGIN + PLAYER_RADIUS, GAME_HEIGHT - FIELD_MARGIN - PLAYER_RADIUS);
    setAI(nextAI);

    // Ball physics
    const nextBall = { ...ball };
    nextBall.pos.x += nextBall.vel.x * dt;
    nextBall.pos.y += nextBall.vel.y * dt;
    nextBall.vel.x *= BALL_FRICTION;
    nextBall.vel.y *= BALL_FRICTION;

    // Ball collision with field
    if (nextBall.pos.x < FIELD_MARGIN + BALL_RADIUS) {
      nextBall.pos.x = FIELD_MARGIN + BALL_RADIUS;
      nextBall.vel.x *= -0.7;
    }
    if (nextBall.pos.x > GAME_WIDTH - FIELD_MARGIN - BALL_RADIUS) {
      nextBall.pos.x = GAME_WIDTH - FIELD_MARGIN - BALL_RADIUS;
      nextBall.vel.x *= -0.7;
    }
    if (nextBall.pos.y < FIELD_MARGIN + BALL_RADIUS) {
      nextBall.pos.y = FIELD_MARGIN + BALL_RADIUS;
      nextBall.vel.y *= -0.7;
    }
    if (nextBall.pos.y > GAME_HEIGHT - FIELD_MARGIN - BALL_RADIUS) {
      nextBall.pos.y = GAME_HEIGHT - FIELD_MARGIN - BALL_RADIUS;
      nextBall.vel.y *= -0.7;
    }

    // Ball collision with player
    [
      { p: nextPlayer, isPlayer: true },
      { p: nextAI, isPlayer: false },
    ].forEach(({ p, isPlayer }) => {
      const d = distance(nextBall.pos, p);
      if (d < PLAYER_RADIUS + BALL_RADIUS) {
        // Push ball out
        const angle = Math.atan2(nextBall.pos.y - p.y, nextBall.pos.x - p.x);
        nextBall.pos.x = p.x + Math.cos(angle) * (PLAYER_RADIUS + BALL_RADIUS + 1);
        nextBall.pos.y = p.y + Math.sin(angle) * (PLAYER_RADIUS + BALL_RADIUS + 1);
        // Kick if player and pressing Space
        if (isPlayer && keys.current['Space']) {
          nextBall.vel.x = Math.cos(angle) * KICK_STRENGTH;
          nextBall.vel.y = Math.sin(angle) * KICK_STRENGTH;
        } else {
          // AI "kick"
          if (!isPlayer && Math.random() < 0.04) {
            nextBall.vel.x = Math.cos(angle) * (KICK_STRENGTH * 0.9);
            nextBall.vel.y = Math.sin(angle) * (KICK_STRENGTH * 0.9);
          }
        }
      }
    });

    // Goal detection
    // Player goal (right)
    if (
      nextBall.pos.x > GAME_WIDTH - FIELD_MARGIN - BALL_RADIUS &&
      nextBall.pos.y > GAME_HEIGHT / 2 - GOAL_HEIGHT / 2 &&
      nextBall.pos.y < GAME_HEIGHT / 2 + GOAL_HEIGHT / 2
    ) {
      setScore(s => ({ ...s, player: s.player + 1 }));
      setGameState('goal');
      resetPositions();
      return;
    }
    // AI goal (left)
    if (
      nextBall.pos.x < FIELD_MARGIN + BALL_RADIUS &&
      nextBall.pos.y > GAME_HEIGHT / 2 - GOAL_HEIGHT / 2 &&
      nextBall.pos.y < GAME_HEIGHT / 2 + GOAL_HEIGHT / 2
    ) {
      setScore(s => ({ ...s, ai: s.ai + 1 }));
      setGameState('goal');
      resetPositions();
      return;
    }

    setBall(nextBall);
  };

  // Reset after goal
  const resetPositions = () => {
    if (goalTimeout.current) clearTimeout(goalTimeout.current);
    goalTimeout.current = setTimeout(() => {
      setPlayer({ x: GAME_WIDTH / 3, y: GAME_HEIGHT / 2 });
      setAI({ x: (2 * GAME_WIDTH) / 3, y: GAME_HEIGHT / 2 });
      setBall({ pos: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 }, vel: { x: 0, y: 0 } });
      setGameState('playing');
    }, 1500);
  };

  // Drawing
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Field
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.strokeRect(FIELD_MARGIN, FIELD_MARGIN, GAME_WIDTH - 2 * FIELD_MARGIN, GAME_HEIGHT - 2 * FIELD_MARGIN);
    // Center line
    ctx.beginPath();
    ctx.moveTo(GAME_WIDTH / 2, FIELD_MARGIN);
    ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT - FIELD_MARGIN);
    ctx.stroke();
    // Center circle
    ctx.beginPath();
    ctx.arc(GAME_WIDTH / 2, GAME_HEIGHT / 2, 60, 0, Math.PI * 2);
    ctx.stroke();
    // Goals
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(GAME_WIDTH - FIELD_MARGIN - 8, GAME_HEIGHT / 2 - GOAL_HEIGHT / 2, 8, GOAL_HEIGHT);
    ctx.fillRect(FIELD_MARGIN, GAME_HEIGHT / 2 - GOAL_HEIGHT / 2, 8, GOAL_HEIGHT);

    // Ball
    ctx.beginPath();
    ctx.arc(ball.pos.x, ball.pos.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.stroke();

    // Player
    ctx.beginPath();
    ctx.arc(player.x, player.y, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#2563eb';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    // Player face
    ctx.beginPath();
    ctx.arc(player.x, player.y - 7, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fde68a';
    ctx.fill();

    // AI
    ctx.beginPath();
    ctx.arc(ai.x, ai.y, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    // AI face
    ctx.beginPath();
    ctx.arc(ai.x, ai.y - 7, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fca5a5';
    ctx.fill();

    // Score & timer
    ctx.font = 'bold 32px Inter, Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(`${score.player}  :  ${score.ai}`, GAME_WIDTH / 2, 50);
    ctx.font = 'bold 24px Inter, Arial';
    ctx.fillText(`⏱ ${timer}s`, GAME_WIDTH / 2, 90);
  }, [player, ai, ball, score, timer]);

  // Start game
  const startGame = () => {
    setScore({ player: 0, ai: 0 });
    setTimer(MATCH_TIME);
    setPlayer({ x: GAME_WIDTH / 3, y: GAME_HEIGHT / 2 });
    setAI({ x: (2 * GAME_WIDTH) / 3, y: GAME_HEIGHT / 2 });
    setBall({ pos: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 }, vel: { x: 0, y: 0 } });
    setGameState('playing');
  };

  // UI
  if (!started) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 600 }}>
        <button
          onClick={() => setStarted(true)}
          style={{ padding: '16px 40px', fontSize: 24, borderRadius: 8, background: '#00ff00', color: '#222', border: 'none', cursor: 'pointer', marginBottom: 24 }}
        >
          Click to Start
        </button>
        <div style={{ color: '#fff', fontSize: 16 }}>A fast-paced 2D football game! Move, dribble, and score against the AI. Use Arrow keys/WASD to move, Space to kick.</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-300 to-blue-400 font-inter p-4">
      <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">Football Frenzy</h1>
      <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-green-700 flex flex-col items-center p-2 md:p-4 lg:p-6" style={{ width: GAME_WIDTH, aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}` }}>
        {/* Fullscreen Button */}
        <button
          onClick={handleFullscreen}
          className="absolute top-3 right-3 z-20 bg-gray-800 bg-opacity-80 hover:bg-opacity-100 text-white rounded-full p-2 shadow-lg focus:outline-none"
          title={isFullscreen ? 'Exit Fullscreen (F)' : 'Go Fullscreen (F)'}
        >
          {isFullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13H5v6h6v-4m6-6h4V5h-6v4m0 6v4h6v-6h-4m-6-6V5H5v6h4" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4M20 8V4h-4M4 16v4h4m12-4v4h-4" /></svg>
          )}
        </button>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="bg-green-800 rounded-lg border-2 border-gray-300"
        ></canvas>
        {/* Overlay */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-white text-5xl font-extrabold mb-4 animate-pulse">Ready?</h2>
            <p className="text-white text-xl mb-8">Press Space to Start!</p>
            <button
              onClick={startGame}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Start Match
            </button>
          </div>
        )}
        {gameState === 'goal' && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-yellow-400 text-6xl font-extrabold mb-4 animate-bounce">GOAL!</h2>
          </div>
        )}
        {gameState === 'end' && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-red-500 text-6xl font-extrabold mb-4 animate-shake">Full Time!</h2>
            <p className="text-white text-2xl mb-2">Final Score: {score.player} : {score.ai}</p>
            <button
              onClick={startGame}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 mt-6"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      <div className="mt-8 text-center text-white">
        <p className="text-lg">Instructions:</p>
        <p className="text-md">Move: <span className="text-yellow-300">Arrow Keys</span> or <span className="text-yellow-300">WASD</span></p>
        <p className="text-md">Kick: <span className="text-yellow-300">Spacebar</span></p>
        <p className="text-md">Score more goals than the AI before time runs out!</p>
      </div>
    </div>
  );
};

export default Football; 