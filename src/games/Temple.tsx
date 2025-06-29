import React, { useState, useEffect, useCallback } from 'react';
import { Star, Heart, Zap, Target } from 'lucide-react';

interface Tile {
  id: number;
  value: number;
  isFlipped: boolean;
  isMatched: boolean;
  pattern: string;
}

interface Pattern {
  symbol: string;
  color: string;
  name: string;
}

const NEPALI_PATTERNS: Pattern[] = [
  { symbol: '🕉️', color: 'text-orange-500', name: 'Om' },
  { symbol: '🌀', color: 'text-blue-500', name: 'Mandala' },
  { symbol: '🏔️', color: 'text-gray-500', name: 'Himalayas' },
  { symbol: '🏛️', color: 'text-yellow-500', name: 'Temple' },
  { symbol: '🌸', color: 'text-pink-500', name: 'Lotus' },
  { symbol: '🔔', color: 'text-red-500', name: 'Prayer Bell' },
  { symbol: '🏳️', color: 'text-green-500', name: 'Prayer Flag' },
  { symbol: '🕯️', color: 'text-purple-500', name: 'Incense' },
];

export const TempleGame: React.FC = () => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [flippedTiles, setFlippedTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [bestMoves, setBestMoves] = useState<number | null>(null);

  const initializeGame = useCallback(() => {
    const tileCount = 16; // 4x4 grid
    const patternCount = tileCount / 2;
    const selectedPatterns = NEPALI_PATTERNS.slice(0, patternCount);
    
    const newTiles: Tile[] = [];
    for (let i = 0; i < patternCount; i++) {
      const pattern = selectedPatterns[i];
      // Add two tiles for each pattern
      newTiles.push({
        id: i * 2,
        value: i,
        isFlipped: false,
        isMatched: false,
        pattern: pattern.symbol
      });
      newTiles.push({
        id: i * 2 + 1,
        value: i,
        isFlipped: false,
        isMatched: false,
        pattern: pattern.symbol
      });
    }
    
    // Shuffle tiles
    const shuffledTiles = newTiles.sort(() => Math.random() - 0.5);
    
    setTiles(shuffledTiles);
    setFlippedTiles([]);
    setMoves(0);
    setTime(0);
    setGameStarted(false);
    setGameWon(false);
    setScore(0);
  }, []);

  const handleTileClick = useCallback((tileId: number) => {
    if (!gameStarted) {
      setGameStarted(true);
    }

    const tile = tiles.find(t => t.id === tileId);
    if (!tile || tile.isFlipped || tile.isMatched || flippedTiles.length >= 2) {
      return;
    }

    const newFlippedTiles = [...flippedTiles, tileId];
    setFlippedTiles(newFlippedTiles);

    if (newFlippedTiles.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedTiles;
      const firstTile = tiles.find(t => t.id === firstId);
      const secondTile = tiles.find(t => t.id === secondId);

      if (firstTile && secondTile && firstTile.value === secondTile.value) {
        // Match found
        setTiles(prev => prev.map(t => 
          t.id === firstId || t.id === secondId 
            ? { ...t, isMatched: true }
            : t
        ));
        setFlippedTiles([]);
        setScore(prev => prev + 100);
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setTiles(prev => prev.map(t => 
            t.id === firstId || t.id === secondId 
              ? { ...t, isFlipped: false }
              : t
          ));
          setFlippedTiles([]);
        }, 1000);
      }
    }

    // Flip the clicked tile
    setTiles(prev => prev.map(t => 
      t.id === tileId 
        ? { ...t, isFlipped: true }
        : t
    ));
  }, [tiles, flippedTiles, gameStarted]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameWon) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameWon]);

  useEffect(() => {
    if (tiles.length > 0 && tiles.every(tile => tile.isMatched)) {
      setGameWon(true);
      
      // Calculate final score
      const finalScore = Math.max(0, 1000 - (moves * 10) - (time * 5));
      setScore(finalScore);
      
      // Update best scores
      if (!bestTime || time < bestTime) {
        setBestTime(time);
        localStorage.setItem('templeBestTime', time.toString());
      }
      if (!bestMoves || moves < bestMoves) {
        setBestMoves(moves);
        localStorage.setItem('templeBestMoves', moves.toString());
      }
    }
  }, [tiles, time, moves, bestTime, bestMoves]);

  useEffect(() => {
    // Load best scores from localStorage
    const savedBestTime = localStorage.getItem('templeBestTime');
    const savedBestMoves = localStorage.getItem('templeBestMoves');
    
    if (savedBestTime) setBestTime(parseInt(savedBestTime));
    if (savedBestMoves) setBestMoves(parseInt(savedBestMoves));
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStarRating = (moves: number, time: number) => {
    if (moves <= 12 && time <= 60) return 3;
    if (moves <= 18 && time <= 90) return 2;
    return 1;
  };

  const nextLevel = () => {
    setLevel(prev => prev + 1);
    initializeGame();
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700 max-w-4xl w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-amber-400 mb-2">Nepali Temple Puzzle</h1>
          
          <div className="flex justify-center space-x-8 text-gray-300 mb-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-amber-400" />
              <span>Level: {level}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-amber-400" />
              <span>Score: {score}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-amber-400" />
              <span>Time: {formatTime(time)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-amber-400" />
              <span>Moves: {moves}</span>
            </div>
          </div>

          {bestTime && bestMoves && (
            <div className="flex justify-center space-x-8 text-gray-400 text-sm mb-4">
              <div>Best Time: {formatTime(bestTime)}</div>
              <div>Best Moves: {bestMoves}</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {tiles.map((tile) => (
            <div
              key={tile.id}
              onClick={() => handleTileClick(tile.id)}
              className={`
                aspect-square rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105
                ${tile.isFlipped || tile.isMatched
                  ? 'bg-amber-500 text-gray-900 shadow-lg'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }
                ${tile.isMatched ? 'opacity-75' : ''}
                flex items-center justify-center text-4xl font-bold
                border-2 ${tile.isMatched ? 'border-amber-400' : 'border-gray-600'}
              `}
            >
              {(tile.isFlipped || tile.isMatched) && tile.pattern}
            </div>
          ))}
        </div>

        {gameWon && (
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-green-400 mb-4">
              🎉 Temple Puzzle Solved! 🎉
            </div>
            <div className="text-gray-300 mb-4">
              <div>Time: {formatTime(time)}</div>
              <div>Moves: {moves}</div>
              <div>Score: {score}</div>
              <div className="flex justify-center items-center space-x-1 mt-2">
                {[...Array(3)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < getStarRating(moves, time) ? 'text-yellow-400 fill-current' : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={nextLevel}
                className="bg-amber-500 text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors"
              >
                Next Level
              </button>
              <button
                onClick={initializeGame}
                className="bg-gray-700 text-gray-300 px-6 py-3 rounded-lg font-bold hover:bg-gray-600 transition-colors"
              >
                Restart Level
              </button>
            </div>
          </div>
        )}

        {!gameWon && (
          <div className="text-center">
            <button
              onClick={initializeGame}
              className="bg-gray-700 text-gray-300 px-6 py-3 rounded-lg font-bold hover:bg-gray-600 transition-colors"
            >
              New Game
            </button>
          </div>
        )}

        <div className="text-center text-gray-400 text-sm mt-6">
          <div className="mb-2">
            <strong>How to Play:</strong>
          </div>
          <div className="text-xs">
            Match the Nepali cultural symbols to solve the temple puzzle. 
            Complete with fewer moves and faster time for higher scores!
          </div>
          <div className="mt-2 text-xs">
            <strong>Symbols:</strong> 🕉️ Om, 🌀 Mandala, 🏔️ Himalayas, 🏛️ Temple, 
            🌸 Lotus, 🔔 Prayer Bell, 🏳️ Prayer Flag, 🕯️ Incense
          </div>
        </div>
      </div>
    </div>
  );
}; 