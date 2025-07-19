import React, { useRef, useEffect, useState, useCallback } from 'react';


const GAME_WIDTH = 1000;
const GAME_HEIGHT = 600;
const GRID_SIZE = 40;
const GRID_COLS = Math.floor(GAME_WIDTH / GRID_SIZE);
const GRID_ROWS = Math.floor(GAME_HEIGHT / GRID_SIZE);

// Asset types for Nepali house building
type AssetType = 'foundation' | 'wall' | 'roof' | 'door' | 'window' | 'beam' | 'decor' | 'garden';

interface Asset {
  id: string;
  type: AssetType;
  name: string;
  width: number;
  height: number;
  color: string;
  icon: string;
  points: number;
  cost: number;
  required: boolean;
}

interface PlacedAsset {
  id: string;
  assetId: string;
  x: number;
  y: number;
  rotation: number;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  timeLimit: number;
  budget: number;
  requirements: {
    minWalls: number;
    minWindows: number;
    minDoors: number;
    minDecor: number;
    minGarden: number;
    specificAssets?: string[];
  };
  bonusPoints: number;
}

const NEPALI_ASSETS: Asset[] = [
  // Foundation
  { id: 'foundation-1', type: 'foundation', name: 'Stone Foundation', width: 2, height: 1, color: '#8B7355', icon: '🏗️', points: 10, cost: 50, required: true },
  
  // Walls
  { id: 'wall-brick', type: 'wall', name: 'Brick Wall', width: 1, height: 2, color: '#CD853F', icon: '🧱', points: 15, cost: 30, required: true },
  { id: 'wall-wood', type: 'wall', name: 'Wooden Wall', width: 1, height: 2, color: '#8B4513', icon: '🪵', points: 20, cost: 45, required: false },
  { id: 'wall-stone', type: 'wall', name: 'Stone Wall', width: 1, height: 2, color: '#696969', icon: '🪨', points: 25, cost: 60, required: false },
  
  // Roof
  { id: 'roof-pagoda', type: 'roof', name: 'Pagoda Roof', width: 3, height: 1, color: '#FF6B35', icon: '🏛️', points: 25, cost: 80, required: true },
  { id: 'roof-sloped', type: 'roof', name: 'Sloped Roof', width: 2, height: 1, color: '#8B4513', icon: '🏠', points: 20, cost: 60, required: false },
  { id: 'roof-flat', type: 'roof', name: 'Flat Roof', width: 2, height: 1, color: '#A0522D', icon: '🏢', points: 15, cost: 40, required: false },
  
  // Doors
  { id: 'door-main', type: 'door', name: 'Main Door', width: 1, height: 2, color: '#8B4513', icon: '🚪', points: 15, cost: 35, required: true },
  { id: 'door-side', type: 'door', name: 'Side Door', width: 1, height: 2, color: '#654321', icon: '🚪', points: 10, cost: 25, required: false },
  { id: 'door-carved', type: 'door', name: 'Carved Door', width: 1, height: 2, color: '#D2691E', icon: '🎨', points: 20, cost: 50, required: false },
  
  // Windows
  { id: 'window-wooden', type: 'window', name: 'Wooden Window', width: 1, height: 1, color: '#F4A460', icon: '🪟', points: 8, cost: 20, required: false },
  { id: 'window-decorative', type: 'window', name: 'Decorative Window', width: 1, height: 1, color: '#DAA520', icon: '🪟', points: 12, cost: 30, required: false },
  { id: 'window-stained', type: 'window', name: 'Stained Glass', width: 1, height: 1, color: '#FF69B4', icon: '🪟', points: 18, cost: 45, required: false },
  
  // Beams
  { id: 'beam-wooden', type: 'beam', name: 'Wooden Beam', width: 2, height: 1, color: '#8B4513', icon: '🪵', points: 10, cost: 25, required: false },
  { id: 'beam-carved', type: 'beam', name: 'Carved Beam', width: 2, height: 1, color: '#D2691E', icon: '🎨', points: 15, cost: 40, required: false },
  
  // Decorations
  { id: 'decor-torana', type: 'decor', name: 'Torana (Door Frame)', width: 1, height: 2, color: '#FFD700', icon: '🎭', points: 20, cost: 55, required: false },
  { id: 'decor-prayer', type: 'decor', name: 'Prayer Flags', width: 2, height: 1, color: '#FF69B4', icon: '🏳️', points: 15, cost: 35, required: false },
  { id: 'decor-lantern', type: 'decor', name: 'Traditional Lantern', width: 1, height: 1, color: '#FFA500', icon: '🏮', points: 10, cost: 25, required: false },
  { id: 'decor-statue', type: 'decor', name: 'Buddha Statue', width: 1, height: 1, color: '#FFD700', icon: '🙏', points: 25, cost: 70, required: false },
  
  // Garden
  { id: 'garden-tulsi', type: 'garden', name: 'Tulsi Plant', width: 1, height: 1, color: '#228B22', icon: '🌿', points: 8, cost: 15, required: false },
  { id: 'garden-marigold', type: 'garden', name: 'Marigold Flowers', width: 1, height: 1, color: '#FFD700', icon: '🌼', points: 5, cost: 10, required: false },
  { id: 'garden-fountain', type: 'garden', name: 'Stone Fountain', width: 2, height: 2, color: '#C0C0C0', icon: '⛲', points: 30, cost: 90, required: false },
];

