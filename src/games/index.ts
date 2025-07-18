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
// @ts-ignore
import TowerStackGame from './TowerStackGame';
import Uno from './Uno';
import SquidGame from './SquidGame';
import GameMonetizeVCECGONB from './GameMonetizeVCECGONB';
import GameMonetizeZT2TTI9K from './GameMonetizeZT2TTI9K';
import GameMonetizeFXZSXWYI from './GameMonetizeFXZSXWYI';
import GameMonetize77B5MBMQ from './GameMonetize77B5MBMQ';
import GameMonetizeRC0APTUU from './GameMonetizeRC0APTUU';
import GameMonetizeQKQLHH9C from './GameMonetizeQKQLHH9C';
import GameMonetize9PTV2PBY from './GameMonetize9PTV2PBY';
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
  'squidgame': SquidGame,
  'vcecgonb': GameMonetizeVCECGONB,
  'zt2tti9k': GameMonetizeZT2TTI9K,
  'fxzsxwyi': GameMonetizeFXZSXWYI,
  '77b5mbmq': GameMonetize77B5MBMQ,
  'rc0aptuu': GameMonetizeRC0APTUU,
  'qkqlhh9c': GameMonetizeQKQLHH9C,
  '9ptv2pby': GameMonetize9PTV2PBY,
};

export { Fighter, Shooter, Football, Runner, SnakeGame, PongGame, TetrisGame, BreakoutGame, MemoryGame, RPGGame, KathmanduGame, TempleGame, AllOfUsAreDead, TowerStackGame, Uno }; 