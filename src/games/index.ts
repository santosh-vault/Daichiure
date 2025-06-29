import { SnakeGame } from './Snake';
import { PongGame } from './Pong';
import { TetrisGame } from './Tetris';
import { BreakoutGame } from './Breakout';
import { MemoryGame } from './Memory';
import { RPGGame } from './RPG';
import { EverestGame } from './Everest';
import { KathmanduGame } from './Kathmandu';
import { TempleGame } from './Temple';

// Game component mapping
export const gameComponents: Record<string, React.ComponentType> = {
  'snake': SnakeGame,
  'pong': PongGame,
  'tetris': TetrisGame,
  'breakout': BreakoutGame,
  'memory': MemoryGame,
  'rpg': RPGGame,
  'everest': EverestGame,
  'kathmandu': KathmanduGame,
  'temple': TempleGame,
};

// Game metadata
export const gameMetadata = {
  'snake': {
    title: 'Snake Classic',
    description: 'The classic snake game. Eat food, grow longer, and avoid walls and your own tail. Use arrow keys or WASD.',
    thumbnail_url: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
    category: 'arcade',
    is_premium: false,
    price: null,
  },
  'pong': {
    title: 'Pong Retro',
    description: 'Classic Pong game. Play against the computer. Use arrow keys or W/S to control your paddle.',
    thumbnail_url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
    category: 'arcade',
    is_premium: false,
    price: null,
  },
  'tetris': {
    title: 'Tetris Classic',
    description: 'The legendary puzzle game. Arrange falling blocks to clear lines and score points. Use arrow keys to move and rotate.',
    thumbnail_url: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg',
    category: 'puzzle',
    is_premium: false,
    price: null,
  },
  'breakout': {
    title: 'Breakout Arcade',
    description: 'Smash through colorful blocks with your paddle and ball. Don\'t let the ball fall! Use arrow keys to control.',
    thumbnail_url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
    category: 'arcade',
    is_premium: false,
    price: null,
  },
  'memory': {
    title: 'Memory Match',
    description: 'Test your memory by matching pairs of cards. Find all matches to win! Click cards to flip them.',
    thumbnail_url: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
    category: 'puzzle',
    is_premium: false,
    price: null,
  },
  'rpg': {
    title: 'Pixel Adventure',
    description: 'A simple RPG adventure game. Explore the world, collect items, and battle monsters. Use WASD to move.',
    thumbnail_url: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg',
    category: 'action',
    is_premium: true,
    price: 4.99,
  },
  'everest': {
    title: 'Everest Climb',
    description: 'Climb Mount Everest! Navigate through treacherous terrain, manage oxygen levels, and reach the summit. Use arrow keys.',
    thumbnail_url: 'https://images.pexels.com/photos/1367192/pexels-photo-1367192.jpeg',
    category: 'adventure',
    is_premium: true,
    price: 7.99,
  },
  'kathmandu': {
    title: 'Kathmandu Maze',
    description: 'Navigate through the ancient streets of Kathmandu. Find hidden temples and avoid obstacles in this cultural maze adventure.',
    thumbnail_url: 'https://images.pexels.com/photos/1367192/pexels-photo-1367192.jpeg',
    category: 'puzzle',
    is_premium: true,
    price: 5.99,
  },
  'temple': {
    title: 'Nepali Temple Puzzle',
    description: 'Solve ancient puzzles in beautiful Nepali temples. Match patterns, unlock secrets, and discover hidden treasures.',
    thumbnail_url: 'https://images.pexels.com/photos/1367192/pexels-photo-1367192.jpeg',
    category: 'puzzle',
    is_premium: true,
    price: 6.99,
  },
};

export { SnakeGame, PongGame, TetrisGame, BreakoutGame, MemoryGame, RPGGame, EverestGame, KathmanduGame, TempleGame }; 