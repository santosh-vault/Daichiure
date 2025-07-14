import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAwardGameCoins } from './coinAwarder';

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
const LANE_WIDTH = 200; // Width of each lane
const LANE_COUNT = 3; // Number of lanes
const POWERUP_SPAWN_CHANCE = 0.003; // 0.3% chance per frame
const COMBO_MULTIPLIER = 1.5; // Score multiplier for combos
const MAX_COMBO_TIME = 3000; // 3 seconds to maintain combo

// Type Definitions
type GameState = 'start' | 'playing' | 'gameOver';

interface PlayerState {
  x: number;
  y: number;
  velocityY: number;
  isJumping: boolean;
  isFalling: boolean;
  frame: number;
  lane: number; // Current lane (0, 1, 2)
  health: number;
  isInvulnerable: boolean;
  invulnerabilityTime: number;
  powerUpActive: boolean;
  powerUpType: string | null;
  powerUpEndTime: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'rock' | 'basket' | 'yak' | 'bird' | 'flyingYak' | 'spinningWheel';
  lane: number;
  health: number;
  isMoving: boolean;
  movePattern: 'straight' | 'zigzag' | 'circle';
  moveSpeed: number;
  moveTime: number;
}

interface PowerUp {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'health' | 'speed' | 'shield' | 'doubleScore' | 'magnet';
  lane: number;
  collected: boolean;
  animationFrame: number;
}

interface BackgroundElement {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'hill' | 'house' | 'stupa' | 'flag' | 'tree' | 'cloud';
  lane: number;
}