const CHALLENGES: Challenge[] = [
  {
    id: 'beginner',
    name: 'Simple Home',
    description: 'Build a basic Nepali house with essential elements',
    timeLimit: 300, // 5 minutes
    budget: 300,
    requirements: {
      minWalls: 4,
      minWindows: 1,
      minDoors: 1,
      minDecor: 0,
      minGarden: 0,
    },
    bonusPoints: 100,
  },
  {
    id: 'intermediate',
    name: 'Traditional House',
    description: 'Create a traditional Nepali house with cultural elements',
    timeLimit: 240, // 4 minutes
    budget: 500,
    requirements: {
      minWalls: 6,
      minWindows: 2,
      minDoors: 1,
      minDecor: 2,
      minGarden: 1,
      specificAssets: ['roof-pagoda', 'decor-torana'],
    },
    bonusPoints: 200,
  },
  {
    id: 'advanced',
    name: 'Luxury Villa',
    description: 'Build an extravagant Nepali villa with premium materials',
    timeLimit: 180, // 3 minutes
    budget: 800,
    requirements: {
      minWalls: 8,
      minWindows: 3,
      minDoors: 2,
      minDecor: 4,
      minGarden: 2,
      specificAssets: ['roof-pagoda', 'decor-statue', 'garden-fountain', 'window-stained'],
    },
    bonusPoints: 400,
  },
  {
    id: 'expert',
    name: 'Temple Complex',
    description: 'Construct a magnificent temple-inspired complex',
    timeLimit: 120, // 2 minutes
    budget: 1000,
    requirements: {
      minWalls: 10,
      minWindows: 4,
      minDoors: 3,
      minDecor: 6,
      minGarden: 3,
      specificAssets: ['roof-pagoda', 'decor-statue', 'garden-fountain', 'window-stained', 'decor-torana', 'beam-carved'],
    },
    bonusPoints: 600,
  },
];

