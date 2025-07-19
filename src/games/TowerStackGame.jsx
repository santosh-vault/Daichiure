// @ts-nocheck
import React, { useRef, useEffect, useState } from 'react';
import { gameThumbnails } from '../constants/gameThumbnails';


const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BASE_BLOCK_WIDTH = 70;
const BASE_BLOCK_HEIGHT = 40;
const SWING_SPEED = 0.018; // Increased swinging speed
const DROP_SPEED = 5;
const ALIGNMENT_TOLERANCE = 30;
const MIN_BLOCK_WIDTH = 60;
const MAX_BLOCK_HEIGHT = 36;
const BALANCE_ANIMATION_FRAMES = 24;
const TOWER_FALL_FRAMES = 60; // Increased fall animation duration
const TOWER_SHAKE_SPEED = 0.08; // Speed of tower shaking
const TOWER_SHAKE_AMPLITUDE = 2; // Amplitude of tower shaking

/**
 * @typedef {Object} Block
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {boolean} [balancing]
 * @property {number} [balanceFrame]
 */

export const TowerStackGame = () => {
  const canvasRef = useRef(null);
  const infoRef = useRef(null);

  // UI state only
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showRestart, setShowRestart] = useState(false);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);

  // Animation/game state refs
  const blocksRef = useRef([]);
  const angleRef = useRef(0);
  const droppingRef = useRef(false);
  const droppedBlockRef = useRef(null);
  const gameOverRef = useRef(false);
  const scoreRef = useRef(0);
  const animationRef = useRef();
  const cameraOffsetRef = useRef(0);
  const towerFallFrameRef = useRef(0);
  const towerFallingRef = useRef(false);
  const towerShakeRef = useRef(0); // Tower shake animation

  // Helper: get block size for current stack
  function getBlockSize(stackIndex) {
    // As stack grows, width decreases, height increases
    const progress = Math.min(stackIndex / 15, 1); // up to 15 blocks for full effect
    const width = BASE_BLOCK_WIDTH - (BASE_BLOCK_WIDTH - MIN_BLOCK_WIDTH) * progress;
    const height = BASE_BLOCK_HEIGHT + (MAX_BLOCK_HEIGHT - BASE_BLOCK_HEIGHT) * progress;
    return { width, height };
  }

  // Helper: get game info for sharing
  const gameName = 'Tower Stack';
  const gameSlug = 'towerstack';
  const thumbnail = gameThumbnails[gameSlug];

  // Initialize game state
  const resetGame = () => {
    const { width, height } = getBlockSize(0);
    blocksRef.current = [
      {
        x: CANVAS_WIDTH / 2 - width / 2,
        y: CANVAS_HEIGHT - height,
        width,
        height,
        balancing: false,
        balanceFrame: 0,
      },
    ];
    angleRef.current = 0;
    droppingRef.current = false;
    droppedBlockRef.current = null;
    gameOverRef.current = false;
    scoreRef.current = 0;
    cameraOffsetRef.current = 0;
    towerShakeRef.current = 0;
    setScore(0);
    setGameOver(false);
    setShowRestart(false);
    if (infoRef.current) infoRef.current.innerHTML = '';
  };

  useEffect(() => {
    if (!started) return;
    if (paused) return;
    resetGame();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (!droppingRef.current && !gameOverRef.current) {
          dropBlock();
        }
      }
      if (e.key === 'p' || e.key === 'P') {
        setPaused((prev) => !prev);
      }
    };
    const handleClick = () => {
      if (!droppingRef.current && !gameOverRef.current) {
        dropBlock();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('click', handleClick);

    function draw() {
      // Camera: always keep at least 50% of canvas above top block
      const blocks = blocksRef.current;
      const topBlock = blocks[blocks.length - 1];
      const minY = topBlock.y;
      let cameraOffset = cameraOffsetRef.current;
      const desiredTop = CANVAS_HEIGHT * 0.5;
      if (minY < desiredTop) {
        cameraOffset = desiredTop - minY;
      } else {
        cameraOffset = 0;
      }
      cameraOffsetRef.current = cameraOffset;

      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#232946');
      gradient.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw score at top
      ctx.save();
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 8;
      ctx.fillText(`Score: ${scoreRef.current}`, CANVAS_WIDTH / 2, 36);
      ctx.restore();

      // Draw all blocks
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        let { x, y, width, height } = block;
        
        // Balancing animation
        let wobble = 0;
        if (block.balancing && block.balanceFrame < BALANCE_ANIMATION_FRAMES) {
          wobble = Math.sin((block.balanceFrame / BALANCE_ANIMATION_FRAMES) * Math.PI * 2) * 8 * (1 - block.balanceFrame / BALANCE_ANIMATION_FRAMES);
        }
        
        // Tower shake animation - makes the whole tower unstable
        let shakeX = 0;
        let shakeY = 0;
        if (!towerFallingRef.current && blocks.length > 1) {
          // Shake increases with tower height
          const shakeIntensity = Math.min(blocks.length / 10, 1) * TOWER_SHAKE_AMPLITUDE;
          shakeX = Math.sin(towerShakeRef.current + i * 0.5) * shakeIntensity;
          shakeY = Math.cos(towerShakeRef.current + i * 0.3) * shakeIntensity * 0.5;
        }
        
        // Tower fall animation
        let fallAngle = 0;
        let fallX = 0;
        let fallY = 0;
        if (towerFallingRef.current) {
          const progress = towerFallFrameRef.current / TOWER_FALL_FRAMES;
          // Each block falls with a delay for a cascading effect
          const blockDelay = i * 3; // Increased delay between blocks
          let localProgress = Math.max(0, progress - blockDelay / TOWER_FALL_FRAMES);
          if (localProgress > 0) {
            fallAngle = Math.min(localProgress * Math.PI * 1.5, Math.PI / 2); // More dramatic fall
            fallX = Math.sin(fallAngle) * 400 * localProgress; // More horizontal movement
            fallY = Math.pow(localProgress, 1.8) * 300; // More vertical movement
          }
        }
        
        ctx.save();
        ctx.shadowColor = '#222';
        ctx.shadowBlur = 10;
        ctx.translate(x + width / 2 + wobble + shakeX + fallX, y + height / 2 + cameraOffset + shakeY + fallY);
        ctx.rotate(wobble * 0.01 + fallAngle);
        ctx.fillStyle = '#00bcd4';
        ctx.fillRect(-width / 2, -height / 2, width, height);
        ctx.restore();
      }

      // Draw swinging block
      if (!droppingRef.current && !gameOverRef.current) {
        const stackIndex = blocks.length;
        const { width, height } = getBlockSize(stackIndex);
        const swingX = CANVAS_WIDTH / 2 + Math.sin(angleRef.current) * 120;
        const swingY = 50;
        // Rope - fixed position, no camera offset
        ctx.save();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2, 0);
        ctx.lineTo(swingX + width / 2, swingY);
        ctx.stroke();
        ctx.restore();
        // Shadow - fixed position, no camera offset
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.ellipse(swingX + width / 2, swingY + height + 10, width / 2, 8, 0, 0, 2 * Math.PI);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.restore();
        // Block - fixed position, no camera offset
        ctx.save();
        ctx.shadowColor = '#ffeb3b';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#ffeb3b';
        ctx.fillRect(swingX, swingY, width, height);
        ctx.restore();
      }

      // Draw dropping block
      if (droppingRef.current && droppedBlockRef.current) {
        const { width, height } = droppedBlockRef.current;
        ctx.save();
        ctx.shadowColor = '#ff9800';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#ff9800';
        ctx.fillRect(droppedBlockRef.current.x, droppedBlockRef.current.y + cameraOffset, width, height);
        ctx.restore();
      }
    }

    function gameLoop() {
      // Animate swing
      if (!droppingRef.current && !gameOverRef.current) {
        angleRef.current += SWING_SPEED;
      }
      
      // Animate tower shake
      if (!towerFallingRef.current && !gameOverRef.current) {
        towerShakeRef.current += TOWER_SHAKE_SPEED;
      }
      // Animate dropping block
      if (droppingRef.current && droppedBlockRef.current) {
        droppedBlockRef.current.y += DROP_SPEED;
        const blocks = blocksRef.current;
        const base = blocks[blocks.length - 1];
        if (droppedBlockRef.current.y + droppedBlockRef.current.height >= base.y) {
          // Alignment check
          const delta = Math.abs(droppedBlockRef.current.x - base.x);
          if (delta <= ALIGNMENT_TOLERANCE) {
            // Landed successfully, add with balancing
            const stackIndex = blocks.length;
            const { width, height } = getBlockSize(stackIndex);
            const newBlock = {
              x: droppedBlockRef.current.x,
              y: base.y - height,
              width,
              height,
              balancing: true,
              balanceFrame: 0,
            };
            blocksRef.current = [...blocks, newBlock];
            scoreRef.current += 1;
            setScore(scoreRef.current);
            droppingRef.current = false;
            droppedBlockRef.current = null;
          } else {
            // Game over
            gameOverRef.current = true;
            setGameOver(true);
            triggerTowerFall();
            droppingRef.current = false;
            droppedBlockRef.current = null;
            if (infoRef.current) infoRef.current.innerHTML = `<div style='color: red; font-size: 22px; margin-top: 10px;'>Game Over! Score: ${scoreRef.current}</div>`;
          }
        }
      }
      // Animate balancing (wobble) for the top block
      const blocks = blocksRef.current;
      if (blocks.length > 1) {
        const topBlock = blocks[blocks.length - 1];
        if (topBlock.balancing && topBlock.balanceFrame < BALANCE_ANIMATION_FRAMES) {
          topBlock.balanceFrame++;
          if (topBlock.balanceFrame >= BALANCE_ANIMATION_FRAMES) {
            topBlock.balancing = false;
          }
        }
      }
      // Tower fall animation - consistent duration regardless of score
      if (towerFallingRef.current) {
        towerFallFrameRef.current++;
        // Fixed duration for consistent fall animation
        const totalFallDuration = TOWER_FALL_FRAMES;
        
        if (towerFallFrameRef.current > totalFallDuration) {
          console.log('Tower fall animation completed');
          towerFallingRef.current = false;
          setShowRestart(true);
        }
      }
      draw();
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    animationRef.current = requestAnimationFrame(gameLoop);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('click', handleClick);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line
  }, [started, paused]);



  const dropBlock = () => {
    const blocks = blocksRef.current;
    const stackIndex = blocks.length;
    const { width, height } = getBlockSize(stackIndex);
    const swingX = CANVAS_WIDTH / 2 + Math.sin(angleRef.current) * 120;
    const swingY = 50;
    droppedBlockRef.current = {
      x: swingX,
      y: swingY,
      width,
      height,
    };
    droppingRef.current = true;
  };

  const triggerTowerFall = () => {
    console.log('Triggering tower fall animation');
    towerFallingRef.current = true;
    towerFallFrameRef.current = 0;
    setShowRestart(false);
  };

  const restart = () => {
    resetGame();
    towerFallingRef.current = false;
    towerFallFrameRef.current = 0;
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!started || paused || gameOverRef.current) return;
      if (e.key === 'Enter') {
        if (!droppingRef.current && !gameOverRef.current) {
          dropBlock();
        }
      }
      if (e.key === 'p' || e.key === 'P') {
        setPaused((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, paused]);

  // Facebook share
  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(`I scored ${score} in ${gameName}! Can you beat me?`);
    const image = encodeURIComponent(thumbnail);
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}&picture=${image}`;
    window.open(fbShareUrl, '_blank');
  };

  // UI Buttons
  const brandBtn = {
    background: '#00bcd4',
    color: '#222',
    border: 'none',
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: 18,
    padding: '10px 32px',
    margin: 8,
    cursor: 'pointer',
    boxShadow: '0 2px 8px #0004',
    transition: 'background 0.2s',
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {!started && (
        <button style={brandBtn} onClick={() => setStarted(true)}>
          Start
        </button>
      )}
      {started && !gameOver && (
        <>
          <button style={brandBtn} onClick={() => setPaused((p) => !p)}>
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button style={brandBtn} onClick={restart}>
            Restart
          </button>
        </>
      )}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          border: '2px solid #ffffff',
          backgroundColor: '#1a1a2e',
          display: 'block',
          margin: '0 auto',
          borderRadius: 12,
          boxShadow: '0 8px 32px #0008',
        }}
      />
      <div ref={infoRef} style={{ marginTop: 10 }}></div>
      {showRestart && (
        <>
          <button style={brandBtn} onClick={restart}>
            Restart Game
          </button>
          <button style={{ ...brandBtn, background: '#4267B2', color: '#fff' }} onClick={shareOnFacebook}>
            Share on Facebook
          </button>
        </>
      )}
      <div style={{ color: '#ffffff', marginTop: 10, fontSize: 15 }}>
        <p>Press <strong>Enter</strong> or <strong>Click</strong> to drop the block</p>
        <p>Stack as high as you can!</p>
      </div>
    </div>
  );
};

export default TowerStackGame;