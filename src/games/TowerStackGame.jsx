// @ts-nocheck
import React, { useRef, useEffect, useState } from 'react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BLOCK_WIDTH = 100;
const BLOCK_HEIGHT = 20;
const SWING_SPEED = 0.012;
const DROP_SPEED = 5;
const ALIGNMENT_TOLERANCE = 30;

/**
 * @typedef {Object} Block
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

export const TowerStackGame = () => {
  const canvasRef = useRef(null);
  const infoRef = useRef(null);

  // UI state only
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showRestart, setShowRestart] = useState(false);

  // Animation/game state refs
  const blocksRef = useRef([]);
  const angleRef = useRef(0);
  const droppingRef = useRef(false);
  const droppedBlockRef = useRef(null);
  const gameOverRef = useRef(false);
  const scoreRef = useRef(0);
  const animationRef = useRef();

  // Initialize game state
  const resetGame = () => {
    blocksRef.current = [
      {
        x: CANVAS_WIDTH / 2 - BLOCK_WIDTH / 2,
        y: CANVAS_HEIGHT - BLOCK_HEIGHT,
        width: BLOCK_WIDTH,
        height: BLOCK_HEIGHT,
      },
    ];
    angleRef.current = 0;
    droppingRef.current = false;
    droppedBlockRef.current = null;
    gameOverRef.current = false;
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
    setShowRestart(false);
    if (infoRef.current) infoRef.current.innerHTML = '';
  };

  useEffect(() => {
    resetGame();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const handleKeyDown = (e) => {
      if (e.key === ' ' && !droppingRef.current && !gameOverRef.current) {
        dropBlock();
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
      for (const block of blocksRef.current) {
        ctx.save();
        ctx.shadowColor = '#222';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#00bcd4';
        ctx.fillRect(block.x, block.y, block.width, block.height);
        ctx.restore();
      }

      // Draw swinging block
      if (!droppingRef.current && !gameOverRef.current) {
        const swingX = CANVAS_WIDTH / 2 + Math.sin(angleRef.current) * 120;
        const swingY = 50;
        // Rope
        ctx.save();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2, 0);
        ctx.lineTo(swingX + BLOCK_WIDTH / 2, swingY);
        ctx.stroke();
        ctx.restore();
        // Shadow
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.ellipse(swingX + BLOCK_WIDTH / 2, swingY + BLOCK_HEIGHT + 10, BLOCK_WIDTH / 2, 8, 0, 0, 2 * Math.PI);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.restore();
        // Block
        ctx.save();
        ctx.shadowColor = '#ffeb3b';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#ffeb3b';
        ctx.fillRect(swingX, swingY, BLOCK_WIDTH, BLOCK_HEIGHT);
        ctx.restore();
      }

      // Draw dropping block
      if (droppingRef.current && droppedBlockRef.current) {
        ctx.save();
        ctx.shadowColor = '#ff9800';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#ff9800';
        ctx.fillRect(droppedBlockRef.current.x, droppedBlockRef.current.y, BLOCK_WIDTH, BLOCK_HEIGHT);
        ctx.restore();
      }
    }

    function gameLoop() {
      // Animate swing
      if (!droppingRef.current && !gameOverRef.current) {
        angleRef.current += SWING_SPEED;
      }
      // Animate dropping block
      if (droppingRef.current && droppedBlockRef.current) {
        droppedBlockRef.current.y += DROP_SPEED;
        const base = blocksRef.current[blocksRef.current.length - 1];
        if (droppedBlockRef.current.y + BLOCK_HEIGHT >= base.y) {
          // Alignment check
          const delta = Math.abs(droppedBlockRef.current.x - base.x);
          if (delta <= ALIGNMENT_TOLERANCE) {
            // Landed successfully
            const newBlock = {
              x: droppedBlockRef.current.x,
              y: base.y - BLOCK_HEIGHT,
              width: BLOCK_WIDTH,
              height: BLOCK_HEIGHT,
            };
            blocksRef.current = [...blocksRef.current, newBlock];
            scoreRef.current += 1;
            setScore(scoreRef.current);
            droppingRef.current = false;
            droppedBlockRef.current = null;
          } else {
            // Game over
            gameOverRef.current = true;
            setGameOver(true);
            setShowRestart(true);
            droppingRef.current = false;
            droppedBlockRef.current = null;
            if (infoRef.current) infoRef.current.innerHTML = `<div style='color: red; font-size: 22px; margin-top: 10px;'>Game Over! Score: ${scoreRef.current}</div>`;
          }
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
  }, []);

  const dropBlock = () => {
    const swingX = CANVAS_WIDTH / 2 + Math.sin(angleRef.current) * 120;
    const swingY = 50;
    droppedBlockRef.current = {
      x: swingX,
      y: swingY,
      width: BLOCK_WIDTH,
      height: BLOCK_HEIGHT,
    };
    droppingRef.current = true;
  };

  const restart = () => {
    resetGame();
  };

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
          borderRadius: 12,
          boxShadow: '0 8px 32px #0008',
        }}
      />
      <div ref={infoRef} style={{ marginTop: 10 }}></div>
      {showRestart && (
        <button onClick={restart} style={{ marginTop: 16, padding: '10px 32px', fontSize: 18, borderRadius: 8, background: '#00bcd4', color: '#222', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 8px #0004' }}>
          Restart Game
        </button>
      )}
      <div style={{ color: '#ffffff', marginTop: 10, fontSize: 15 }}>
        <p>Press <strong>Space</strong> or <strong>Click</strong> to drop the block</p>
        <p>Stack as high as you can!</p>
      </div>
    </div>
  );
};

export default TowerStackGame;