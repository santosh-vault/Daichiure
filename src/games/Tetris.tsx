import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, RotateCw } from 'lucide-react';

interface TetrisPiece {
  shape: number[][];
  color: string;
}

const TETROMINOES: TetrisPiece[] = [
  { shape: [[1, 1, 1, 1]], color: 'bg-cyan-500' }, // I
  { shape: [[1, 1], [1, 1]], color: 'bg-yellow-500' }, // O
  { shape: [[1, 1, 1], [0, 1, 0]], color: 'bg-purple-500' }, // T
  { shape: [[1, 1, 1], [1, 0, 0]], color: 'bg-blue-500' }, // L
  { shape: [[1, 1, 1], [0, 0, 1]], color: 'bg-orange-500' }, // J
  { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-green-500' }, // S
  { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-red-500' }, // Z
];

export const TetrisGame: React.FC = () => {
  const [board, setBoard] = useState<number[][]>([]);
  const [currentPiece, setCurrentPiece] = useState<TetrisPiece | null>(null);
  const [piecePosition, setPiecePosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const BOARD_WIDTH = 10;
  const BOARD_HEIGHT = 20;

  const initializeBoard = useCallback(() => {
    const newBoard = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
    setBoard(newBoard);
  }, []);

  const getRandomPiece = useCallback((): TetrisPiece => {
    return TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
  }, []);

  const spawnPiece = useCallback(() => {
    const newPiece = getRandomPiece();
    setCurrentPiece(newPiece);
    setPiecePosition({ x: Math.floor(BOARD_WIDTH / 2) - Math.floor(newPiece.shape[0].length / 2), y: 0 });
  }, [getRandomPiece]);

  const isValidMove = useCallback((piece: TetrisPiece, x: number, y: number): boolean => {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (newY >= 0 && board[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  }, [board]);

  const placePiece = useCallback(() => {
    if (!currentPiece) return;

    const newBoard = board.map(row => [...row]);
    
    for (let row = 0; row < currentPiece.shape.length; row++) {
      for (let col = 0; col < currentPiece.shape[row].length; col++) {
        if (currentPiece.shape[row][col]) {
          const boardY = piecePosition.y + row;
          const boardX = piecePosition.x + col;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = 1;
          }
        }
      }
    }

    setBoard(newBoard);
    spawnPiece();
  }, [currentPiece, piecePosition, board, spawnPiece]);

  const movePiece = useCallback((dx: number, dy: number) => {
    if (!currentPiece || gameOver || isPaused) return;

    const newX = piecePosition.x + dx;
    const newY = piecePosition.y + dy;

    if (isValidMove(currentPiece, newX, newY)) {
      setPiecePosition({ x: newX, y: newY });
    } else if (dy > 0) {
      placePiece();
    }
  }, [currentPiece, piecePosition, gameOver, isPaused, isValidMove, placePiece]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    const rotated = currentPiece.shape[0].map((_, i) => 
      currentPiece.shape.map(row => row[i]).reverse()
    );
    
    const rotatedPiece = { ...currentPiece, shape: rotated };
    
    if (isValidMove(rotatedPiece, piecePosition.x, piecePosition.y)) {
      setCurrentPiece(rotatedPiece);
    }
  }, [currentPiece, piecePosition, gameOver, isPaused, isValidMove]);

  const clearLines = useCallback(() => {
    const newBoard = board.filter(row => !row.every(cell => cell === 1));
    const linesCleared = board.length - newBoard.length;
    
    if (linesCleared > 0) {
      const newLines = lines + linesCleared;
      const newLevel = Math.floor(newLines / 10) + 1;
      const newScore = score + (linesCleared * 100 * level);
      
      setLines(newLines);
      setLevel(newLevel);
      setScore(newScore);
      
      // Add empty rows at the top
      while (newBoard.length < BOARD_HEIGHT) {
        newBoard.unshift(Array(BOARD_WIDTH).fill(0));
      }
      
      setBoard(newBoard);
    }
  }, [board, lines, level, score]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameOver) return;

    switch (e.code) {
      case 'ArrowLeft':
        e.preventDefault();
        movePiece(-1, 0);
        break;
      case 'ArrowRight':
        e.preventDefault();
        movePiece(1, 0);
        break;
      case 'ArrowDown':
        e.preventDefault();
        movePiece(0, 1);
        break;
      case 'ArrowUp':
      case 'Space':
        e.preventDefault();
        rotatePiece();
        break;
      case 'KeyP':
        e.preventDefault();
        setIsPaused(!isPaused);
        break;
    }
  }, [gameOver, movePiece, rotatePiece, isPaused]);

  useEffect(() => {
    initializeBoard();
    spawnPiece();
  }, [initializeBoard, spawnPiece]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const interval = setInterval(() => {
      movePiece(0, 1);
    }, Math.max(100, 1000 - (level * 50)));

    return () => clearInterval(interval);
  }, [movePiece, gameOver, isPaused, level]);

  useEffect(() => {
    clearLines();
  }, [board, clearLines]);

  useEffect(() => {
    if (currentPiece && !isValidMove(currentPiece, piecePosition.x, piecePosition.y)) {
      setGameOver(true);
    }
  }, [currentPiece, piecePosition, isValidMove]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    if (currentPiece && !gameOver) {
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col]) {
            const boardY = piecePosition.y + row;
            const boardX = piecePosition.x + col;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = 1;
            }
          }
        }
      }
    }

    return displayBoard.map((row, rowIndex) => (
      <div key={rowIndex} className="flex">
        {row.map((cell, colIndex) => (
          <div
            key={colIndex}
            className={`w-6 h-6 border border-gray-700 ${
              cell ? 'bg-amber-500' : 'bg-gray-800'
            }`}
          />
        ))}
      </div>
    ));
  };

  const resetGame = () => {
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setLines(0);
    setIsPaused(false);
    initializeBoard();
    spawnPiece();
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-amber-400 mb-2">Tetris Classic</h1>
          <div className="flex justify-center space-x-8 text-gray-300">
            <div>
              <div className="text-2xl font-bold text-amber-400">{score}</div>
              <div className="text-sm">Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">{level}</div>
              <div className="text-sm">Level</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">{lines}</div>
              <div className="text-sm">Lines</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="border-4 border-gray-600 bg-gray-800 rounded-lg">
            {renderBoard()}
          </div>
        </div>

        {gameOver && (
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-red-400 mb-4">Game Over!</div>
            <button
              onClick={resetGame}
              className="bg-amber-500 text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors"
            >
              Play Again
            </button>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-amber-400 mb-4">Paused</div>
            <button
              onClick={() => setIsPaused(false)}
              className="bg-amber-500 text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors"
            >
              Resume
            </button>
          </div>
        )}

        <div className="text-center text-gray-400 text-sm">
          <div className="mb-2">
            <strong>Controls:</strong>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex items-center justify-center space-x-2 mb-1">
                <ArrowLeft className="h-4 w-4" />
                <span>Move Left</span>
              </div>
              <div className="flex items-center justify-center space-x-2 mb-1">
                <ArrowRight className="h-4 w-4" />
                <span>Move Right</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-2 mb-1">
                <ArrowDown className="h-4 w-4" />
                <span>Move Down</span>
              </div>
              <div className="flex items-center justify-center space-x-2 mb-1">
                <RotateCw className="h-4 w-4" />
                <span>Rotate</span>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <strong>P</strong> to pause
          </div>
        </div>
      </div>
    </div>
  );
}; 