import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAwardGameCoins } from './coinAwarder';

const GAME_WIDTH = 900;
const GAME_HEIGHT = 500;
const FIELD_MARGIN = 40;
const PLAYER_RADIUS = 18;
const BALL_RADIUS = 12;
const GOAL_WIDTH = 120;
const GOAL_HEIGHT = 80;
const PLAYER_SPEED = 2.5;
const PLAYER_ACCELERATION = 0.8;
const PLAYER_FRICTION = 0.85;
const BALL_FRICTION = 0.95;
const BALL_AIR_RESISTANCE = 0.98;
const GRAVITY = 0; // Removed gravity
const KICK_STRENGTH = 8;
const MATCH_TIME = 90; // seconds

// Enhanced types with physics
interface Vec2 { 
  x: number; 
  y: number; 
}

interface PhysicsBody {
  pos: Vec2;
  vel: Vec2;
  acc: Vec2;
}

interface Player extends PhysicsBody {
  id: string;
  team: 'player' | 'ai';
  role: 'goalkeeper' | 'defender' | 'midfielder' | 'forward';
  isSelected: boolean;
  hasMoved: boolean;
  hasShot: boolean;
  targetPos: Vec2 | null;
  maxSpeed: number;
  stamina: number;
}

interface GameState {
  phase: 'select' | 'move' | 'goal' | 'end';
  currentTurn: 'player' | 'ai';
  selectedPlayer: Player | null;
  dragStart: Vec2 | null;
  dragEnd: Vec2 | null;
  ballMoving: boolean;
  turnCount: number;
}

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
const distance = (a: Vec2, b: Vec2) => Math.hypot(a.x - b.x, a.y - b.y);
const normalize = (v: Vec2) => {
  const mag = Math.hypot(v.x, v.y);
  return mag > 0 ? { x: v.x / mag, y: v.y / mag } : { x: 0, y: 0 };
};

