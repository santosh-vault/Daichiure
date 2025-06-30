import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Constants for game settings
const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const GROUND_HEIGHT = 50;
const PLAYER_SIZE = 40;
const PLAYER_JUMP_VELOCITY = 15;
const PLAYER_GRAVITY = 0.8;
const INITIAL_GAME_SPEED = 4;
const OBSTACLE_MIN_SPEED_INCREASE = 0.05;
const OBSTACLE_MAX_SPEED_INCREASE = 0.1;
const OBSTACLE_MIN_GAP = 200;
const OBSTACLE_MAX_GAP = 500;
const MILESTONE_SCORE_INTERVAL = 500; // Every 500 points is a milestone

// Type Definitions
type GameState = 'start' | 'playing' | 'gameOver';

interface PlayerState {
  x: number;
  y: number;
  velocityY: number;
  isJumping: boolean;
  isFalling: boolean;
  frame: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'rock' | 'basket' | 'yak';
}

interface BackgroundElement {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'hill' | 'house' | 'stupa' | 'flag';
}

const Runner: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastTime = useRef<number>(0);

  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [gameSpeed, setGameSpeed] = useState<number>(INITIAL_GAME_SPEED);
  const [player, setPlayer] = useState<PlayerState>({
    x: 50,
    y: GAME_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE,
    velocityY: 0,
    isJumping: false,
    isFalling: false,
    frame: 0, // For simple animation
  });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [backgroundElements, setBackgroundElements] = useState<BackgroundElement[]>([]);
  const [milestoneMessage, setMilestoneMessage] = useState<string | null>(null);

  // Function to draw rounded rectangles
  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // Draw player character
  const drawPlayer = useCallback(
    (ctx: CanvasRenderingContext2D, playerState: PlayerState) => {
      ctx.save();
      ctx.translate(playerState.x + PLAYER_SIZE / 2, playerState.y + PLAYER_SIZE / 2);
      // Simple bounce effect for running
      const bounceOffset = playerState.isJumping || playerState.isFalling ? 0 : Math.sin(playerState.frame * 0.2) * 2;
      ctx.translate(0, bounceOffset);

      // Body (Daura Suruwal inspired)
      ctx.fillStyle = '#6D28D9'; // Deep purple
      roundRect(ctx, -PLAYER_SIZE / 2 + 5, -PLAYER_SIZE / 2 + 15, PLAYER_SIZE - 10, PLAYER_SIZE - 15, 5);
      ctx.fill();

      // Head
      ctx.fillStyle = '#FFDAB9'; // Peach skin tone
      ctx.beginPath();
      ctx.arc(0, -PLAYER_SIZE / 2 + 5, PLAYER_SIZE / 4, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(-PLAYER_SIZE / 8, -PLAYER_SIZE / 2 + 5, 2, 0, Math.PI * 2);
      ctx.arc(PLAYER_SIZE / 8, -PLAYER_SIZE / 2 + 5, 2, 0, Math.PI * 2);
      ctx.fill();

      // Scarf/Patuka (waist sash)
      ctx.fillStyle = '#EF4444'; // Red
      roundRect(ctx, -PLAYER_SIZE / 2 + 8, -PLAYER_SIZE / 2 + 20, PLAYER_SIZE - 16, 5, 2);
      ctx.fill();

      ctx.restore();
    },
    [roundRect]
  );

  // Draw obstacles
  const drawObstacle = useCallback(
    (ctx: CanvasRenderingContext2D, obstacle: Obstacle) => {
      ctx.fillStyle = '#78350F'; // Dark brown for general obstacles
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 2;

      switch (obstacle.type) {
        case 'rock':
          ctx.beginPath();
          ctx.arc(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.width / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        case 'basket':
          ctx.fillStyle = '#CA8A04'; // Amber
          roundRect(ctx, obstacle.x, obstacle.y, obstacle.width, obstacle.height, 5);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#FDE68A'; // Light amber for opening
          roundRect(ctx, obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, 5, 2);
          ctx.fill();
          break;
        case 'yak': // Simple stylized yak
          ctx.fillStyle = '#A3A3A3'; // Gray
          roundRect(ctx, obstacle.x, obstacle.y + obstacle.height * 0.2, obstacle.width, obstacle.height * 0.8, 8); // Body
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#4B5563'; // Darker gray for head
          roundRect(ctx, obstacle.x + obstacle.width * 0.7, obstacle.y, obstacle.width * 0.3, obstacle.height * 0.4, 5); // Head
          ctx.fill();
          ctx.stroke();
          break;
      }
    },
    [roundRect]
  );

  // Draw background elements
  const drawBackgroundElement = useCallback((ctx: CanvasRenderingContext2D, element: BackgroundElement) => {
    switch (element.type) {
      case 'hill':
        ctx.fillStyle = '#86EFAC'; // Light green hill
        ctx.beginPath();
        ctx.arc(element.x + element.width / 2, element.y + element.height, element.width / 2, 0, Math.PI, true);
        ctx.fill();
        break;
      case 'house':
        ctx.fillStyle = '#BE123C'; // Red roof
        ctx.beginPath();
        ctx.moveTo(element.x, element.y + element.height * 0.5);
        ctx.lineTo(element.x + element.width / 2, element.y);
        ctx.lineTo(element.x + element.width, element.y + element.height * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#FBCF89'; // Light brown walls
        roundRect(ctx, element.x, element.y + element.height * 0.5, element.width, element.height * 0.5, 5);
        ctx.fill();
        break;
      case 'stupa':
        ctx.fillStyle = '#FCD34D'; // Yellow dome
        ctx.beginPath();
        ctx.arc(element.x + element.width / 2, element.y + element.height * 0.7, element.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#F8FAFC'; // White base
        roundRect(ctx, element.x, element.y + element.height * 0.7, element.width, element.height * 0.3, 5);
        ctx.fill();
        ctx.fillStyle = '#9CA3AF'; // Spire
        roundRect(ctx, element.x + element.width / 2 - 2, element.y, 4, element.height * 0.7, 2);
        ctx.fill();
        break;
      case 'flag':
        ctx.fillStyle = '#3B82F6'; // Blue
        ctx.fillRect(element.x, element.y, element.width, element.height);
        ctx.fillStyle = '#D97706'; // Orange
        ctx.fillRect(element.x + element.width, element.y, element.width, element.height);
        // Pole
        ctx.fillStyle = '#78350F';
        ctx.fillRect(element.x + element.width * 0.5, element.y, 2, element.height * 2);
        break;
    }
  }, [roundRect]);

  // Game initialization / reset
  const initializeGame = useCallback(() => {
    setScore(0);
    setGameSpeed(INITIAL_GAME_SPEED);
    setPlayer({
      x: 50,
      y: GAME_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE,
      velocityY: 0,
      isJumping: false,
      isFalling: false,
      frame: 0,
    });
    setObstacles([]);
    setBackgroundElements([]);
    setMilestoneMessage(null);
    setGameState('playing');
  }, []);

  // Handle player jump
  const jump = useCallback(() => {
    setPlayer(prevPlayer => {
      if (!prevPlayer.isJumping && !prevPlayer.isFalling) {
        return {
          ...prevPlayer,
          velocityY: -PLAYER_JUMP_VELOCITY,
          isJumping: true,
        };
      }
      return prevPlayer;
    });
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'playing' && (e.code === 'Space' || e.code === 'ArrowUp')) {
        jump();
      } else if (gameState !== 'playing' && e.code === 'Space') {
        initializeGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, initializeGame, jump]);

  // Update game state logic
  const updateGame = useCallback(
    (deltaTime: number) => {
      if (gameState !== 'playing') return;

      // Update player position (gravity)
      setPlayer(prevPlayer => {
        let newY = prevPlayer.y + prevPlayer.velocityY * deltaTime;
        let newVelocityY = prevPlayer.velocityY + PLAYER_GRAVITY * deltaTime;
        let newIsJumping = prevPlayer.isJumping;
        let newIsFalling = prevPlayer.isFalling;
        let newFrame = (prevPlayer.frame + deltaTime * 0.1) % (Math.PI * 2); // For simple animation

        const groundY = GAME_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE;

        if (newY >= groundY) {
          newY = groundY;
          newVelocityY = 0;
          newIsJumping = false;
          newIsFalling = false;
        } else if (newVelocityY > 0) {
          newIsFalling = true;
        }

        return {
          ...prevPlayer,
          y: newY,
          velocityY: newVelocityY,
          isJumping: newIsJumping,
          isFalling: newIsFalling,
          frame: newFrame,
        };
      });

      // Update score
      setScore(prevScore => {
        const newScore = prevScore + gameSpeed * deltaTime * 0.1;
        // Check for milestones
        if (Math.floor(newScore / MILESTONE_SCORE_INTERVAL) > Math.floor(prevScore / MILESTONE_SCORE_INTERVAL)) {
          setMilestoneMessage(`वाह! ${Math.floor(newScore / MILESTONE_SCORE_INTERVAL) * MILESTONE_SCORE_INTERVAL} अंक!`); // Wow! {score} points!
          setTimeout(() => setMilestoneMessage(null), 1500); // Clear message after a short time
        }
        return newScore;
      });

      // Move obstacles
      setObstacles(prevObstacles =>
        prevObstacles
          .map(obstacle => ({ ...obstacle, x: obstacle.x - gameSpeed * deltaTime }))
          .filter(obstacle => obstacle.x + obstacle.width > 0)
      );

      // Generate new obstacles
      if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < GAME_WIDTH - Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP) - OBSTACLE_MIN_GAP) {
        const obstacleTypes: Obstacle['type'][] = ['rock', 'basket', 'yak'];
        const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        const newWidth = randomType === 'yak' ? 60 : (randomType === 'basket' ? 30 : 25);
        const newHeight = randomType === 'yak' ? 40 : (randomType === 'basket' ? 35 : 25);

        setObstacles(prevObstacles => [
          ...prevObstacles,
          {
            x: GAME_WIDTH + Math.random() * 100, // Add some randomness to spawn point
            y: GAME_HEIGHT - GROUND_HEIGHT - newHeight,
            width: newWidth,
            height: newHeight,
            type: randomType,
          },
        ]);
      }

      // Move background elements
      setBackgroundElements(prevElements =>
        prevElements
          .map(element => ({ ...element, x: element.x - gameSpeed * deltaTime * 0.5 })) // Slower scroll for parallax
          .filter(element => element.x + element.width > 0)
      );

      // Generate new background elements (sparse)
      if (backgroundElements.length < 5 && Math.random() < 0.005) { // Control density
        const bgTypes: BackgroundElement['type'][] = ['hill', 'house', 'stupa', 'flag'];
        const randomType = bgTypes[Math.floor(Math.random() * bgTypes.length)];
        let newWidth, newHeight, newY;
        switch (randomType) {
          case 'hill': newWidth = 150; newHeight = 70; newY = GAME_HEIGHT - GROUND_HEIGHT - newHeight + 20; break;
          case 'house': newWidth = 80; newHeight = 60; newY = GAME_HEIGHT - GROUND_HEIGHT - newHeight + 10; break;
          case 'stupa': newWidth = 70; newHeight = 90; newY = GAME_HEIGHT - GROUND_HEIGHT - newHeight + 5; break;
          case 'flag': newWidth = 20; newHeight = 30; newY = GAME_HEIGHT - GROUND_HEIGHT - newHeight - 20; break;
        }

        setBackgroundElements(prevElements => [
          ...prevElements,
          {
            x: GAME_WIDTH + Math.random() * 200,
            y: newY,
            width: newWidth,
            height: newHeight,
            type: randomType,
          },
        ]);
      }

      // Increase game speed over time
      setGameSpeed(prevSpeed => prevSpeed + (OBSTACLE_MIN_SPEED_INCREASE + Math.random() * OBSTACLE_MAX_SPEED_INCREASE) * deltaTime * 0.0001);

      // Collision detection
      const playerRect = {
        x: player.x,
        y: player.y,
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
      };

      for (const obstacle of obstacles) {
        const obstacleRect = {
          x: obstacle.x,
          y: obstacle.y,
          width: obstacle.width,
          height: obstacle.height,
        };

        if (
          playerRect.x < obstacleRect.x + obstacleRect.width &&
          playerRect.x + playerRect.width > obstacleRect.x &&
          playerRect.y < obstacleRect.y + obstacleRect.height &&
          playerRect.y + playerRect.height > obstacleRect.y
        ) {
          // Collision detected! Game Over
          setGameState('gameOver');
          if (score > highScore) {
            setHighScore(Math.floor(score));
          }
          break;
        }
      }
    },
    [gameState, player, obstacles, backgroundElements, score, highScore, gameSpeed, roundRect]
  );

  // Drawing function
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // Clear canvas
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Sky
      ctx.fillStyle = '#67E8F9'; // Light blue sky
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT - GROUND_HEIGHT);

      // Mountains (far background)
      ctx.fillStyle = '#94A3B8'; // Light gray-blue for distant mountains
      ctx.beginPath();
      ctx.moveTo(0, GAME_HEIGHT - GROUND_HEIGHT);
      ctx.lineTo(GAME_WIDTH * 0.1, GAME_HEIGHT - GROUND_HEIGHT - 50);
      ctx.lineTo(GAME_WIDTH * 0.3, GAME_HEIGHT - GROUND_HEIGHT - 80);
      ctx.lineTo(GAME_WIDTH * 0.5, GAME_HEIGHT - GROUND_HEIGHT - 60);
      ctx.lineTo(GAME_WIDTH * 0.7, GAME_HEIGHT - GROUND_HEIGHT - 90);
      ctx.lineTo(GAME_WIDTH * 0.9, GAME_HEIGHT - GROUND_HEIGHT - 70);
      ctx.lineTo(GAME_WIDTH, GAME_HEIGHT - GROUND_HEIGHT);
      ctx.closePath();
      ctx.fill();

      // Draw background elements (trees, houses, etc.)
      backgroundElements.forEach(element => drawBackgroundElement(ctx, element));

      // Ground
      ctx.fillStyle = '#4ADE80'; // Green ground
      ctx.fillRect(0, GAME_HEIGHT - GROUND_HEIGHT, GAME_WIDTH, GROUND_HEIGHT);
      ctx.fillStyle = '#22C55E'; // Darker green for texture/path
      roundRect(ctx, 0, GAME_HEIGHT - GROUND_HEIGHT + 10, GAME_WIDTH, 10, 5);
      ctx.fill();

      // Draw obstacles
      obstacles.forEach(obstacle => drawObstacle(ctx, obstacle));

      // Draw player
      drawPlayer(ctx, player);
    },
    [player, obstacles, backgroundElements, drawPlayer, drawObstacle, drawBackgroundElement, roundRect]
  );

  // Game Loop
  const gameLoop = useCallback(
    (currentTime: DOMHighResTimeStamp) => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const deltaTime = (currentTime - lastTime.current) / 16.6667; // Normalize to 60fps
      lastTime.current = currentTime;

      if (gameState === 'playing') {
        updateGame(deltaTime);
      }
      draw(ctx);

      animationFrameId.current = requestAnimationFrame(gameLoop);
    },
    [gameState, updateGame, draw]
  );

  // Start/Stop game loop
  useEffect(() => {
    if (gameState === 'playing' || gameState === 'start') {
      lastTime.current = performance.now();
      animationFrameId.current = requestAnimationFrame(gameLoop);
    } else if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameState, gameLoop]);

  // Handle canvas resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        const containerWidth = container.clientWidth;
        // Maintain aspect ratio (GAME_WIDTH / GAME_HEIGHT)
        const scale = containerWidth / GAME_WIDTH;
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        canvas.style.width = `${containerWidth}px`;
        canvas.style.height = `${GAME_HEIGHT * scale}px`;
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial resize
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-300 to-indigo-500 font-inter p-4">
      <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">नेपाली धावक (Nepali Runner)</h1>

      <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-purple-700 flex flex-col items-center p-2 md:p-4 lg:p-6" style={{ width: GAME_WIDTH, aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}` }}>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="bg-sky-200 rounded-lg border-2 border-gray-300"
        ></canvas>

        {/* Game UI Overlay */}
        <div className="absolute top-4 left-4 text-purple-800 font-bold text-xl drop-shadow">
          स्कोर (Score): {Math.floor(score)}
        </div>
        <div className="absolute top-4 right-4 text-purple-800 font-bold text-xl drop-shadow">
          उच्च स्कोर (High Score): {highScore}
        </div>

        {/* Milestone Message */}
        {milestoneMessage && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full shadow-lg text-2xl font-extrabold animate-bounce z-10">
            {milestoneMessage}
          </div>
        )}

        {/* Start/Game Over Screens */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-white text-5xl font-extrabold mb-4 animate-pulse">तयार?</h2> {/* Ready? */}
            <p className="text-white text-xl mb-8">स्पेस थिच्नुहोस् सुरू गर्न!</p> {/* Press Space to Start! */}
            <button
              onClick={initializeGame}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              सुरु गर्नुहोस् (Start Game)
            </button>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-red-500 text-6xl font-extrabold mb-4 animate-shake">खेल समाप्त!</h2> {/* Game Over! */}
            <p className="text-white text-2xl mb-2">अंक: {Math.floor(score)}</p>
            <p className="text-white text-2xl mb-8">उच्च स्कोर: {highScore}</p>
            <p className="text-white text-xl mb-4">स्पेस थिच्नुहोस् फेरि खेल्न!</p> {/* Press Space to Play Again! */}
            <button
              onClick={initializeGame}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              फेरि खेल्नुहोस् (Play Again)
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-white">
        <p className="text-lg">निर्देशन:</p>
        <p className="text-md">खिलाडीलाई उछाल्नको लागि <strong className="text-yellow-300">स्पेस बार (Spacebar)</strong> वा <strong className="text-yellow-300">माथिल्लो तीर (Up Arrow)</strong> थिच्नुहोस्।</p>
        <p className="text-md">बाधाहरूबाट बच्नुहोस् र धेरै अंक कमाउनुहोस्!</p>
      </div>
    </div>
  );
};

export default Runner;
