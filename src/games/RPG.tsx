import React, { useState, useEffect, useCallback } from 'react';
import { Sword, Shield, Heart, Zap, MapPin, Gem } from 'lucide-react';

interface Player {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  level: number;
  experience: number;
  gold: number;
  inventory: string[];
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  name: string;
  symbol: string;
  color: string;
}

interface Item {
  x: number;
  y: number;
  type: string;
  name: string;
  symbol: string;
  color: string;
}

const WORLD_SIZE = 20;
const ENEMY_COUNT = 8;
const ITEM_COUNT = 6;

const ENEMY_TYPES = [
  { name: 'Goblin', symbol: '👹', color: 'text-green-500', health: 30, attack: 8, defense: 3 },
  { name: 'Orc', symbol: '👺', color: 'text-red-500', health: 50, attack: 12, defense: 6 },
  { name: 'Dragon', symbol: '🐉', color: 'text-purple-500', health: 100, attack: 20, defense: 15 },
];

const ITEM_TYPES = [
  { type: 'health', name: 'Health Potion', symbol: '❤️', color: 'text-red-500' },
  { type: 'weapon', name: 'Sword', symbol: '⚔️', color: 'text-blue-500' },
  { type: 'armor', name: 'Shield', symbol: '🛡️', color: 'text-yellow-500' },
  { type: 'treasure', name: 'Gem', symbol: '💎', color: 'text-purple-500' },
];