const HouseBuilder: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [placedAssets, setPlacedAssets] = useState<PlacedAsset[]>([]);
  const [score, setScore] = useState(0);
  const [budget, setBudget] = useState(300);
  const [timeLeft, setTimeLeft] = useState(300);
  const [gameState, setGameState] = useState<'menu' | 'building' | 'complete' | 'failed'>('menu');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [started, setStarted] = useState(false);



  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState === 'building' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('failed');
            setMessage('⏰ Time\'s up! You ran out of time!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  // Handle mouse events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (selectedAsset && gameState === 'building') {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setDragStart({ x, y });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (selectedAsset && dragStart && gameState === 'building') {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Convert to grid coordinates
        const gridX = Math.floor(x / GRID_SIZE);
        const gridY = Math.floor(y / GRID_SIZE);
        
        if (canPlaceAsset(selectedAsset, gridX, gridY)) {
          placeAsset(selectedAsset, gridX, gridY);
        }
        
        setDragStart(null);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectedAsset, dragStart, placedAssets, gameState]);

  // Start challenge
  const startChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setBudget(challenge.budget);
    setTimeLeft(challenge.timeLimit);
    setScore(0);
    setPlacedAssets([]);
    setGameState('building');
    setMessage(`🏁 Challenge started: ${challenge.name}`);
  };

  // Check if asset can be placed at given position
  const canPlaceAsset = (asset: Asset, gridX: number, gridY: number): boolean => {
    // Check bounds
    if (gridX < 0 || gridY < 0 || gridX + asset.width > GRID_COLS || gridY + asset.height > GRID_ROWS) {
      return false;
    }

    // Check budget
    if (budget < asset.cost) {
      return false;
    }

    // Check if space is occupied
    for (let x = gridX; x < gridX + asset.width; x++) {
      for (let y = gridY; y < gridY + asset.height; y++) {
        const existingAsset = placedAssets.find(pa => {
          const assetData = NEPALI_ASSETS.find(a => a.id === pa.assetId);
          if (!assetData) return false;
          
          for (let ax = pa.x; ax < pa.x + assetData.width; ax++) {
            for (let ay = pa.y; ay < pa.y + assetData.height; ay++) {
              if (ax === x && ay === y) return true;
            }
          }
          return false;
        });
        
        if (existingAsset) return false;
      }
    }

    return true;
  };

  // Place asset on the grid
  const placeAsset = (asset: Asset, gridX: number, gridY: number) => {
    const newPlacedAsset: PlacedAsset = {
      id: `${asset.id}-${Date.now()}`,
      assetId: asset.id,
      x: gridX,
      y: gridY,
      rotation: 0,
    };

    setPlacedAssets(prev => [...prev, newPlacedAsset]);
    setScore(prev => prev + asset.points);
    setBudget(prev => prev - asset.cost);
    setSelectedAsset(null);
    
    // Check if challenge is complete
    checkChallengeCompletion();
  };

  // Check if challenge requirements are met
  const checkChallengeCompletion = () => {
    if (!selectedChallenge) return;

    const assetCounts = {
      walls: 0,
      windows: 0,
      doors: 0,
      decor: 0,
      garden: 0,
    };

    const placedAssetIds = placedAssets.map(pa => pa.assetId);

    placedAssets.forEach(placedAsset => {
      const asset = NEPALI_ASSETS.find(a => a.id === placedAsset.assetId);
      if (asset) {
        switch (asset.type) {
          case 'wall': assetCounts.walls++; break;
          case 'window': assetCounts.windows++; break;
          case 'door': assetCounts.doors++; break;
          case 'decor': assetCounts.decor++; break;
          case 'garden': assetCounts.garden++; break;
        }
      }
    });

    const req = selectedChallenge.requirements;
    
    // Check basic requirements
    if (assetCounts.walls < req.minWalls) return;
    if (assetCounts.windows < req.minWindows) return;
    if (assetCounts.doors < req.minDoors) return;
    if (assetCounts.decor < req.minDecor) return;
    if (assetCounts.garden < req.minGarden) return;

    // Check specific assets
    if (req.specificAssets) {
      for (const requiredAsset of req.specificAssets) {
        if (!placedAssetIds.includes(requiredAsset)) return;
      }
    }

    // Challenge completed!
    const timeBonus = Math.floor((timeLeft / selectedChallenge.timeLimit) * 100);
    const budgetBonus = Math.floor((budget / selectedChallenge.budget) * 50);
    const finalScore = score + selectedChallenge.bonusPoints + timeBonus + budgetBonus;
    
    setScore(finalScore);
    setGameState('complete');
    setMessage(`🎉 Challenge Complete! Final Score: ${finalScore}`);
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Drawing function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw grid
    ctx.strokeStyle = '#DDD';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID_COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * GRID_SIZE, 0);
      ctx.lineTo(x * GRID_SIZE, GAME_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * GRID_SIZE);
      ctx.lineTo(GAME_WIDTH, y * GRID_SIZE);
      ctx.stroke();
    }

    // Draw placed assets
    placedAssets.forEach(placedAsset => {
      const asset = NEPALI_ASSETS.find(a => a.id === placedAsset.assetId);
      if (!asset) return;

      ctx.save();
      ctx.translate(placedAsset.x * GRID_SIZE + (asset.width * GRID_SIZE) / 2, 
                   placedAsset.y * GRID_SIZE + (asset.height * GRID_SIZE) / 2);
      ctx.rotate(placedAsset.rotation * Math.PI / 180);

      // Draw asset background
      ctx.fillStyle = asset.color;
      ctx.fillRect(-(asset.width * GRID_SIZE) / 2, -(asset.height * GRID_SIZE) / 2, 
                  asset.width * GRID_SIZE, asset.height * GRID_SIZE);

      // Draw asset border
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(-(asset.width * GRID_SIZE) / 2, -(asset.height * GRID_SIZE) / 2, 
                    asset.width * GRID_SIZE, asset.height * GRID_SIZE);

      // Draw asset icon
      ctx.fillStyle = '#000';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(asset.icon, 0, 0);

      ctx.restore();
    });

    // Draw preview of selected asset
    if (selectedAsset && dragStart && gameState === 'building') {
      const gridX = Math.floor(mousePos.x / GRID_SIZE);
      const gridY = Math.floor(mousePos.y / GRID_SIZE);
      
      ctx.save();
      ctx.globalAlpha = 0.7;
      
      if (canPlaceAsset(selectedAsset, gridX, gridY)) {
        ctx.fillStyle = '#00FF00';
      } else {
        ctx.fillStyle = '#FF0000';
      }
      
      ctx.fillRect(gridX * GRID_SIZE, gridY * GRID_SIZE, 
                  selectedAsset.width * GRID_SIZE, selectedAsset.height * GRID_SIZE);
      
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(gridX * GRID_SIZE, gridY * GRID_SIZE, 
                    selectedAsset.width * GRID_SIZE, selectedAsset.height * GRID_SIZE);
      
      ctx.fillStyle = '#000';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedAsset.icon, 
                  gridX * GRID_SIZE + (selectedAsset.width * GRID_SIZE) / 2,
                  gridY * GRID_SIZE + (selectedAsset.height * GRID_SIZE) / 2);
      
      ctx.restore();
    }

    // Draw UI
    if (gameState === 'building') {
      ctx.fillStyle = '#000';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${score}`, 10, 30);
      ctx.fillText(`Budget: $${budget}`, 10, 55);
      ctx.fillText(`Time: ${formatTime(timeLeft)}`, 10, 80);
      
      if (selectedChallenge) {
        ctx.fillText(`Challenge: ${selectedChallenge.name}`, 10, 105);
      }
    }
    
    if (message) {
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(message, GAME_WIDTH / 2, 50);
    }
  }, [selectedAsset, placedAssets, score, budget, timeLeft, message, mousePos, dragStart, gameState, selectedChallenge]);

  // Game loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      draw();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [draw]);

  // Reset game
  const resetGame = () => {
    setPlacedAssets([]);
    setScore(0);
    setBudget(300);
    setTimeLeft(300);
    setGameState('menu');
    setSelectedChallenge(null);
    setMessage(null);
    setSelectedAsset(null);
  };

  // Menu screen
  if (!started) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 600 }}>
        <button
          onClick={() => setStarted(true)}
          style={{ padding: '16px 40px', fontSize: 24, borderRadius: 8, background: '#00ff00', color: '#222', border: 'none', cursor: 'pointer', marginBottom: 24 }}
        >
          Click to Start
        </button>
        <div style={{ color: '#fff', fontSize: 16 }}>Build your dream house with blocks and materials. Use your creativity and skills to design and construct your home.</div>
      </div>
    );
  }

  if (gameState === 'menu') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-300 to-green-400 font-inter p-4">
        <h1 className="text-5xl font-bold text-white mb-8 drop-shadow-lg">🏠 Nepali House Builder</h1>
        <p className="text-xl text-white mb-8 text-center max-w-2xl">
          Build beautiful Nepali houses under time pressure and budget constraints!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {CHALLENGES.map(challenge => (
            <div key={challenge.id} className="bg-white rounded-xl shadow-2xl p-6 border-4 border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{challenge.name}</h2>
              <p className="text-gray-600 mb-4">{challenge.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold">⏱️ Time Limit:</span>
                  <span className="text-sm">{formatTime(challenge.timeLimit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold">💰 Budget:</span>
                  <span className="text-sm">${challenge.budget}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold">🏆 Bonus Points:</span>
                  <span className="text-sm">{challenge.bonusPoints}</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-700 mb-4">
                <p className="font-semibold mb-2">Requirements:</p>
                <ul className="space-y-1">
                  <li>• {challenge.requirements.minWalls} walls minimum</li>
                  <li>• {challenge.requirements.minWindows} windows minimum</li>
                  <li>• {challenge.requirements.minDoors} doors minimum</li>
                  <li>• {challenge.requirements.minDecor} decorations minimum</li>
                  <li>• {challenge.requirements.minGarden} garden items minimum</li>
                  {challenge.requirements.specificAssets && (
                    <li>• Specific assets required</li>
                  )}
                </ul>
              </div>
              
              <button
                onClick={() => startChallenge(challenge)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                Start Challenge
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-300 to-green-400 font-inter p-4">
      <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">Nepali House Builder</h1>
      
      <div className="flex gap-6">
        {/* Building Area */}
        <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-gray-700">
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="bg-gradient-to-b from-blue-200 to-green-100 border-2 border-gray-300"
          />
          
          {/* Game Over Screens */}
          {gameState === 'complete' && (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center rounded-lg">
              <h2 className="text-green-400 text-5xl font-extrabold mb-4 animate-bounce">Challenge Complete!</h2>
              <p className="text-white text-2xl mb-2">Final Score: {score}</p>
              <p className="text-white text-xl mb-8">Amazing Nepali house built!</p>
              <button
                onClick={resetGame}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                Play Again
              </button>
            </div>
          )}
          
          {gameState === 'failed' && (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center rounded-lg">
              <h2 className="text-red-400 text-5xl font-extrabold mb-4">Challenge Failed!</h2>
              <p className="text-white text-xl mb-8">{message}</p>
              <button
                onClick={resetGame}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Asset Panel */}
        <div className="bg-white rounded-xl shadow-2xl p-6 border-4 border-gray-700 max-h-[600px] overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Building Assets</h2>
          
          <div className="space-y-4">
            {NEPALI_ASSETS.map(asset => (
              <div
                key={asset.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedAsset?.id === asset.id
                    ? 'border-blue-500 bg-blue-100'
                    : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                } ${asset.required ? 'bg-yellow-50 border-yellow-300' : ''} ${
                  budget < asset.cost ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => budget >= asset.cost && setSelectedAsset(asset)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{asset.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{asset.name}</h3>
                    <p className="text-sm text-gray-600">
                      Size: {asset.width}x{asset.height} | Points: {asset.points} | Cost: ${asset.cost}
                    </p>
                    {asset.required && (
                      <p className="text-xs text-yellow-600 font-semibold">Required</p>
                    )}
                    {budget < asset.cost && (
                      <p className="text-xs text-red-600 font-semibold">Not enough budget!</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-2">How to Build:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Click an asset to select it</li>
              <li>• Click on the grid to place it</li>
              <li>• Stay within budget and time limit</li>
              <li>• Meet all challenge requirements</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-white">
        <p className="text-lg">Build traditional Nepali houses under pressure!</p>
        <p className="text-md">Manage your budget and time wisely to complete challenges.</p>
      </div>
    </div>
  );
};

export default HouseBuilder; 