const Football: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [ball, setBall] = useState<PhysicsBody>({ 
    pos: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 }, 
    vel: { x: 0, y: 0 },
    acc: { x: 0, y: 0 }
  });
  const [score, setScore] = useState<{ player: number; ai: number }>({ player: 0, ai: 0 });
  const [timer, setTimer] = useState(MATCH_TIME);
  const [gameState, setGameState] = useState<GameState>({
    phase: 'select',
    currentTurn: 'player',
    selectedPlayer: null,
    dragStart: null,
    dragEnd: null,
    ballMoving: false,
    turnCount: 0
  });
  const [selectedMode, setSelectedMode] = useState<{ name: string; duration: number; aiDifficulty: number } | null>(null);
  const [playerStats, setPlayerStats] = useState<{ goals: number; shots: number; passes: number }>({ goals: 0, shots: 0, passes: 0 });
  const [aiStats, setAiStats] = useState<{ goals: number; shots: number; passes: number }>({ goals: 0, shots: 0, passes: 0 });
  
  const keys = useRef<{ [k: string]: boolean }>({});
  const lastTime = useRef<number>(0);
  const goalTimeout = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [started, setStarted] = useState(false);

  // Game modes
  const gameModes = [
    {
      name: 'Quick Match',
      duration: 60,
      aiDifficulty: 0.8
    },
    {
      name: 'Classic Match',
      duration: 90,
      aiDifficulty: 1.0
    },
    {
      name: 'Championship',
      duration: 120,
      aiDifficulty: 1.3
    }
  ];

  // Initialize players with physics - 2 players per team
  const initializePlayers = () => {
    const newPlayers: Player[] = [];
    
    // Player team (left side) - 2 players
    newPlayers.push({ 
      id: 'p1', 
      pos: { x: FIELD_MARGIN + 30, y: GAME_HEIGHT / 2 }, 
      vel: { x: 0, y: 0 },
      acc: { x: 0, y: 0 },
      team: 'player', 
      role: 'goalkeeper', 
      isSelected: false, 
      hasMoved: false, 
      hasShot: false,
      targetPos: null,
      maxSpeed: PLAYER_SPEED * 1.2, // Player goalkeeper faster
      stamina: 100
    });
    newPlayers.push({ 
      id: 'p2', 
      pos: { x: GAME_WIDTH / 3, y: GAME_HEIGHT / 2 }, 
      vel: { x: 0, y: 0 },
      acc: { x: 0, y: 0 },
      team: 'player', 
      role: 'forward', 
      isSelected: false, 
      hasMoved: false, 
      hasShot: false,
      targetPos: null,
      maxSpeed: PLAYER_SPEED * 1.5, // Player forward fastest
      stamina: 100
    });
    
    // AI team (right side) - 2 players
    newPlayers.push({ 
      id: 'a1', 
      pos: { x: GAME_WIDTH - FIELD_MARGIN - 30, y: GAME_HEIGHT / 2 }, 
      vel: { x: 0, y: 0 },
      acc: { x: 0, y: 0 },
      team: 'ai', 
      role: 'goalkeeper', 
      isSelected: false, 
      hasMoved: false, 
      hasShot: false,
      targetPos: null,
      maxSpeed: PLAYER_SPEED * 0.6, // AI goalkeeper slower
      stamina: 100
    });
    newPlayers.push({ 
      id: 'a2', 
      pos: { x: (2 * GAME_WIDTH) / 3, y: GAME_HEIGHT / 2 }, 
      vel: { x: 0, y: 0 },
      acc: { x: 0, y: 0 },
      team: 'ai', 
      role: 'forward', 
      isSelected: false, 
      hasMoved: false, 
      hasShot: false,
      targetPos: null,
      maxSpeed: PLAYER_SPEED * 0.9, // AI forward slower
      stamina: 100
    });
    
    setPlayers(newPlayers);
  };

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
    if (gameState.phase === 'end') return;
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
  }, [gameState, players, ball, timer, score]);

  // Timer
  useEffect(() => {
    if (gameState.phase !== 'select' && gameState.phase !== 'move') return;
    if (timer <= 0) {
      setGameState(prev => ({ ...prev, phase: 'end' }));
      return;
    }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [gameState.phase, timer]);

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

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState.currentTurn !== 'player' || gameState.phase === 'goal') return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on a player
    const clickedPlayer = players.find(p => 
      p.team === 'player' && 
      !p.hasMoved && 
      distance({ x, y }, p.pos) < PLAYER_RADIUS
    );
    
    if (clickedPlayer) {
      setGameState(prev => ({
        ...prev,
        phase: 'move',
        selectedPlayer: clickedPlayer,
        dragStart: { x, y }
      }));
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState.phase !== 'move' || !gameState.selectedPlayer) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setGameState(prev => ({
      ...prev,
      dragEnd: { x, y }
    }));
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState.phase !== 'move' || !gameState.selectedPlayer || !gameState.dragStart || !gameState.dragEnd) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate movement
    const dragDistance = distance(gameState.dragStart, { x, y });
    if (dragDistance > 10) {
      // Apply physics-based movement to player
      const angle = Math.atan2(y - gameState.dragStart.y, x - gameState.dragStart.x);
      const moveDistance = Math.min(dragDistance, 60); // Max movement distance
      
      const targetPos = {
        x: gameState.selectedPlayer.pos.x + Math.cos(angle) * moveDistance,
        y: gameState.selectedPlayer.pos.y + Math.sin(angle) * moveDistance
      };
      
      // Clamp to field
      targetPos.x = clamp(targetPos.x, FIELD_MARGIN + PLAYER_RADIUS, GAME_WIDTH - FIELD_MARGIN - PLAYER_RADIUS);
      targetPos.y = clamp(targetPos.y, FIELD_MARGIN + PLAYER_RADIUS, GAME_HEIGHT - FIELD_MARGIN - PLAYER_RADIUS);
      
              // Apply acceleration towards target
        const direction = normalize({
          x: targetPos.x - gameState.selectedPlayer.pos.x,
          y: targetPos.y - gameState.selectedPlayer.pos.y
        });
        
        setPlayers(prev => prev.map(p => 
          p.id === gameState.selectedPlayer!.id 
            ? { 
                ...p, 
                acc: { 
                  x: direction.x * PLAYER_ACCELERATION * 3, // Tripled player acceleration
                  y: direction.y * PLAYER_ACCELERATION * 3 
                },
                hasMoved: true, 
                isSelected: false 
              }
            : p
        ));
      
      // Immediately shoot the ball after moving
      const shotDistance = distance(targetPos, { x, y });
      const shotAngle = Math.atan2(y - targetPos.y, x - targetPos.x);
      const power = Math.min(shotDistance / 2, KICK_STRENGTH * 2); // Doubled player shooting power
      
      console.log(`Player shooting with power: ${power}`); // Debug log
      
      // Set ball velocity (opposite to drag direction - like pulling back a slingshot)
      setBall(prev => ({
        ...prev,
        vel: {
          x: -Math.cos(shotAngle) * power, // Opposite direction
          y: -Math.sin(shotAngle) * power  // Opposite direction
        }
      }));
      
      setGameState(prev => ({
        ...prev,
        phase: 'select',
        selectedPlayer: null,
        ballMoving: true
      }));
      
      setPlayerStats(prev => ({ ...prev, shots: prev.shots + 1 }));
      
      // Don't end turn automatically - let the ball physics handle it
    } else {
      // Just select player
      setGameState(prev => ({
        ...prev,
        phase: 'select',
        selectedPlayer: null,
        dragStart: null,
        dragEnd: null
      }));
    }
  };

  // Shoot ball - this is now only used for AI
  const handleShoot = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // This function is no longer used for player shooting
    // Player shooting is now handled in handleMouseUp
  };

  // Improved AI turn with better movement and shooting
  const aiTurn = () => {
    console.log('AI turn starting'); // Debug log
    const aiPlayers = players.filter(p => p.team === 'ai' && !p.hasMoved);
    if (aiPlayers.length === 0) return;
    
    // Select best AI player based on situation
    const selectedAI = selectBestAIPlayer(aiPlayers);
    
    // Set target position for physics-based movement
    const targetPos = calculateAIMove(selectedAI);
    
    setPlayers(prev => prev.map(p => 
      p.id === selectedAI.id 
        ? { ...p, targetPos: targetPos }
        : p
    ));
    
    // Wait for AI to reach target, then shoot
    const checkMovementComplete = () => {
      const currentPlayer = players.find(p => p.id === selectedAI.id);
      if (currentPlayer && currentPlayer.targetPos) {
        const distToTarget = distance(currentPlayer.pos, currentPlayer.targetPos);
        if (distToTarget > 8) { // Increased tolerance for reaching target
          // Still moving, check again
          setTimeout(checkMovementComplete, 50); // Faster checking
        } else {
          // Reached target, shoot
          console.log('AI shooting'); // Debug log
          const shotTarget = calculateAIShotTarget(selectedAI);
          const angle = Math.atan2(shotTarget.y - currentPlayer.pos.y, shotTarget.x - currentPlayer.pos.x);
          const basePower = KICK_STRENGTH * 1.8; // Reduced AI shooting power
          const difficultyMultiplier = selectedMode?.aiDifficulty || 1.0;
          const power = basePower * difficultyMultiplier;
          
          setBall(prev => ({
            ...prev,
            vel: {
              x: Math.cos(angle) * power, // AI shoots directly towards target
              y: Math.sin(angle) * power  // AI shoots directly towards target
            }
          }));
          
          setGameState(prev => ({ ...prev, ballMoving: true })); // Set ball moving state
          
          setAiStats(prev => ({ ...prev, shots: prev.shots + 1 }));
          
          // Mark player as moved
          setPlayers(prev => prev.map(p => 
            p.id === selectedAI.id 
              ? { ...p, hasMoved: true, targetPos: null }
              : p
          ));
          
          // Force turn change after AI completes their action
          setTimeout(() => {
            console.log('AI turn completed, forcing turn change to player'); // Debug log
            forceTurnChange();
          }, 1500); // Reduced wait time
        }
      } else {
        // Fallback: shoot immediately if player not found
        console.log('AI fallback shooting');
        const shotTarget = calculateAIShotTarget(selectedAI);
        const angle = Math.atan2(shotTarget.y - selectedAI.pos.y, shotTarget.x - selectedAI.pos.x);
        const power = KICK_STRENGTH * 1.8;
        
        setBall(prev => ({
          ...prev,
          vel: {
            x: Math.cos(angle) * power,
            y: Math.sin(angle) * power
          }
        }));
        
        setGameState(prev => ({ ...prev, ballMoving: true }));
        setAiStats(prev => ({ ...prev, shots: prev.shots + 1 }));
        
        setPlayers(prev => prev.map(p => 
          p.id === selectedAI.id 
            ? { ...p, hasMoved: true, targetPos: null }
            : p
        ));
        
        setTimeout(() => {
          forceTurnChange();
        }, 1500);
      }
    };
    
    // Start checking movement completion
    setTimeout(checkMovementComplete, 100);
  };

  // Force turn change (used when AI completes their turn)
  const forceTurnChange = () => {
    console.log(`Force turn change. Current: ${gameState.currentTurn}`); // Debug log
    
    setGameState(prev => ({
      ...prev,
      currentTurn: 'player',
      turnCount: prev.turnCount + 1,
      ballMoving: false
    }));
    
    // Reset player states for new turn
    setPlayers(prev => prev.map(p => ({
      ...p,
      hasMoved: false,
      hasShot: false,
      isSelected: false
    })));
    
    console.log('Turn changed to player'); // Debug log
  };

  // End turn (used for player turns)
  const endTurn = () => {
    const newTurn = gameState.currentTurn === 'player' ? 'ai' : 'player';
    
    console.log(`Ending turn. Current: ${gameState.currentTurn}, New: ${newTurn}`); // Debug log
    
    setGameState(prev => ({
      ...prev,
      currentTurn: newTurn,
      turnCount: prev.turnCount + 1,
      ballMoving: false
    }));
    
    // Reset player states for new turn
    setPlayers(prev => prev.map(p => ({
      ...p,
      hasMoved: false,
      hasShot: false,
      isSelected: false
    })));
    
    // If it's now AI's turn, start AI turn
    if (newTurn === 'ai') {
      setTimeout(() => {
        aiTurn();
      }, 500);
    }
  };

  // Improved AI player selection for 2-player teams
  const selectBestAIPlayer = (aiPlayers: Player[]): Player => {
    const ballPos = ball.pos;
    const playerGoal = { x: FIELD_MARGIN + GOAL_WIDTH / 2, y: GAME_HEIGHT / 2 };
    const aiGoal = { x: GAME_WIDTH - FIELD_MARGIN - GOAL_WIDTH / 2, y: GAME_HEIGHT / 2 };
    
    // Prioritize players based on role, position, and game situation
    const playerScores = aiPlayers.map(player => {
      let score = 0;
      const distToBall = distance(player.pos, ballPos);
      const distToPlayerGoal = distance(player.pos, playerGoal);
      const distToAiGoal = distance(player.pos, aiGoal);
      
      // Base score based on distance to ball
      score += 200 - distToBall;
      
      switch (player.role) {
        case 'forward':
          // Forward gets bonus for being near ball and in attacking position
          score += 150;
          if (ballPos.x > GAME_WIDTH / 2) score += 100; // Ball in attacking half
          if (player.pos.x > GAME_WIDTH / 2) score += 80; // Player in attacking position
          break;
        case 'goalkeeper':
          // Goalkeeper can shoot if ball is close to them or goal
          score += 50;
          if (distToPlayerGoal < 100) score += 200; // Ball very close to goal
          if (distToBall < 80) score += 150; // Ball close to goalkeeper
          break;
      }
      
      // Bonus for being in the right position for the role
      if (player.role === 'forward' && player.pos.x > GAME_WIDTH / 2) score += 50;
      if (player.role === 'goalkeeper' && player.pos.x > GAME_WIDTH * 0.7) score += 30;
      
      // Penalty for being too far from ball
      if (distToBall > 200) score -= 100;
      
      return { player, score };
    });
    
    playerScores.sort((a, b) => b.score - a.score);
    console.log('AI player selection scores:', playerScores.map(p => `${p.player.role}: ${p.score}`));
    return playerScores[0].player;
  };

  // Improved AI movement for 2-player teams
  const calculateAIMove = (aiPlayer: Player): Vec2 => {
    const ballPos = ball.pos;
    const currentPos = aiPlayer.pos;
    const playerGoal = { x: FIELD_MARGIN + GOAL_WIDTH / 2, y: GAME_HEIGHT / 2 };
    
    // Calculate strategic target position
    let targetPos: Vec2;
    
    if (aiPlayer.role === 'goalkeeper') {
      // Goalkeeper can move out to get the ball if it's close
      const distToBall = distance(aiPlayer.pos, ballPos);
      const goalY = GAME_HEIGHT / 2;
      const ballY = ballPos.y;
      
      if (distToBall < 100 && ballPos.x > GAME_WIDTH * 0.6) {
        // Ball is close and in goalkeeper's half, go for it
        targetPos = {
          x: ballPos.x - 15,
          y: ballPos.y + (Math.random() - 0.5) * 20
        };
      } else {
        // Stay near goal with smart positioning
        const targetY = ballY + (goalY - ballY) * 0.5;
        targetPos = {
          x: GAME_WIDTH - FIELD_MARGIN - 25,
          y: clamp(targetY, GAME_HEIGHT / 2 - 50, GAME_HEIGHT / 2 + 50)
        };
      }
    } else {
      // Forward is very aggressive and covers more ground
      if (ballPos.x > GAME_WIDTH / 2) {
        // Ball in attacking half, go for it aggressively
        targetPos = {
          x: ballPos.x - 25,
          y: ballPos.y + (Math.random() - 0.5) * 40
        };
      } else {
        // Ball in defensive half, position for counter-attack
        targetPos = {
          x: GAME_WIDTH / 2 + 20,
          y: ballPos.y + (Math.random() - 0.5) * 80
        };
      }
    }
    
    // Clamp to field boundaries
    targetPos.x = clamp(targetPos.x, FIELD_MARGIN + PLAYER_RADIUS, GAME_WIDTH - FIELD_MARGIN - PLAYER_RADIUS);
    targetPos.y = clamp(targetPos.y, FIELD_MARGIN + PLAYER_RADIUS, GAME_HEIGHT - FIELD_MARGIN - PLAYER_RADIUS);
    
    console.log(`AI ${aiPlayer.role} moving to:`, targetPos);
    return targetPos;
  };

  // Improved AI shot target calculation with better accuracy
  const calculateAIShotTarget = (aiPlayer: Player): Vec2 => {
    const playerGoal = { x: FIELD_MARGIN + GOAL_WIDTH / 2, y: GAME_HEIGHT / 2 };
    
    // Calculate distance to goal
    const distToGoal = distance(aiPlayer.pos, playerGoal);
    
    // Adjust accuracy based on distance and role
    let accuracy = 0.5; // Base accuracy (smaller = more accurate) - made worse
    
    if (aiPlayer.role === 'forward') accuracy = 0.4; // Forward is more accurate but still miss
    if (aiPlayer.role === 'goalkeeper') accuracy = 0.6; // Goalkeeper improved accuracy when shooting
    
    // Distance penalty
    if (distToGoal > 200) accuracy += 0.2;
    if (distToGoal > 300) accuracy += 0.3;
    
    // Add randomness based on accuracy
    const randomOffset = (Math.random() - 0.5) * GOAL_HEIGHT * accuracy;
    
    // Aim for different parts of the goal based on position
    let targetY = playerGoal.y;
    if (aiPlayer.pos.y < GAME_HEIGHT / 2) {
      // Player is above goal, aim lower
      targetY = playerGoal.y + 20;
    } else {
      // Player is below goal, aim higher
      targetY = playerGoal.y - 20;
    }
    
    const finalTarget = {
      x: playerGoal.x,
      y: clamp(targetY + randomOffset, GAME_HEIGHT / 2 - GOAL_HEIGHT / 2 + 10, GAME_HEIGHT / 2 + GOAL_HEIGHT / 2 - 10)
    };
    
    console.log(`AI ${aiPlayer.role} shooting at:`, finalTarget, `accuracy: ${accuracy}`);
    return finalTarget;
  };

  // Enhanced physics and movement system
  const updateGame = (dt: number) => {
    // Update player physics and movement
    setPlayers(prevPlayers => prevPlayers.map(player => {
      const updatedPlayer = { ...player };
      
      // Apply acceleration to velocity
      updatedPlayer.vel.x += updatedPlayer.acc.x * dt;
      updatedPlayer.vel.y += updatedPlayer.acc.y * dt;
      
      // Apply friction
      updatedPlayer.vel.x *= PLAYER_FRICTION;
      updatedPlayer.vel.y *= PLAYER_FRICTION;
      
      // Limit speed
      const speed = Math.hypot(updatedPlayer.vel.x, updatedPlayer.vel.y);
      if (speed > updatedPlayer.maxSpeed) {
        const scale = updatedPlayer.maxSpeed / speed;
        updatedPlayer.vel.x *= scale;
        updatedPlayer.vel.y *= scale;
      }
      
      // Update position
      updatedPlayer.pos.x += updatedPlayer.vel.x * dt;
      updatedPlayer.pos.y += updatedPlayer.vel.y * dt;
      
      // Clamp to field boundaries
      updatedPlayer.pos.x = clamp(updatedPlayer.pos.x, FIELD_MARGIN + PLAYER_RADIUS, GAME_WIDTH - FIELD_MARGIN - PLAYER_RADIUS);
      updatedPlayer.pos.y = clamp(updatedPlayer.pos.y, FIELD_MARGIN + PLAYER_RADIUS, GAME_HEIGHT - FIELD_MARGIN - PLAYER_RADIUS);
      
      // Reset acceleration
      updatedPlayer.acc.x = 0;
      updatedPlayer.acc.y = 0;
      
      // AI movement towards target with increased speed
      if (updatedPlayer.team === 'ai' && updatedPlayer.targetPos && !updatedPlayer.hasMoved) {
        const targetDir = normalize({
          x: updatedPlayer.targetPos.x - updatedPlayer.pos.x,
          y: updatedPlayer.targetPos.y - updatedPlayer.pos.y
        });
        
        const distToTarget = distance(updatedPlayer.pos, updatedPlayer.targetPos);
        if (distToTarget > 8) {
          // Reduced acceleration for slower AI movement
          updatedPlayer.acc.x = targetDir.x * PLAYER_ACCELERATION * 0.8;
          updatedPlayer.acc.y = targetDir.y * PLAYER_ACCELERATION * 0.8;
        } else {
          // Reached target, stop moving
          updatedPlayer.vel.x = 0;
          updatedPlayer.vel.y = 0;
          updatedPlayer.targetPos = null;
        }
      }
      
      return updatedPlayer;
    }));

    // Enhanced ball physics with gravity and air resistance
    const nextBall = { ...ball };
    
    // Apply gravity
    nextBall.acc.y += GRAVITY;
    
    // Apply acceleration to velocity
    nextBall.vel.x += nextBall.acc.x * dt;
    nextBall.vel.y += nextBall.acc.y * dt;
    
    // Apply air resistance
    nextBall.vel.x *= BALL_AIR_RESISTANCE;
    nextBall.vel.y *= BALL_AIR_RESISTANCE;
    
    // Apply ground friction when ball is on ground
    if (nextBall.pos.y >= GAME_HEIGHT - FIELD_MARGIN - BALL_RADIUS) {
      nextBall.vel.x *= BALL_FRICTION;
    }
    
    // Update position
    nextBall.pos.x += nextBall.vel.x * dt;
    nextBall.pos.y += nextBall.vel.y * dt;
    
    // Reset acceleration
    nextBall.acc.x = 0;
    nextBall.acc.y = 0;

    // Enhanced ball collision with field boundaries
    if (nextBall.pos.x < FIELD_MARGIN + BALL_RADIUS) {
      nextBall.pos.x = FIELD_MARGIN + BALL_RADIUS;
      nextBall.vel.x = Math.abs(nextBall.vel.x) * 0.8;
    }
    if (nextBall.pos.x > GAME_WIDTH - FIELD_MARGIN - BALL_RADIUS) {
      nextBall.pos.x = GAME_WIDTH - FIELD_MARGIN - BALL_RADIUS;
      nextBall.vel.x = -Math.abs(nextBall.vel.x) * 0.8;
    }
    if (nextBall.pos.y < FIELD_MARGIN + BALL_RADIUS) {
      nextBall.pos.y = FIELD_MARGIN + BALL_RADIUS;
      nextBall.vel.y = Math.abs(nextBall.vel.y) * 0.8;
    }
    if (nextBall.pos.y > GAME_HEIGHT - FIELD_MARGIN - BALL_RADIUS) {
      nextBall.pos.y = GAME_HEIGHT - FIELD_MARGIN - BALL_RADIUS;
      nextBall.vel.y = -Math.abs(nextBall.vel.y) * 0.8;
    }

    // Enhanced ball collision with players
    let ballHitPlayer = false;
    players.forEach(player => {
      const d = distance(nextBall.pos, player.pos);
      if (d < PLAYER_RADIUS + BALL_RADIUS) {
        ballHitPlayer = true;
        
        // Calculate collision normal
        const normal = normalize({
          x: nextBall.pos.x - player.pos.x,
          y: nextBall.pos.y - player.pos.y
        });
        
        // Push ball out
        nextBall.pos.x = player.pos.x + normal.x * (PLAYER_RADIUS + BALL_RADIUS + 1);
        nextBall.pos.y = player.pos.y + normal.y * (PLAYER_RADIUS + BALL_RADIUS + 1);
        
        // Calculate relative velocity
        const relativeVel = {
          x: nextBall.vel.x - player.vel.x,
          y: nextBall.vel.y - player.vel.y
        };
        
        // Calculate impulse
        const velocityAlongNormal = relativeVel.x * normal.x + relativeVel.y * normal.y;
        
        if (velocityAlongNormal < 0) {
          const restitution = 0.7; // Bounciness
          const impulse = -(1 + restitution) * velocityAlongNormal;
          
          // Apply impulse to ball
          nextBall.vel.x += normal.x * impulse;
          nextBall.vel.y += normal.y * impulse;
          
          // Add some randomness to make it more realistic
          nextBall.vel.x += (Math.random() - 0.5) * 2;
          nextBall.vel.y += (Math.random() - 0.5) * 2;
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
      setPlayerStats(prev => ({ ...prev, goals: prev.goals + 1 }));
      setGameState(prev => ({ ...prev, phase: 'goal' }));
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
      setAiStats(prev => ({ ...prev, goals: prev.goals + 1 }));
      setGameState(prev => ({ ...prev, phase: 'goal' }));
      resetPositions();
      return;
    }

    setBall(nextBall);
    
    // Check if ball has stopped moving and end turn (only for player turns)
    if (Math.abs(nextBall.vel.x) < 0.5 && Math.abs(nextBall.vel.y) < 0.5) {
      setGameState(prev => ({ ...prev, ballMoving: false }));
      
      // End turn only if ball has completely stopped, we were in ball moving state, and it's player's turn
      if (gameState.ballMoving && gameState.currentTurn === 'player') {
        console.log(`Ball stopped moving. Current turn: ${gameState.currentTurn}`); // Debug log
        setTimeout(() => {
          endTurn();
        }, 1000); // Wait 1 second after ball stops
      }
    }
  };

  // Reset after goal
  const resetPositions = () => {
    if (goalTimeout.current) clearTimeout(goalTimeout.current);
    goalTimeout.current = setTimeout(() => {
      initializePlayers();
      setBall({ pos: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 }, vel: { x: 0, y: 0 }, acc: { x: 0, y: 0 } });
      setGameState(prev => ({ 
        ...prev, 
        phase: 'select', 
        currentTurn: 'player',
        selectedPlayer: null,
        dragStart: null,
        dragEnd: null,
        ballMoving: false
      }));
    }, 2000);
  };

  // Enhanced drawing
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Enhanced field with grass pattern
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Grass pattern
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 1;
    for (let i = 0; i < GAME_WIDTH; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, GAME_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i < GAME_HEIGHT; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(GAME_WIDTH, i);
      ctx.stroke();
    }

    // Field markings
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
    
    // Center spot
    ctx.beginPath();
    ctx.arc(GAME_WIDTH / 2, GAME_HEIGHT / 2, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    
    // Goals
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(GAME_WIDTH - FIELD_MARGIN - 8, GAME_HEIGHT / 2 - GOAL_HEIGHT / 2, 8, GOAL_HEIGHT);
    ctx.fillRect(FIELD_MARGIN, GAME_HEIGHT / 2 - GOAL_HEIGHT / 2, 8, GOAL_HEIGHT);

    // Draw players
    players.forEach(player => {
      const isSelected = player.id === gameState.selectedPlayer?.id;
      const isCurrentTurn = player.team === gameState.currentTurn;
      const hasMoved = player.hasMoved;
      
      // Player circle with physics effects
      ctx.beginPath();
      ctx.arc(player.pos.x, player.pos.y, PLAYER_RADIUS, 0, Math.PI * 2);
      
      // Color based on team and state
      if (player.team === 'player') {
        ctx.fillStyle = isSelected ? '#fbbf24' : hasMoved ? '#6b7280' : '#2563eb';
      } else {
        ctx.fillStyle = hasMoved ? '#6b7280' : '#dc2626';
      }
      
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#fbbf24' : '#fff';
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.stroke();
      
      // Show movement trail for moving players
      const speed = Math.hypot(player.vel.x, player.vel.y);
      if (speed > 0.5) {
        ctx.beginPath();
        ctx.moveTo(player.pos.x, player.pos.y);
        ctx.lineTo(player.pos.x - player.vel.x * 3, player.pos.y - player.vel.y * 3);
        ctx.strokeStyle = player.team === 'player' ? '#2563eb' : '#dc2626';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // Show target position for AI players
      if (player.team === 'ai' && player.targetPos && !player.hasMoved) {
        ctx.beginPath();
        ctx.arc(player.targetPos.x, player.targetPos.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
      // Role indicator
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      const roleSymbol = player.role === 'goalkeeper' ? 'G' : 
                        player.role === 'defender' ? 'D' : 
                        player.role === 'midfielder' ? 'M' : 'F';
      ctx.fillText(roleSymbol, player.pos.x, player.pos.y + 4);
      
      // Selection indicator
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(player.pos.x, player.pos.y, PLAYER_RADIUS + 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Draw drag line
    if (gameState.dragStart && gameState.dragEnd && gameState.phase === 'move') {
      ctx.beginPath();
      ctx.moveTo(gameState.dragStart.x, gameState.dragStart.y);
      ctx.lineTo(gameState.dragEnd.x, gameState.dragEnd.y);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw shooting trajectory preview during drag
    if (gameState.phase === 'move' && gameState.selectedPlayer && gameState.dragEnd) {
      const mousePos = gameState.dragEnd;
      const playerPos = gameState.selectedPlayer.pos;
      const shotDistance = distance(playerPos, mousePos);
      const angle = Math.atan2(mousePos.y - playerPos.y, mousePos.x - playerPos.x);
      const power = Math.min(shotDistance / 2, KICK_STRENGTH);
      
      // Draw trajectory line (opposite direction)
      const endX = playerPos.x - Math.cos(angle) * power * 3;
      const endY = playerPos.y - Math.sin(angle) * power * 3;
      
      ctx.beginPath();
      ctx.moveTo(playerPos.x, playerPos.y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw power indicator
      ctx.fillStyle = '#ff4444';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Power: ${Math.round(power)}`, playerPos.x, playerPos.y - 30);
    }

    // Ball with shadow
    ctx.beginPath();
    ctx.arc(ball.pos.x + 2, ball.pos.y + 2, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(ball.pos.x, ball.pos.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Enhanced UI
    ctx.font = 'bold 32px Inter, Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(`${score.player}  :  ${score.ai}`, GAME_WIDTH / 2, 50);
    
    ctx.font = 'bold 24px Inter, Arial';
    ctx.fillText(`⏱ ${timer}s`, GAME_WIDTH / 2, 90);
    
    // Turn indicator
    ctx.font = 'bold 20px Inter, Arial';
    ctx.fillStyle = gameState.currentTurn === 'player' ? '#2563eb' : '#dc2626';
    ctx.fillText(`${gameState.currentTurn.toUpperCase()}'S TURN`, GAME_WIDTH / 2, 120);
    
    // Phase indicator
    ctx.font = '16px Inter, Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Phase: ${gameState.phase.toUpperCase()}`, GAME_WIDTH / 2, 140);
    
    // Instructions
    if (gameState.phase === 'select' && gameState.currentTurn === 'player') {
      ctx.font = '14px Inter, Arial';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('Click and drag a player to move and shoot', GAME_WIDTH / 2, 160);
    } else if (gameState.phase === 'move' && gameState.currentTurn === 'player') {
      ctx.font = '14px Inter, Arial';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('Drag opposite to desired trajectory, then release to shoot', GAME_WIDTH / 2, 160);
    }
    
    // Physics info
    const ballSpeed = Math.hypot(ball.vel.x, ball.vel.y);
    if (ballSpeed > 0.1) {
      ctx.font = '12px Inter, Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.fillText(`Ball Speed: ${Math.round(ballSpeed)}`, 10, GAME_HEIGHT - 30);
      ctx.fillText(`Ball Height: ${Math.round(GAME_HEIGHT - FIELD_MARGIN - ball.pos.y)}`, 10, GAME_HEIGHT - 15);
      ctx.textAlign = 'center';
    }
  }, [players, ball, score, timer, gameState]);

  // Start game
  const startGame = (mode: { name: string; duration: number; aiDifficulty: number }) => {
    setSelectedMode(mode);
    setScore({ player: 0, ai: 0 });
    setTimer(mode.duration);
    setPlayerStats({ goals: 0, shots: 0, passes: 0 });
    setAiStats({ goals: 0, shots: 0, passes: 0 });
    initializePlayers();
    setBall({ pos: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 }, vel: { x: 0, y: 0 }, acc: { x: 0, y: 0 } });
    setGameState({
      phase: 'select',
      currentTurn: 'player',
      selectedPlayer: null,
      dragStart: null,
      dragEnd: null,
      ballMoving: false,
      turnCount: 0
    });
  };

  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useAwardGameCoins(gameState.phase === 'end');

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-6">⚽</div>
          <h1 className="text-4xl font-bold text-white mb-4">Football Frenzy</h1>
          <p className="text-white/90 mb-8 text-lg">
            Turn-based football with 2 players per team! Click, drag, and shoot to score!
          </p>
          <button
            onClick={() => setStarted(true)}
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-4 rounded-full font-bold text-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6 text-center drop-shadow-lg">Football Frenzy</h1>
        
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
            className="bg-green-800 rounded-lg border-2 border-gray-300 cursor-pointer"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          ></canvas>
          
          {/* Game Mode Selection */}
          {gameState.phase === 'select' && !selectedMode && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-lg">
              <h2 className="text-white text-4xl font-bold mb-8">Select Game Mode</h2>
              <div className="grid grid-cols-1 gap-4 max-w-md">
                {gameModes.map((mode) => (
                  <button
                    key={mode.name}
                    onClick={() => startGame(mode)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-left"
                  >
                    <h3 className="text-xl font-bold mb-2">{mode.name}</h3>
                    <div className="text-sm opacity-90">
                      Duration: {mode.duration}s | AI Difficulty: {mode.aiDifficulty}x
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Goal Screen */}
          {gameState.phase === 'goal' && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center rounded-lg">
              <h2 className="text-yellow-400 text-6xl font-extrabold mb-4 animate-bounce">GOAL!</h2>
            </div>
          )}
          
          {/* Game Over Screen */}
          {gameState.phase === 'end' && (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center rounded-lg">
              <h2 className="text-red-500 text-6xl font-extrabold mb-4">Full Time!</h2>
              <p className="text-white text-2xl mb-2">Final Score: {score.player} : {score.ai}</p>
              <div className="text-white text-lg mb-6">
                <p>Player Stats: {playerStats.goals} goals, {playerStats.shots} shots</p>
                <p>AI Stats: {aiStats.goals} goals, {aiStats.shots} shots</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setGameState(prev => ({ ...prev, phase: 'select' }))}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                  New Game
                </button>
                <button
                  onClick={() => startGame(selectedMode!)}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Rematch
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Instructions */}
        <div className="text-center text-white/90 mt-8">
          <p className="text-lg font-semibold mb-2">How to Play:</p>
          <p className="text-sm">1. Click and drag a player to move and shoot in one action</p>
          <p className="text-sm">2. Drag opposite to desired trajectory, then release to shoot</p>
          <p className="text-sm">3. Take turns with the AI to score goals</p>
          <p className="text-sm">4. Each team has 2 players: G (Goalkeeper), F (Forward)</p>
          <p className="text-sm">5. Ball bounces off boundaries and players</p>
          <p className="text-sm mt-2">Fullscreen: <span className="text-yellow-300">F</span></p>
        </div>
      </div>
    </div>
  );
};

export default Football; 