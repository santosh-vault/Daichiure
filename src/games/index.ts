import { SnakeGame } from './Snake';
import { PongGame } from './Pong';
import { TetrisGame } from './Tetris';
import { BreakoutGame } from './Breakout';
import { MemoryGame } from './Memory';
import { RPGGame } from './RPG';

import { KathmanduGame } from './Kathmandu';
import { TempleGame } from './Temple';
import Football from './Football';
import Shooter from './Shooter';
import Fighter from './Fighter';
import FreeFireGame from './FreeFire';
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
import GameMonetizeC34ZURVG from './GameMonetizeC34ZURVG';
import GameMonetizeWKOKJ30H from './GameMonetizeWKOKJ30H';
import GameMonetizeD393RQDF from './GameMonetizeD393RQDF';
import GameMonetizeWR4S1BKZ from './GameMonetizeWR4S1BKZ';
// Game component mapping
export const gameComponents: Record<string, React.ComponentType> = {
  'freefire': FreeFireGame,
  'shooter': Shooter,
  'snake': SnakeGame,
  'pong': PongGame,
  'tetris': TetrisGame,
  'breakout': BreakoutGame,
  'memory': MemoryGame,
  'rpg': RPGGame,
  'kathmandu': KathmanduGame,
  'temple': TempleGame,
  'football': Football,
  'fighter': Fighter,
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
  'c34zurvg': GameMonetizeC34ZURVG,
  'wkokj30h': GameMonetizeWKOKJ30H,
  'd393rqdf': GameMonetizeD393RQDF,
  'wr4s1bkz': GameMonetizeWR4S1BKZ,
};

export { Fighter, Shooter, Football, SnakeGame, PongGame, TetrisGame, BreakoutGame, MemoryGame, RPGGame, KathmanduGame, TempleGame, AllOfUsAreDead, TowerStackGame, Uno, GameMonetizeC34ZURVG, GameMonetizeWKOKJ30H, GameMonetizeD393RQDF, GameMonetizeWR4S1BKZ }; 