interface ComboSystem {
  count: number;
  multiplier: number;
  lastComboTime: number;
  isActive: boolean;
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
    lane: 1, // Start in middle lane
    health: 3,
    isInvulnerable: false,
    invulnerabilityTime: 0,
    powerUpActive: false,
    powerUpType: null,
    powerUpEndTime: 0,
  });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [backgroundElements, setBackgroundElements] = useState<BackgroundElement[]>([]);
  const [milestoneMessage, setMilestoneMessage] = useState<string | null>(null);
  const [comboSystem, setComboSystem] = useState<ComboSystem>({
    count: 0,
    multiplier: 1,
    lastComboTime: 0,
    isActive: false,
  });
  const [started, setStarted] = useState(false);

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
      ctx.save();
      
      // Apply rotation for spinning wheel
      if (obstacle.type === 'spinningWheel') {
        ctx.translate(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
        ctx.rotate(obstacle.moveTime * 0.1);
        ctx.translate(-(obstacle.x + obstacle.width / 2), -(obstacle.y + obstacle.height / 2));
      }

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
        case 'bird':
          ctx.fillStyle = '#EF4444'; // Red bird
          ctx.beginPath();
          ctx.arc(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.width / 2, 0, Math.PI * 2);
          ctx.fill();
          // Wings
          ctx.fillStyle = '#DC2626';
          ctx.beginPath();
          ctx.ellipse(obstacle.x + obstacle.width * 0.3, obstacle.y + obstacle.height * 0.3, 8, 4, 0, 0, Math.PI * 2);
          ctx.ellipse(obstacle.x + obstacle.width * 0.7, obstacle.y + obstacle.height * 0.3, 8, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'flyingYak':
          ctx.fillStyle = '#6B7280'; // Gray flying yak
          roundRect(ctx, obstacle.x, obstacle.y + obstacle.height * 0.2, obstacle.width, obstacle.height * 0.8, 8);
          ctx.fill();
          ctx.stroke();
          // Wings
          ctx.fillStyle = '#9CA3AF';
          ctx.beginPath();
          ctx.ellipse(obstacle.x - 10, obstacle.y + obstacle.height * 0.5, 15, 8, 0, 0, Math.PI * 2);
          ctx.ellipse(obstacle.x + obstacle.width + 10, obstacle.y + obstacle.height * 0.5, 15, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'spinningWheel':
          ctx.fillStyle = '#DC2626'; // Red spinning wheel
          ctx.beginPath();
          ctx.arc(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.width / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Spokes
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3;
          for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            ctx.beginPath();
            ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
            ctx.lineTo(
              obstacle.x + obstacle.width / 2 + Math.cos(angle) * obstacle.width / 2,
              obstacle.y + obstacle.height / 2 + Math.sin(angle) * obstacle.height / 2
            );
            ctx.stroke();
          }
          break;
      }
      
      ctx.restore();
    },
    [roundRect]
  );

  // Draw power-ups
  const drawPowerUp = useCallback((ctx: CanvasRenderingContext2D, powerUp: PowerUp) => {
    if (powerUp.collected) return;

    ctx.save();
    
    // Animated floating effect
    const floatOffset = Math.sin(powerUp.animationFrame) * 3;
    ctx.translate(0, floatOffset);

    // Glow effect
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    switch (powerUp.type) {
      case 'health':
        ctx.fillStyle = '#EF4444'; // Red heart
        ctx.beginPath();
        ctx.arc(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, powerUp.width / 2, 0, Math.PI * 2);
        ctx.fill();
        // Heart shape
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height * 0.3);
        ctx.quadraticCurveTo(powerUp.x + powerUp.width * 0.2, powerUp.y, powerUp.x + powerUp.width * 0.1, powerUp.y + powerUp.height * 0.4);
        ctx.quadraticCurveTo(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height * 0.8, powerUp.x + powerUp.width * 0.9, powerUp.y + powerUp.height * 0.4);
        ctx.quadraticCurveTo(powerUp.x + powerUp.width * 0.8, powerUp.y, powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height * 0.3);
        ctx.fill();
        break;
      case 'speed':
        ctx.fillStyle = '#3B82F6'; // Blue lightning
        roundRect(ctx, powerUp.x, powerUp.y, powerUp.width, powerUp.height, 3);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(powerUp.x + powerUp.width * 0.3, powerUp.y + powerUp.height * 0.2);
        ctx.lineTo(powerUp.x + powerUp.width * 0.7, powerUp.y + powerUp.height * 0.5);
        ctx.lineTo(powerUp.x + powerUp.width * 0.3, powerUp.y + powerUp.height * 0.8);
        ctx.fill();
        break;
      case 'shield':
        ctx.fillStyle = '#10B981'; // Green shield
        ctx.beginPath();
        ctx.arc(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, powerUp.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, powerUp.width / 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'doubleScore':
        ctx.fillStyle = '#F59E0B'; // Orange star
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
          const x = powerUp.x + powerUp.width / 2 + Math.cos(angle) * powerUp.width / 2;
          const y = powerUp.y + powerUp.height / 2 + Math.sin(angle) * powerUp.height / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        break;
      case 'magnet':
        ctx.fillStyle = '#8B5CF6'; // Purple magnet
        roundRect(ctx, powerUp.x, powerUp.y, powerUp.width, powerUp.height, 3);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(powerUp.x + powerUp.width * 0.2, powerUp.y + powerUp.height * 0.3, powerUp.width * 0.6, powerUp.height * 0.4);
        break;
    }
    
    ctx.restore();
  }, []);

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
      case 'tree':
        ctx.fillStyle = '#059669'; // Green tree
        ctx.beginPath();
        ctx.arc(element.x + element.width / 2, element.y + element.height * 0.3, element.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#78350F'; // Brown trunk
        roundRect(ctx, element.x + element.width * 0.4, element.y + element.height * 0.7, element.width * 0.2, element.height * 0.3, 2);
        ctx.fill();
        break;
      case 'cloud':
        ctx.fillStyle = '#FFFFFF'; // White cloud
        ctx.beginPath();
        ctx.arc(element.x + element.width * 0.3, element.y + element.height / 2, element.height / 2, 0, Math.PI * 2);
        ctx.arc(element.x + element.width * 0.7, element.y + element.height / 2, element.height / 2, 0, Math.PI * 2);
        ctx.arc(element.x + element.width / 2, element.y + element.height / 2, element.height / 2, 0, Math.PI * 2);
        ctx.fill();
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
      lane: 1,
      health: 3,
      isInvulnerable: false,
      invulnerabilityTime: 0,
      powerUpActive: false,
      powerUpType: null,
      powerUpEndTime: 0,
    });
    setObstacles([]);
    setPowerUps([]);
    setBackgroundElements([]);
    setMilestoneMessage(null);
    setComboSystem({
      count: 0,
      multiplier: 1,
      lastComboTime: 0,
      isActive: false,
    });
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
      if (gameState === 'playing') {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
          jump();
        } else if (e.code === 'ArrowLeft') {
          // Switch to left lane
          setPlayer(prevPlayer => ({
            ...prevPlayer,
            lane: Math.max(0, prevPlayer.lane - 1),
            x: 50 + Math.max(0, prevPlayer.lane - 1) * LANE_WIDTH,
          }));
        } else if (e.code === 'ArrowRight') {
          // Switch to right lane
          setPlayer(prevPlayer => ({
            ...prevPlayer,
            lane: Math.min(LANE_COUNT - 1, prevPlayer.lane + 1),
            x: 50 + Math.min(LANE_COUNT - 1, prevPlayer.lane + 1) * LANE_WIDTH,
          }));
        }
      } else if ((gameState === 'start' || gameState === 'gameOver') && e.code === 'Space') {
        initializeGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, initializeGame, jump]);

  // Handle power-up collection
  const handlePowerUpCollection = useCallback((powerUpType: PowerUp['type']) => {
    const currentTime = Date.now();
    
    switch (powerUpType) {
      case 'health':
        setPlayer(prevPlayer => ({
          ...prevPlayer,
          health: Math.min(prevPlayer.health + 1, 5), // Max 5 health
        }));
        break;
      case 'speed':
        setPlayer(prevPlayer => ({
          ...prevPlayer,
          powerUpActive: true,
          powerUpType: 'speed',
          powerUpEndTime: currentTime + 5000, // 5 seconds
        }));
        break;
      case 'shield':
        setPlayer(prevPlayer => ({
          ...prevPlayer,
          powerUpActive: true,
          powerUpType: 'shield',
          powerUpEndTime: currentTime + 3000, // 3 seconds
        }));
        break;
      case 'doubleScore':
        setComboSystem(prevCombo => ({
          count: prevCombo.count + 1,
          multiplier: Math.min(prevCombo.multiplier + 0.5, 5), // Max 5x multiplier
          lastComboTime: currentTime,
          isActive: true,
        }));
        break;
      case 'magnet':
        setPlayer(prevPlayer => ({
          ...prevPlayer,
          powerUpActive: true,
          powerUpType: 'magnet',
          powerUpEndTime: currentTime + 4000, // 4 seconds
        }));
        break;
    }
  }, []);

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
        const newFrame = (prevPlayer.frame + deltaTime * 0.1) % (Math.PI * 2); // For simple animation

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

      // Update combo system
      const currentTime = Date.now();
      setComboSystem(prevCombo => {
        if (currentTime - prevCombo.lastComboTime > MAX_COMBO_TIME) {
          return { ...prevCombo, count: 0, multiplier: 1, isActive: false };
        }
        return prevCombo;
      });

      // Update score with combo multiplier
      setScore(prevScore => {
        const baseScoreIncrease = gameSpeed * deltaTime * 0.1;
        const comboMultiplier = comboSystem.isActive ? comboSystem.multiplier : 1;
        const newScore = prevScore + baseScoreIncrease * comboMultiplier;
        
        // Check for milestones
        if (Math.floor(newScore / MILESTONE_SCORE_INTERVAL) > Math.floor(prevScore / MILESTONE_SCORE_INTERVAL)) {
          setMilestoneMessage(`वाह! ${Math.floor(newScore / MILESTONE_SCORE_INTERVAL) * MILESTONE_SCORE_INTERVAL} अंक!`); // Wow! {score} points!
          setTimeout(() => setMilestoneMessage(null), 1500); // Clear message after a short time
        }
        return newScore;
      });

      // Move obstacles and update their movement patterns
      setObstacles(prevObstacles =>
        prevObstacles
          .map(obstacle => {
            let newX = obstacle.x - gameSpeed * deltaTime;
            let newY = obstacle.y;
            let newMoveTime = obstacle.moveTime + deltaTime;

            // Apply movement patterns for moving obstacles
            if (obstacle.isMoving) {
              switch (obstacle.movePattern) {
                case 'zigzag':
                  newY = obstacle.y + Math.sin(newMoveTime * 0.01) * obstacle.moveSpeed * 10;
                  break;
                case 'circle':
                  const radius = 20;
                  newX += Math.cos(newMoveTime * 0.01) * radius * 0.1;
                  newY += Math.sin(newMoveTime * 0.01) * radius * 0.1;
                  break;
                case 'straight':
                  // Flying enemies move in a straight line
                  break;
              }
            }

            return {
              ...obstacle,
              x: newX,
              y: newY,
              moveTime: newMoveTime,
            };
          })
          .filter(obstacle => obstacle.x + obstacle.width > 0)
      );

      // Move power-ups
      setPowerUps(prevPowerUps =>
        prevPowerUps
          .map(powerUp => ({
            ...powerUp,
            x: powerUp.x - gameSpeed * deltaTime,
            animationFrame: powerUp.animationFrame + deltaTime * 0.1,
          }))
          .filter(powerUp => powerUp.x + powerUp.width > 0)
      );

      // Generate new obstacles
      if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < GAME_WIDTH - Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP) - OBSTACLE_MIN_GAP) {
        const obstacleTypes: Obstacle['type'][] = ['rock', 'basket', 'yak', 'bird', 'flyingYak', 'spinningWheel'];
        const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        const randomLane = Math.floor(Math.random() * LANE_COUNT);
        const laneX = 50 + randomLane * LANE_WIDTH;
        
        let newWidth: number, newHeight: number, newY: number;
        let isMoving = false;
        let movePattern: 'straight' | 'zigzag' | 'circle' = 'straight';
        let moveSpeed = 0;
        
        switch (randomType) {
          case 'yak':
            newWidth = 60;
            newHeight = 40;
            newY = GAME_HEIGHT - GROUND_HEIGHT - newHeight;
            break;
          case 'basket':
            newWidth = 30;
            newHeight = 35;
            newY = GAME_HEIGHT - GROUND_HEIGHT - newHeight;
            break;
          case 'rock':
            newWidth = 25;
            newHeight = 25;
            newY = GAME_HEIGHT - GROUND_HEIGHT - newHeight;
            break;
          case 'bird':
            newWidth = 35;
            newHeight = 20;
            newY = GAME_HEIGHT - GROUND_HEIGHT - 100;
            isMoving = true;
            movePattern = 'zigzag';
            moveSpeed = 2;
            break;
          case 'flyingYak':
            newWidth = 50;
            newHeight = 30;
            newY = GAME_HEIGHT - GROUND_HEIGHT - 80;
            isMoving = true;
            movePattern = 'straight';
            moveSpeed = 1.5;
            break;
          case 'spinningWheel':
            newWidth = 40;
            newHeight = 40;
            newY = GAME_HEIGHT - GROUND_HEIGHT - newHeight;
            isMoving = true;
            movePattern = 'circle';
            moveSpeed = 3;
            break;
        }

        setObstacles(prevObstacles => [
          ...prevObstacles,
          {
            x: laneX + Math.random() * 50,
            y: newY,
            width: newWidth,
            height: newHeight,
            type: randomType,
            lane: randomLane,
            health: randomType === 'spinningWheel' ? 2 : 1,
            isMoving,
            movePattern,
            moveSpeed,
            moveTime: 0,
          },
        ]);
      }

      // Generate power-ups
      if (Math.random() < POWERUP_SPAWN_CHANCE) {
        const powerUpTypes: PowerUp['type'][] = ['health', 'speed', 'shield', 'doubleScore', 'magnet'];
        const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        const randomLane = Math.floor(Math.random() * LANE_COUNT);
        const laneX = 50 + randomLane * LANE_WIDTH;

        setPowerUps(prevPowerUps => [
          ...prevPowerUps,
          {
            x: laneX + Math.random() * 100,
            y: GAME_HEIGHT - GROUND_HEIGHT - 60,
            width: 25,
            height: 25,
            type: randomType,
            lane: randomLane,
            collected: false,
            animationFrame: 0,
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
        const bgTypes: BackgroundElement['type'][] = ['hill', 'house', 'stupa', 'flag', 'tree', 'cloud'];
        const randomType = bgTypes[Math.floor(Math.random() * bgTypes.length)];
        const randomLane = Math.floor(Math.random() * LANE_COUNT);
        const laneX = 50 + randomLane * LANE_WIDTH;
        
        let newWidth: number, newHeight: number, newY: number;
        switch (randomType) {
          case 'hill':
            newWidth = 150;
            newHeight = 70;
            newY = GAME_HEIGHT - GROUND_HEIGHT - newHeight + 20;
            break;
          case 'house':
            newWidth = 80;
            newHeight = 60;
            newY = GAME_HEIGHT - GROUND_HEIGHT - newHeight + 10;
            break;
          case 'stupa':
            newWidth = 70;
            newHeight = 90;
            newY = GAME_HEIGHT - GROUND_HEIGHT - newHeight + 5;
            break;
          case 'flag':
            newWidth = 20;
            newHeight = 30;
            newY = GAME_HEIGHT - GROUND_HEIGHT - newHeight - 20;
            break;
          case 'tree':
            newWidth = 40;
            newHeight = 60;
            newY = GAME_HEIGHT - GROUND_HEIGHT - newHeight + 5;
            break;
          case 'cloud':
            newWidth = 60;
            newHeight = 30;
            newY = 50 + Math.random() * 100;
            break;
        }

        setBackgroundElements(prevElements => [
          ...prevElements,
          {
            x: laneX + Math.random() * 100,
            y: newY,
            width: newWidth,
            height: newHeight,
            type: randomType,
            lane: randomLane,
          },
        ]);
      }

      // Increase game speed over time
      setGameSpeed(prevSpeed => prevSpeed + (OBSTACLE_MIN_SPEED_INCREASE + Math.random() * OBSTACLE_MAX_SPEED_INCREASE) * deltaTime * 0.0001);

      // Power-up collection detection
      setPowerUps(prevPowerUps =>
        prevPowerUps.map(powerUp => {
          if (powerUp.collected) return powerUp;

          const playerRect = {
            x: player.x,
            y: player.y,
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
          };

          const powerUpRect = {
            x: powerUp.x,
            y: powerUp.y,
            width: powerUp.width,
            height: powerUp.height,
          };

          if (
            playerRect.x < powerUpRect.x + powerUpRect.width &&
            playerRect.x + playerRect.width > powerUpRect.x &&
            playerRect.y < powerUpRect.y + powerUpRect.height &&
            playerRect.y + playerRect.height > powerUpRect.y
          ) {
            // Power-up collected!
            handlePowerUpCollection(powerUp.type);
            return { ...powerUp, collected: true };
          }

          return powerUp;
        })
      );

      // Collision detection with obstacles
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
          // Collision detected!
          if (player.powerUpActive && player.powerUpType === 'shield') {
            // Shield protects from damage
            setPlayer(prevPlayer => ({
              ...prevPlayer,
              powerUpActive: false,
              powerUpType: null,
              powerUpEndTime: 0,
            }));
            // Remove the obstacle
            setObstacles(prevObstacles => prevObstacles.filter(o => o !== obstacle));
          } else if (player.isInvulnerable) {
            // Player is temporarily invulnerable
            continue;
          } else {
            // Take damage
            setPlayer(prevPlayer => {
              const newHealth = prevPlayer.health - 1;
              if (newHealth <= 0) {
                // Game Over
                setGameState('gameOver');
                if (score > highScore) {
                  setHighScore(Math.floor(score));
                }
                return prevPlayer;
              }
              return {
                ...prevPlayer,
                health: newHealth,
                isInvulnerable: true,
                invulnerabilityTime: Date.now() + 2000, // 2 seconds of invulnerability
              };
            });
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

      // Draw lane dividers
      ctx.strokeStyle = '#22C55E';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      for (let i = 1; i < LANE_COUNT; i++) {
        const x = 50 + i * LANE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(x, GAME_HEIGHT - GROUND_HEIGHT);
        ctx.lineTo(x, GAME_HEIGHT);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Draw power-ups
      powerUps.forEach(powerUp => drawPowerUp(ctx, powerUp));

      // Draw obstacles
      obstacles.forEach(obstacle => drawObstacle(ctx, obstacle));

      // Draw player with invulnerability effect
      if (player.isInvulnerable) {
        ctx.save();
        ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
      }
      drawPlayer(ctx, player);
      if (player.isInvulnerable) {
        ctx.restore();
      }
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

  useAwardGameCoins(gameState === 'gameOver');

  if (!started) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 600 }}>
        <button
          onClick={() => setStarted(true)}
          style={{ padding: '16px 40px', fontSize: 24, borderRadius: 8, background: '#00ff00', color: '#222', border: 'none', cursor: 'pointer', marginBottom: 24 }}
        >
          Click to Start
        </button>
        <div style={{ color: '#fff', fontSize: 16 }}>Run, jump, and dodge obstacles in a vibrant Nepali landscape! Use Space or Up Arrow to jump. Avoid obstacles and score high!</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-300 to-indigo-500 font-inter p-4">
              <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">Nepali Runner</h1>

      <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-purple-700 flex flex-col items-center p-2 md:p-4 lg:p-6" style={{ width: GAME_WIDTH, aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}` }}>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="bg-sky-200 rounded-lg border-2 border-gray-300"
        ></canvas>

        {/* Game UI Overlay */}
        <div className="absolute top-4 left-4 text-purple-800 font-bold text-xl drop-shadow">
          Score: {Math.floor(score)}
        </div>
        <div className="absolute top-4 right-4 text-purple-800 font-bold text-xl drop-shadow">
          High Score: {highScore}
        </div>
        <div className="absolute top-12 left-4 text-purple-800 font-bold text-lg drop-shadow">
          Health: {'❤️'.repeat(player.health)}
        </div>
        <div className="absolute top-12 right-4 text-purple-800 font-bold text-lg drop-shadow">
          Lane: {player.lane + 1}
        </div>
        {comboSystem.isActive && (
          <div className="absolute top-20 left-4 text-orange-600 font-bold text-lg drop-shadow animate-pulse">
            Combo: {comboSystem.count}x{comboSystem.multiplier.toFixed(1)}
          </div>
        )}
        {player.powerUpActive && (
          <div className="absolute top-20 right-4 text-blue-600 font-bold text-lg drop-shadow animate-pulse">
            Power-Up: {player.powerUpType}
          </div>
        )}

        {/* Milestone Message */}
        {milestoneMessage && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full shadow-lg text-2xl font-extrabold animate-bounce z-10">
            {milestoneMessage}
          </div>
        )}

        {/* Start/Game Over Screens */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-white text-5xl font-extrabold mb-4 animate-pulse">Ready?</h2>
            <p className="text-white text-xl mb-8">Press Space to Start!</p>
            <button
              onClick={initializeGame}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-red-500 text-6xl font-extrabold mb-4 animate-shake">Game Over!</h2>
            <p className="text-white text-2xl mb-2">Score: {Math.floor(score)}</p>
            <p className="text-white text-2xl mb-8">High Score: {highScore}</p>
            <p className="text-white text-xl mb-4">Press Space to Play Again!</p>
            <button
              onClick={initializeGame}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-white">
        <p className="text-lg">Instructions:</p>
        <p className="text-md">Press <strong className="text-yellow-300">Spacebar</strong> or <strong className="text-yellow-300">Up Arrow</strong> to jump.</p>
        <p className="text-md">Press <strong className="text-yellow-300">Left Arrow</strong> or <strong className="text-yellow-300">Right Arrow</strong> to change lanes.</p>
        <p className="text-md">Collect power-ups and avoid obstacles!</p>
        <p className="text-md">Build combos to earn more points!</p>
      </div>
    </div>
  );
};

export default Runner;
