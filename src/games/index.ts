import { SnakeGame } from './Snake';
import { PongGame } from './Pong';
import { TetrisGame } from './Tetris';
import { BreakoutGame } from './Breakout';
import { MemoryGame } from './Memory';
import { RPGGame } from './RPG';

import { KathmanduGame } from './Kathmandu';
import { TempleGame } from './Temple';
import Runner from './Runner';
import Football from './Football';
import Shooter from './Shooter';
import Fighter from './Fighter';
import HouseBuilder from './HouseBuilder';
import FreeFireGame from './FreeFire';
import AmongImposterGame from './AmongImposter';
import AllOfUsAreDead from './AllOfUsAreDead';
import TowerStackGame from './TowerStackGame';
import Uno from './Uno';
// Game component mapping
export const gameComponents: Record<string, React.ComponentType> = {
  'freefire': FreeFireGame,
  'amongimposter': AmongImposterGame,
  'shooter': Shooter,
  'snake': SnakeGame,
  'pong': PongGame,
  'tetris': TetrisGame,
  'breakout': BreakoutGame,
  'memory': MemoryGame,
  'rpg': RPGGame,
  'kathmandu': KathmanduGame,
  'temple': TempleGame,
  'runner': Runner,
  'football': Football,
  'fighter': Fighter,
  'housebuilder': HouseBuilder,
  'allofaredead': AllOfUsAreDead,
  'towerstack': TowerStackGame,
  'uno': Uno,
};

export { Fighter, Shooter, Football, Runner, SnakeGame, PongGame, TetrisGame, BreakoutGame, MemoryGame, RPGGame, KathmanduGame, TempleGame, AllOfUsAreDead, TowerStackGame, Uno }; 