export const RPGGame: React.FC = () => {
  const [player, setPlayer] = useState<Player>({
    x: 1,
    y: 1,
    health: 100,
    maxHealth: 100,
    attack: 15,
    defense: 5,
    level: 1,
    experience: 0,
    gold: 0,
    inventory: []
  });

  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'battle' | 'gameOver' | 'won'>('playing');
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [message, setMessage] = useState('');
  const [showInventory, setShowInventory] = useState(false);

  const generateWorld = useCallback(() => {
    // Generate enemies
    const newEnemies: Enemy[] = [];
    for (let i = 0; i < ENEMY_COUNT; i++) {
      const enemyType = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
      newEnemies.push({
        id: i,
        x: Math.floor(Math.random() * (WORLD_SIZE - 2)) + 1,
        y: Math.floor(Math.random() * (WORLD_SIZE - 2)) + 1,
        health: enemyType.health,
        maxHealth: enemyType.health,
        attack: enemyType.attack,
        defense: enemyType.defense,
        name: enemyType.name,
        symbol: enemyType.symbol,
        color: enemyType.color
      });
    }

    // Generate items
    const newItems: Item[] = [];
    for (let i = 0; i < ITEM_COUNT; i++) {
      const itemType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
      newItems.push({
        x: Math.floor(Math.random() * (WORLD_SIZE - 2)) + 1,
        y: Math.floor(Math.random() * (WORLD_SIZE - 2)) + 1,
        type: itemType.type,
        name: itemType.name,
        symbol: itemType.symbol,
        color: itemType.color
      });
    }

    setEnemies(newEnemies);
    setItems(newItems);
  }, []);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameState !== 'playing') return;

    const newX = Math.max(0, Math.min(WORLD_SIZE - 1, player.x + dx));
    const newY = Math.max(0, Math.min(WORLD_SIZE - 1, player.y + dy));

    // Check for enemy collision
    const enemyAtPosition = enemies.find(e => e.x === newX && e.y === newY);
    if (enemyAtPosition) {
      setCurrentEnemy(enemyAtPosition);
      setGameState('battle');
      return;
    }

    // Check for item collection
    const itemAtPosition = items.find(item => item.x === newX && item.y === newY);
    if (itemAtPosition) {
      setItems(prev => prev.filter(item => !(item.x === newX && item.y === newY)));
      
      switch (itemAtPosition.type) {
        case 'health':
          setPlayer(prev => ({
            ...prev,
            health: Math.min(prev.maxHealth, prev.health + 30)
          }));
          setMessage(`Found ${itemAtPosition.name}! +30 HP`);
          break;
        case 'weapon':
          setPlayer(prev => ({
            ...prev,
            attack: prev.attack + 5,
            inventory: [...prev.inventory, itemAtPosition.name]
          }));
          setMessage(`Found ${itemAtPosition.name}! +5 Attack`);
          break;
        case 'armor':
          setPlayer(prev => ({
            ...prev,
            defense: prev.defense + 3,
            inventory: [...prev.inventory, itemAtPosition.name]
          }));
          setMessage(`Found ${itemAtPosition.name}! +3 Defense`);
          break;
        case 'treasure':
          setPlayer(prev => ({
            ...prev,
            gold: prev.gold + 50,
            inventory: [...prev.inventory, itemAtPosition.name]
          }));
          setMessage(`Found ${itemAtPosition.name}! +50 Gold`);
          break;
      }

      setTimeout(() => setMessage(''), 2000);
    }

    setPlayer(prev => ({ ...prev, x: newX, y: newY }));
  }, [player, enemies, items, gameState]);

  const handleBattle = useCallback(() => {
    if (!currentEnemy) return;

    // Player attacks
    const playerDamage = Math.max(1, player.attack - currentEnemy.defense);
    const newEnemyHealth = Math.max(0, currentEnemy.health - playerDamage);

    if (newEnemyHealth <= 0) {
      // Enemy defeated
      const experienceGained = currentEnemy.maxHealth * 2;
      const goldGained = Math.floor(Math.random() * 20) + 10;
      
      setPlayer(prev => {
        const newExp = prev.experience + experienceGained;
        const newLevel = Math.floor(newExp / 100) + 1;
        const levelUp = newLevel > prev.level;
        
        return {
          ...prev,
          experience: newExp,
          level: newLevel,
          gold: prev.gold + goldGained,
          health: levelUp ? prev.maxHealth : prev.health,
          maxHealth: levelUp ? prev.maxHealth + 20 : prev.maxHealth,
          attack: levelUp ? prev.attack + 3 : prev.attack,
          defense: levelUp ? prev.defense + 2 : prev.defense
        };
      });

      setEnemies(prev => prev.filter(e => e.id !== currentEnemy.id));
      setMessage(`Defeated ${currentEnemy.name}! +${experienceGained} XP, +${goldGained} Gold`);
      
      if (levelUp) {
        setMessage(prev => prev + ' Level Up!');
      }
      
      setTimeout(() => setMessage(''), 3000);
      setGameState('playing');
      setCurrentEnemy(null);
    } else {
      // Enemy attacks back
      const enemyDamage = Math.max(1, currentEnemy.attack - player.defense);
      const newPlayerHealth = Math.max(0, player.health - enemyDamage);

      setPlayer(prev => ({ ...prev, health: newPlayerHealth }));
      setCurrentEnemy(prev => prev ? { ...prev, health: newEnemyHealth } : null);

      if (newPlayerHealth <= 0) {
        setGameState('gameOver');
      }
    }
  }, [currentEnemy, player]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameState === 'battle') {
      if (e.code === 'Space') {
        e.preventDefault();
        handleBattle();
      }
      return;
    }

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        e.preventDefault();
        movePlayer(0, -1);
        break;
      case 'KeyS':
      case 'ArrowDown':
        e.preventDefault();
        movePlayer(0, 1);
        break;
      case 'KeyA':
      case 'ArrowLeft':
        e.preventDefault();
        movePlayer(-1, 0);
        break;
      case 'KeyD':
      case 'ArrowRight':
        e.preventDefault();
        movePlayer(1, 0);
        break;
      case 'KeyI':
        e.preventDefault();
        setShowInventory(!showInventory);
        break;
    }
  }, [gameState, movePlayer, handleBattle, showInventory]);

  useEffect(() => {
    generateWorld();
  }, [generateWorld]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (enemies.length === 0 && items.length === 0) {
      setGameState('won');
    }
  }, [enemies.length, items.length]);

  const renderWorld = () => {
    const world = Array(WORLD_SIZE).fill(null).map(() => Array(WORLD_SIZE).fill(''));
    
    // Place player
    world[player.y][player.x] = '🧙';
    
    // Place enemies
    enemies.forEach(enemy => {
      world[enemy.y][enemy.x] = enemy.symbol;
    });
    
    // Place items
    items.forEach(item => {
      world[item.y][item.x] = item.symbol;
    });

    return world.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={x}
            className={`
              w-6 h-6 border border-gray-700 flex items-center justify-center text-sm
              ${cell === '🧙' ? 'bg-amber-500 text-gray-900' : 'bg-gray-800'}
            `}
          >
            {cell}
          </div>
        ))}
      </div>
    ));
  };

  const resetGame = () => {
    setPlayer({
      x: 1,
      y: 1,
      health: 100,
      maxHealth: 100,
      attack: 15,
      defense: 5,
      level: 1,
      experience: 0,
      gold: 0,
      inventory: []
    });
    setGameState('playing');
    setCurrentEnemy(null);
    setMessage('');
    setShowInventory(false);
    generateWorld();
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-amber-400 mb-2">Pixel Adventure</h1>
          
          <div className="flex justify-center space-x-8 text-gray-300 mb-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-400" />
              <span>HP: {player.health}/{player.maxHealth}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sword className="h-5 w-5 text-blue-400" />
              <span>ATK: {player.attack}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-yellow-400" />
              <span>DEF: {player.defense}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-400" />
              <span>Lvl: {player.level}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Gem className="h-5 w-5 text-amber-400" />
              <span>Gold: {player.gold}</span>
            </div>
          </div>

          {message && (
            <div className="text-amber-400 font-bold mb-4">{message}</div>
          )}
        </div>

        <div className="flex justify-center mb-6">
          <div className="border-4 border-gray-600 bg-gray-800 rounded-lg">
            {renderWorld()}
          </div>
        </div>

        {gameState === 'battle' && currentEnemy && (
          <div className="text-center mb-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
            <div className="text-xl font-bold text-red-400 mb-2">
              Battle with {currentEnemy.name}!
            </div>
            <div className="text-gray-300 mb-4">
              <div>Enemy HP: {currentEnemy.health}/{currentEnemy.maxHealth}</div>
              <div>Enemy ATK: {currentEnemy.attack} | DEF: {currentEnemy.defense}</div>
            </div>
            <button
              onClick={handleBattle}
              className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-600 transition-colors"
            >
              Attack (SPACE)
            </button>
          </div>
        )}

        {gameState === 'gameOver' && (
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

        {gameState === 'won' && (
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-green-400 mb-4">🎉 You Won! 🎉</div>
            <div className="text-gray-300 mb-4">
              <div>Final Level: {player.level}</div>
              <div>Final Gold: {player.gold}</div>
            </div>
            <button
              onClick={resetGame}
              className="bg-amber-500 text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors"
            >
              Play Again
            </button>
          </div>
        )}

        {showInventory && (
          <div className="text-center mb-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
            <div className="text-xl font-bold text-amber-400 mb-2">Inventory</div>
            <div className="text-gray-300">
              {player.inventory.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {player.inventory.map((item, index) => (
                    <div key={index} className="text-sm">{item}</div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">Empty</div>
              )}
            </div>
          </div>
        )}

        <div className="text-center text-gray-400 text-sm">
          <div className="mb-2">
            <strong>Controls:</strong>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div>WASD or Arrow Keys - Move</div>
              <div>I - Toggle Inventory</div>
            </div>
            <div>
              <div>SPACE - Attack (in battle)</div>
              <div>Collect items and defeat enemies!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 