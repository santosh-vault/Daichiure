import { SnakeGame } from './Snake';
import { PongGame } from './Pong';
import { TetrisGame } from './Tetris';
import { BreakoutGame } from './Breakout';
import { MemoryGame } from './Memory';
import { RPGGame } from './RPG';
import { EverestGame } from './Everest';
import { KathmanduGame } from './Kathmandu';
import { TempleGame } from './Temple';
import Runner from './Runner';
import Football from './Football';
import Shooter from './Shooter';
import Fighter from './Fighter';
import HouseBuilder from './HouseBuilder';

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
  'runner': Runner,
  'football': Football,
  'shooter': Shooter,
  'fighter': Fighter,
  'housebuilder': HouseBuilder,
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
  'runner': {
    title: 'Nepali Runner',
    description: 'Run, jump, and dodge obstacles in a vibrant Nepali landscape! Use Space or Up Arrow to jump. Avoid obstacles and score high!',
    thumbnail_url: 'https://images.pexels.com/photos/1367192/pexels-photo-1367192.jpeg',
    category: 'arcade',
    is_premium: false,
    price: null,
  },
  'football': {
    title: 'Football Frenzy',
    description: 'A fast-paced 2D football game! Move, dribble, and score against the AI. Use Arrow keys/WASD to move, Space to kick.',
    thumbnail_url: 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg',
    category: 'sports',
    is_premium: false,
    price: null,
  },
  'shooter': {
    title: 'Urban Shooter',
    description: 'A realistic 2D top-down shooting game. Move, aim, shoot, and complete challenges in an urban environment!',
    thumbnail_url: 'https://images.pexels.com/photos/301977/pexels-photo-301977.jpeg',
    category: 'action',
    is_premium: false,
    price: null,
  },
  'fighter': {
    title: 'Stickman Fighter',
    description: 'Epic 2D fighting game with stickman characters! Fight against AI with punches, kicks, blocks, and special moves. Win 2 out of 3 rounds!',
    thumbnail_url: 'https://images.pexels.com/photos/301977/pexels-photo-301977.jpeg',
    category: 'action',
    is_premium: false,
    price: null,
  },
  'housebuilder': {
    title: 'House Builder',
    description: 'Build your dream house with blocks and materials. Use your creativity and skills to design and construct your home.',
    thumbnail_url: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg',
    category: 'building',
    is_premium: false,
    price: null,
  },
};

export { Fighter, Shooter, Football, Runner, SnakeGame, PongGame, TetrisGame, BreakoutGame, MemoryGame, RPGGame, EverestGame, KathmanduGame, TempleGame }; 