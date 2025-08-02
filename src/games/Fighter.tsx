import React, { useRef, useEffect, useState, useCallback } from "react";
import { useGameCoins } from "../hooks/useGameCoins";

const GAME_WIDTH = 900;
const GAME_HEIGHT = 500;
const GROUND_Y = GAME_HEIGHT - 80;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 80;
const PLAYER_SPEED = 3;
const JUMP_VELOCITY = -12;
const GRAVITY = 0.6;
const PUNCH_DAMAGE = 10;
const KICK_DAMAGE = 15;
const SPECIAL_DAMAGE = 25;
const MAX_HEALTH = 100;
const UPPERCUT_DAMAGE = 22;
const SPECIAL_COOLDOWN = 120;

// Types
interface Vec2 {
  x: number;
  y: number;
}
interface Fighter {
  pos: Vec2;
  vel: Vec2;
  health: number;
  isPlayer: boolean;
  facingRight: boolean;
  state:
    | "idle"
    | "walking"
    | "jumping"
    | "punching"
    | "kicking"
    | "blocking"
    | "special"
    | "hit"
    | "ko";
  stateTimer: number;
  combo: number;
  lastHit: number;
}

interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
  damage: number;
  active: boolean;
}

const Fighter: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<
    "start" | "fighting" | "roundEnd" | "gameOver"
  >("start");
  const [round, setRound] = useState(1);
  const [playerWins, setPlayerWins] = useState(0);
  const [aiWins, setAiWins] = useState(0);
  const [winner, setWinner] = useState<"player" | "ai" | null>(null);
  const [specialCooldown, setSpecialCooldown] = useState(0);
  const [showMoveList, setShowMoveList] = useState(false);
  const [started, setStarted] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(0);

  const [player, setPlayer] = useState<Fighter>({
    pos: { x: 150, y: GROUND_Y - PLAYER_HEIGHT },
    vel: { x: 0, y: 0 },
    health: MAX_HEALTH,
    isPlayer: true,
    facingRight: true,
    state: "idle",
    stateTimer: 0,
    combo: 0,
    lastHit: 0,
  });

  const [ai, setAi] = useState<Fighter>({
    pos: { x: GAME_WIDTH - 150, y: GROUND_Y - PLAYER_HEIGHT },
    vel: { x: 0, y: 0 },
    health: MAX_HEALTH,
    isPlayer: false,
    facingRight: false,
    state: "idle",
    stateTimer: 0,
    combo: 0,
    lastHit: 0,
  });

  const [hitboxes, setHitboxes] = useState<Hitbox[]>([]);
  const keys = useRef<{ [k: string]: boolean }>({});
  const lastTime = useRef<number>(0);

  // Handle keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === "Tab") {
        setShowMoveList(true);
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
      if (e.code === "Tab") setShowMoveList(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== "fighting") return;
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
  }, [gameState, player, ai, hitboxes]);

  // Set game start time when fighting begins
  useEffect(() => {
    if (gameState === "fighting" && gameStartTime === 0) {
      setGameStartTime(Date.now());
    }
  }, [gameState, gameStartTime]);

  // Coin earning system
  useGameCoins({
    gameId: "fighter",
    trigger: gameState === "gameOver",
    score: playerWins > aiWins ? 1000 + playerWins * 300 : aiWins * 100, // Bonus for winning
    duration:
      gameStartTime > 0 ? Math.floor((Date.now() - gameStartTime) / 1000) : 0,
  });

  // Update game logic
  const updateGame = useCallback(
    (dt: number) => {
      if (gameState !== "fighting") return;

      // Update player
      setPlayer((p) => {
        const newPlayer = { ...p };

        // Handle input
        if (p.state === "idle" || p.state === "walking") {
          if (keys.current["KeyA"] || keys.current["ArrowLeft"]) {
            newPlayer.vel.x = -PLAYER_SPEED;
            newPlayer.facingRight = false;
            newPlayer.state = "walking";
          } else if (keys.current["KeyD"] || keys.current["ArrowRight"]) {
            newPlayer.vel.x = PLAYER_SPEED;
            newPlayer.facingRight = true;
            newPlayer.state = "walking";
          } else {
            newPlayer.vel.x = 0;
            newPlayer.state = "idle";
          }

          if (keys.current["KeyW"] || keys.current["ArrowUp"]) {
            newPlayer.vel.y = JUMP_VELOCITY;
            newPlayer.state = "jumping";
          }

          // Attacks
          if (keys.current["KeyJ"]) {
            newPlayer.state = "punching";
            newPlayer.stateTimer = 15;
            createHitbox(newPlayer, "punch");
          } else if (keys.current["KeyK"]) {
            newPlayer.state = "kicking";
            newPlayer.stateTimer = 25;
            createHitbox(newPlayer, "kick");
          } else if (keys.current["KeyL"]) {
            newPlayer.state = "blocking";
            newPlayer.stateTimer = 20;
          } else if (keys.current["KeyU"] && specialCooldown <= 0) {
            newPlayer.state = "special";
            newPlayer.stateTimer = 40;
            createHitbox(newPlayer, "special");
            setSpecialCooldown(SPECIAL_COOLDOWN);
          }

          // Combo: J + K for uppercut
          if (keys.current["KeyJ"] && keys.current["KeyK"]) {
            newPlayer.state = "special";
            newPlayer.stateTimer = 30;
            createHitbox(newPlayer, "uppercut");
          }
        }

        // Update position
        newPlayer.pos.x += newPlayer.vel.x * dt;
        newPlayer.pos.y += newPlayer.vel.y * dt;

        // Apply gravity
        newPlayer.vel.y += GRAVITY * dt;

        // Ground collision
        if (newPlayer.pos.y >= GROUND_Y - PLAYER_HEIGHT) {
          newPlayer.pos.y = GROUND_Y - PLAYER_HEIGHT;
          newPlayer.vel.y = 0;
          if (newPlayer.state === "jumping") {
            newPlayer.state = "idle";
          }
        }

        // Screen bounds
        newPlayer.pos.x = Math.max(
          50,
          Math.min(GAME_WIDTH - 50, newPlayer.pos.x)
        );

        // Update state timer
        if (newPlayer.stateTimer > 0) {
          newPlayer.stateTimer -= dt;
          if (newPlayer.stateTimer <= 0) {
            newPlayer.state = "idle";
          }
        }

        return newPlayer;
      });

      // Update AI
      setAi((a) => {
        const newAi = { ...a };

        // Simple AI behavior
        const distance = Math.abs(player.pos.x - a.pos.x);

        if (a.state === "idle" || a.state === "walking") {
          // Move towards player
          if (distance > 100) {
            if (player.pos.x < a.pos.x) {
              newAi.vel.x = -PLAYER_SPEED * 0.8;
              newAi.facingRight = false;
            } else {
              newAi.vel.x = PLAYER_SPEED * 0.8;
              newAi.facingRight = true;
            }
            newAi.state = "walking";
          } else {
            newAi.vel.x = 0;
            newAi.state = "idle";

            // Attack if close
            if (Math.random() < 0.02) {
              const attacks = ["punching", "kicking", "special"];
              const attack =
                attacks[Math.floor(Math.random() * attacks.length)];
              newAi.state = attack as any;
              if (attack === "punching") {
                newAi.stateTimer = 15;
                createHitbox(newAi, "punch");
              } else if (attack === "kicking") {
                newAi.stateTimer = 25;
                createHitbox(newAi, "kick");
              } else {
                newAi.stateTimer = 40;
                createHitbox(newAi, "special");
              }
            }
          }
        }

        // Update position
        newAi.pos.x += newAi.vel.x * dt;
        newAi.pos.y += newAi.vel.y * dt;

        // Apply gravity
        newAi.vel.y += GRAVITY * dt;

        // Ground collision
        if (newAi.pos.y >= GROUND_Y - PLAYER_HEIGHT) {
          newAi.pos.y = GROUND_Y - PLAYER_HEIGHT;
          newAi.vel.y = 0;
          if (newAi.state === "jumping") {
            newAi.state = "idle";
          }
        }

        // Screen bounds
        newAi.pos.x = Math.max(50, Math.min(GAME_WIDTH - 50, newAi.pos.x));

        // Update state timer
        if (newAi.stateTimer > 0) {
          newAi.stateTimer -= dt;
          if (newAi.stateTimer <= 0) {
            newAi.state = "idle";
          }
        }

        return newAi;
      });

      // Update special cooldown
      if (specialCooldown > 0) {
        setSpecialCooldown((c) => Math.max(0, c - dt));
      }

      // Update hitboxes
      setHitboxes((hitboxes) =>
        hitboxes
          .map((hitbox) => {
            if (!hitbox.active) return hitbox;

            // Check collisions
            const target = hitbox.x < GAME_WIDTH / 2 ? ai : player;
            const hitboxRect = {
              x: hitbox.x,
              y: hitbox.y,
              width: hitbox.width,
              height: hitbox.height,
            };

            if (
              checkCollision(hitboxRect, {
                x: target.pos.x - PLAYER_WIDTH / 2,
                y: target.pos.y,
                width: PLAYER_WIDTH,
                height: PLAYER_HEIGHT,
              })
            ) {
              // Hit!
              if (target.isPlayer) {
                setPlayer((p) => ({
                  ...p,
                  health: Math.max(0, p.health - hitbox.damage),
                  state: "hit",
                  stateTimer: 10,
                }));
              } else {
                setAi((a) => ({
                  ...a,
                  health: Math.max(0, a.health - hitbox.damage),
                  state: "hit",
                  stateTimer: 10,
                }));
              }
              return { ...hitbox, active: false };
            }

            return hitbox;
          })
          .filter((h) => h.active)
      );

      // Check for KO
      if (player.health <= 0 && player.state !== "ko") {
        setPlayer((p) => ({ ...p, state: "ko", stateTimer: 60 }));
        setAiWins((w) => w + 1);
        setWinner("ai");
        setGameState("roundEnd");
      } else if (ai.health <= 0 && ai.state !== "ko") {
        setAi((a) => ({ ...a, state: "ko", stateTimer: 60 }));
        setPlayerWins((w) => w + 1);
        setWinner("player");
        setGameState("roundEnd");
      }
    },
    [gameState, player, ai, hitboxes, specialCooldown]
  );

  // Create hitbox for attacks
  const createHitbox = (fighter: Fighter, attackType: string) => {
    const hitbox: Hitbox = {
      x: fighter.facingRight ? fighter.pos.x + 30 : fighter.pos.x - 30,
      y: fighter.pos.y + 20,
      width: 40,
      height: 20,
      damage:
        attackType === "punch"
          ? PUNCH_DAMAGE
          : attackType === "kick"
          ? KICK_DAMAGE
          : attackType === "uppercut"
          ? UPPERCUT_DAMAGE
          : SPECIAL_DAMAGE,
      active: true,
    };
    setHitboxes((hitboxes) => [...hitboxes, hitbox]);
  };

  // Check collision between two rectangles
  const checkCollision = (
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ) => {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  };

  // Drawing function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#98FB98");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw ground
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);

    // Draw stickman
    const drawStickman = (fighter: Fighter) => {
      ctx.save();
      ctx.translate(fighter.pos.x, fighter.pos.y);
      if (!fighter.facingRight) {
        ctx.scale(-1, 1);
      }

      // Body
      ctx.strokeStyle = fighter.isPlayer ? "#0000FF" : "#FF0000";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 60);
      ctx.stroke();

      // Head
      ctx.beginPath();
      ctx.arc(0, -10, 15, 0, Math.PI * 2);
      ctx.stroke();

      // Arms
      if (fighter.state === "punching") {
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(30, 15);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(-15, 20);
        ctx.stroke();
      } else if (fighter.state === "kicking") {
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(15, 20);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(-15, 20);
        ctx.stroke();
        // Kicking leg
        ctx.beginPath();
        ctx.moveTo(0, 60);
        ctx.lineTo(25, 50);
        ctx.stroke();
      } else if (fighter.state === "blocking") {
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(20, 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(20, 15);
        ctx.stroke();
      } else if (fighter.state === "special") {
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(40, 10);
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.strokeStyle = fighter.isPlayer ? "#0000FF" : "#FF0000";
      } else {
        // Normal arms
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(15, 20);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(-15, 20);
        ctx.stroke();
      }

      // Legs
      if (fighter.state !== "kicking") {
        ctx.beginPath();
        ctx.moveTo(0, 60);
        ctx.lineTo(10, 80);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 60);
        ctx.lineTo(-10, 80);
        ctx.stroke();
      } else {
        // Standing leg
        ctx.beginPath();
        ctx.moveTo(0, 60);
        ctx.lineTo(-10, 80);
        ctx.stroke();
      }

      ctx.restore();
    };

    // Draw fighters
    drawStickman(player);
    drawStickman(ai);

    // Draw hitboxes (for debugging)
    hitboxes.forEach((hitbox) => {
      if (hitbox.active) {
        ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
        ctx.fillRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
      }
    });

    // Draw health bars
    const drawHealthBar = (
      x: number,
      y: number,
      health: number,
      isPlayer: boolean
    ) => {
      const width = 200;
      const height = 20;

      // Background
      ctx.fillStyle = "#333";
      ctx.fillRect(x, y, width, height);

      // Health
      const healthPercent = health / MAX_HEALTH;
      ctx.fillStyle =
        healthPercent > 0.5
          ? "#00FF00"
          : healthPercent > 0.25
          ? "#FFFF00"
          : "#FF0000";
      ctx.fillRect(x, y, width * healthPercent, height);

      // Border
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Text
      ctx.fillStyle = "#000";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        `${isPlayer ? "Player" : "AI"}: ${health}`,
        x + width / 2,
        y + 15
      );
    };

    drawHealthBar(50, 30, player.health, true);
    drawHealthBar(GAME_WIDTH - 250, 30, ai.health, false);

    // Draw round info
    ctx.fillStyle = "#000";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Round ${round}`, GAME_WIDTH / 2, 25);
    ctx.fillText(`Player: ${playerWins} | AI: ${aiWins}`, GAME_WIDTH / 2, 50);

    // Draw special cooldown
    if (specialCooldown > 0) {
      ctx.fillStyle = "#FF0000";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        `Special Cooldown: ${Math.ceil(specialCooldown / 60)}s`,
        GAME_WIDTH / 2,
        80
      );
    }

    // Draw controls
    ctx.fillStyle = "#000";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Controls:", 10, GAME_HEIGHT - 80);
    ctx.fillText("Move: A/D or Arrow Keys", 10, GAME_HEIGHT - 60);
    ctx.fillText("Jump: W or Up Arrow", 10, GAME_HEIGHT - 45);
    ctx.fillText(
      "Punch: J | Kick: K | Block: L | Special: U",
      10,
      GAME_HEIGHT - 30
    );
  }, [player, ai, hitboxes, round, playerWins, aiWins, specialCooldown]);

  // Start new round
  const startRound = () => {
    setPlayer((p) => ({
      ...p,
      pos: { x: 150, y: GROUND_Y - PLAYER_HEIGHT },
      vel: { x: 0, y: 0 },
      health: MAX_HEALTH,
      state: "idle",
      stateTimer: 0,
    }));
    setAi((a) => ({
      ...a,
      pos: { x: GAME_WIDTH - 150, y: GROUND_Y - PLAYER_HEIGHT },
      vel: { x: 0, y: 0 },
      health: MAX_HEALTH,
      state: "idle",
      stateTimer: 0,
    }));
    setHitboxes([]);
    setWinner(null);
    setGameState("fighting");
  };

  // Start game
  const startGame = () => {
    setRound(1);
    setPlayerWins(0);
    setAiWins(0);
    startRound();
  };

  // Next round
  const nextRound = () => {
    if (playerWins >= 2 || aiWins >= 2) {
      setGameState("gameOver");
    } else {
      setRound((r) => r + 1);
      startRound();
    }
  };

  if (!started) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: 600,
        }}
      >
        <button
          onClick={() => setStarted(true)}
          style={{
            padding: "16px 40px",
            fontSize: 24,
            borderRadius: 8,
            background: "#00ff00",
            color: "#222",
            border: "none",
            cursor: "pointer",
            marginBottom: 24,
          }}
        >
          Click to Start
        </button>
        <div style={{ color: "#fff", fontSize: 16 }}>
          Epic 2D fighting game with stickman characters! Fight against AI with
          punches, kicks, blocks, and special moves. Win 2 out of 3 rounds!
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 to-green-300 font-inter p-4">
      <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
        Stickman Fighter
      </h1>
      <div
        className="relative bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-gray-700 flex flex-col items-center p-2 md:p-4 lg:p-6"
        style={{
          width: GAME_WIDTH,
          aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="bg-gradient-to-b from-blue-200 to-green-100 rounded-lg border-2 border-gray-300"
        ></canvas>

        {/* Start Screen */}
        {gameState === "start" && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-white text-5xl font-extrabold mb-6 animate-pulse">
              Stickman Fighter
            </h2>
            <p className="text-white text-xl mb-8 text-center max-w-md">
              Fight against the AI in this epic stickman battle!
              <br />
              Use your skills to win 2 out of 3 rounds!
            </p>
            <button
              onClick={startGame}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Start Fight!
            </button>
          </div>
        )}

        {/* Round End Screen */}
        {gameState === "roundEnd" && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center rounded-lg">
            <h2
              className={`text-6xl font-extrabold mb-4 animate-bounce ${
                winner === "player" ? "text-green-400" : "text-red-400"
              }`}
            >
              {winner === "player" ? "YOU WIN!" : "AI WINS!"}
            </h2>
            <p className="text-white text-2xl mb-8">Round {round} Complete</p>
            <button
              onClick={nextRound}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              {playerWins >= 2 || aiWins >= 2 ? "Play Again" : "Next Round"}
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === "gameOver" && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center rounded-lg">
            <h2
              className={`text-6xl font-extrabold mb-4 animate-bounce ${
                playerWins > aiWins ? "text-green-400" : "text-red-400"
              }`}
            >
              {playerWins > aiWins ? "VICTORY!" : "DEFEAT!"}
            </h2>
            <p className="text-white text-2xl mb-2">
              Final Score: {playerWins} - {aiWins}
            </p>
            <p className="text-white text-xl mb-8">Great fight!</p>
            <button
              onClick={() => setGameState("start")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Fight Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Fighter;
