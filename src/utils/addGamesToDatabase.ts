import { supabase } from '../lib/supabase';

// Game data to add to the database
const gamesToAdd = [
  {
    title: 'Snake Classic',
    slug: 'snake',
    description: 'The classic snake game. Eat food, grow longer, and avoid walls and your own tail. Use arrow keys or WASD.',
    thumbnail_url: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
    category_id: 1, // Arcade
    is_premium: false,
    price: null,
    game_data: 'snake'
  },
  {
    title: 'Pong Retro',
    slug: 'pong',
    description: 'Classic Pong game. Play against the computer. Use arrow keys or W/S to control your paddle.',
    thumbnail_url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
    category_id: 1, // Arcade
    is_premium: false,
    price: null,
    game_data: 'pong'
  },
  {
    title: 'Tetris Classic',
    slug: 'tetris',
    description: 'The legendary puzzle game. Arrange falling blocks to clear lines and score points. Use arrow keys to move and rotate.',
    thumbnail_url: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg',
    category_id: 2, // Puzzle
    is_premium: false,
    price: null,
    game_data: 'tetris'
  },
  {
    title: 'Breakout Arcade',
    slug: 'breakout',
    description: 'Smash through colorful blocks with your paddle and ball. Don\'t let the ball fall! Use arrow keys to control.',
    thumbnail_url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
    category_id: 1, // Arcade
    is_premium: false,
    price: null,
    game_data: 'breakout'
  },
  {
    title: 'Memory Match',
    slug: 'memory',
    description: 'Test your memory by matching pairs of cards. Find all matches to win! Click cards to flip them.',
    thumbnail_url: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
    category_id: 2, // Puzzle
    is_premium: false,
    price: null,
    game_data: 'memory'
  },
  {
    title: 'Pixel Adventure',
    slug: 'rpg',
    description: 'A simple RPG adventure game. Explore the world, collect items, and battle monsters. Use WASD to move.',
    thumbnail_url: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg',
    category_id: 3, // Action
    is_premium: true,
    price: 4.99,
    game_data: 'rpg'
  },
  {
    title: 'Everest Climb',
    slug: 'everest',
    description: 'Climb Mount Everest! Navigate through treacherous terrain, manage oxygen levels, and reach the summit. Use arrow keys.',
    thumbnail_url: 'https://images.pexels.com/photos/1367192/pexels-photo-1367192.jpeg',
    category_id: 4, // Adventure
    is_premium: true,
    price: 7.99,
    game_data: 'everest'
  },
  {
    title: 'Kathmandu Maze',
    slug: 'kathmandu',
    description: 'Navigate through the ancient streets of Kathmandu. Find hidden temples and avoid obstacles in this cultural maze adventure.',
    thumbnail_url: 'https://images.pexels.com/photos/1367192/pexels-photo-1367192.jpeg',
    category_id: 2, // Puzzle
    is_premium: true,
    price: 5.99,
    game_data: 'kathmandu'
  },
  {
    title: 'Nepali Temple Puzzle',
    slug: 'temple',
    description: 'Solve ancient puzzles in beautiful Nepali temples. Match patterns, unlock secrets, and discover hidden treasures.',
    thumbnail_url: 'https://images.pexels.com/photos/1367192/pexels-photo-1367192.jpeg',
    category_id: 2, // Puzzle
    is_premium: true,
    price: 6.99,
    game_data: 'temple'
  }
];

// Categories to add
const categoriesToAdd = [
  {
    name: 'Arcade',
    slug: 'arcade',
    description: 'Classic arcade-style games'
  },
  {
    name: 'Puzzle',
    slug: 'puzzle',
    description: 'Brain-teasing puzzle games'
  },
  {
    name: 'Action',
    slug: 'action',
    description: 'Fast-paced action games'
  },
  {
    name: 'Adventure',
    slug: 'adventure',
    description: 'Adventure and exploration games'
  }
];

export const addGamesToDatabase = async () => {
  try {
    console.log('Starting to add games to database...');

    // First, add categories
    console.log('Adding categories...');
    for (const category of categoriesToAdd) {
      const { data, error } = await supabase
        .from('categories')
        .upsert(category, { onConflict: 'slug' })
        .select();

      if (error) {
        console.error('Error adding category:', category.name, error);
      } else {
        console.log('Added category:', category.name);
      }
    }

    // Then, add games
    console.log('Adding games...');
    for (const game of gamesToAdd) {
      const { data, error } = await supabase
        .from('games')
        .upsert(game, { onConflict: 'slug' })
        .select();

      if (error) {
        console.error('Error adding game:', game.title, error);
      } else {
        console.log('Added game:', game.title);
      }
    }

    console.log('Finished adding games to database!');
    return true;
  } catch (error) {
    console.error('Error adding games to database:', error);
    return false;
  }
};

// Function to check if games exist
export const checkGamesInDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('title, slug')
      .limit(5);

    if (error) {
      console.error('Error checking games:', error);
      return false;
    }

    console.log('Games in database:', data);
    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking games:', error);
    return false;
  }
}; 