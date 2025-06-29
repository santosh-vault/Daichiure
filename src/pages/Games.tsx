import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Play, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Game {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  slug: string;
  is_premium: boolean;
  price: number | null;
  category: {
    name: string;
    slug: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export const Games: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = () => {
    // Use hardcoded games for immediate display
    const localGames: Game[] = [
      {
        id: 1,
        title: 'Snake Classic',
        description: 'The classic snake game. Eat food, grow longer, and avoid walls and your own tail. Use arrow keys or WASD.',
        thumbnail_url: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
        slug: 'snake',
        is_premium: false,
        price: null,
        category: { name: 'Arcade', slug: 'arcade' },
      },
      {
        id: 2,
        title: 'Pong Retro',
        description: 'Classic Pong game. Play against the computer. Use arrow keys or W/S to control your paddle.',
        thumbnail_url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
        slug: 'pong',
        is_premium: false,
        price: null,
        category: { name: 'Arcade', slug: 'arcade' },
      },
      {
        id: 3,
        title: 'Tetris Classic',
        description: 'The legendary puzzle game. Arrange falling blocks to clear lines and score points. Use arrow keys to move and rotate.',
        thumbnail_url: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg',
        slug: 'tetris',
        is_premium: false,
        price: null,
        category: { name: 'Puzzle', slug: 'puzzle' },
      },
      {
        id: 4,
        title: 'Breakout Arcade',
        description: 'Smash through colorful blocks with your paddle and ball. Don\'t let the ball fall! Use arrow keys to control.',
        thumbnail_url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
        slug: 'breakout',
        is_premium: false,
        price: null,
        category: { name: 'Arcade', slug: 'arcade' },
      },
      {
        id: 5,
        title: 'Memory Match',
        description: 'Test your memory by matching pairs of cards. Find all matches to win! Click cards to flip them.',
        thumbnail_url: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
        slug: 'memory',
        is_premium: false,
        price: null,
        category: { name: 'Puzzle', slug: 'puzzle' },
      },
      {
        id: 6,
        title: 'Pixel Adventure',
        description: 'A simple RPG adventure game. Explore the world, collect items, and battle monsters. Use WASD to move.',
        thumbnail_url: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg',
        slug: 'rpg',
        is_premium: true,
        price: 4.99,
        category: { name: 'Action', slug: 'action' },
      },
      {
        id: 7,
        title: 'Everest Climb',
        description: 'Climb Mount Everest! Navigate through treacherous terrain, manage oxygen levels, and reach the summit. Use arrow keys.',
        thumbnail_url: 'https://images.pexels.com/photos/1367192/pexels-photo-1367192.jpeg',
        slug: 'everest',
        is_premium: true,
        price: 7.99,
        category: { name: 'Adventure', slug: 'adventure' },
      },
      {
        id: 8,
        title: 'Kathmandu Maze',
        description: 'Navigate through the ancient streets of Kathmandu. Find hidden temples and avoid obstacles in this cultural maze adventure.',
        thumbnail_url: 'https://images.pexels.com/photos/1367192/pexels-photo-1367192.jpeg',
        slug: 'kathmandu',
        is_premium: true,
        price: 5.99,
        category: { name: 'Puzzle', slug: 'puzzle' },
      },
      {
        id: 9,
        title: 'Nepali Temple Puzzle',
        description: 'Solve ancient puzzles in beautiful Nepali temples. Match patterns, unlock secrets, and discover hidden treasures.',
        thumbnail_url: 'https://images.pexels.com/photos/1367192/pexels-photo-1367192.jpeg',
        slug: 'temple',
        is_premium: true,
        price: 6.99,
        category: { name: 'Puzzle', slug: 'puzzle' },
      },
    ];
    setGames(localGames);
    setCategories([
      { id: 1, name: 'Arcade', slug: 'arcade' },
      { id: 2, name: 'Puzzle', slug: 'puzzle' },
      { id: 3, name: 'Action', slug: 'action' },
      { id: 4, name: 'Adventure', slug: 'adventure' },
    ]);
    setLoading(false);
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || game.category.slug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-950 font-inter text-gray-100 antialiased py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold font-['Orbitron'] text-amber-400 mb-4 drop-shadow-md">
            Game Library
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-6">
            Discover and play amazing HTML5 games right in your browser
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/categories"
              className="inline-flex items-center space-x-2 bg-gray-800 text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-700 hover:text-amber-400 transition-colors border border-gray-700"
            >
              <span>Browse by Category</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-2xl shadow-xl p-6 mb-12 border border-gray-800">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search */}
            <div className="flex-1 relative w-full lg:w-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-6 w-6" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-lg"
              />
            </div>

            {/* Category Filter */}
            <div className="relative w-full lg:w-auto">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-6 w-6" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-800 text-gray-100 appearance-none min-w-[200px] text-lg"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="fill-current h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-xl shadow-xl overflow-hidden animate-pulse border border-gray-700">
                <div className="bg-gray-700 h-56 rounded-t-xl"></div>
                <div className="p-6">
                  <div className="h-7 bg-gray-700 rounded mb-3"></div>
                  <div className="h-5 bg-gray-700 rounded mb-5 w-4/5"></div>
                  <div className="h-12 bg-gray-700 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-20 bg-gray-900 rounded-xl shadow-xl border border-gray-800">
            <div className="text-gray-600 mb-6">
              <Search className="h-20 w-20 mx-auto text-gray-700" />
            </div>
            <h3 className="text-3xl font-bold font-['Orbitron'] text-amber-400 mb-4">No games found</h3>
            <p className="text-xl text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <Link
                key={game.id}
                to={`/games/${game.slug}`}
                className="block"
              >
                <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden hover:shadow-[0_0_25px_rgba(255,215,0,0.3)] transition-all duration-300 ease-in-out transform hover:scale-105 border border-gray-700 group cursor-pointer">
                  <div className="relative">
                    <img
                      src={game.thumbnail_url}
                      alt={game.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {game.is_premium && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-amber-600 text-gray-950 px-2 py-1 rounded-full text-xs font-bold shadow-md">
                        Premium
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {game.is_premium && !user ? (
                          <div className="bg-gray-800/90 text-gray-100 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 border border-gray-600">
                            <Lock className="h-4 w-4" />
                            <span>Sign in to play</span>
                          </div>
                        ) : (
                          <div className="bg-gray-800/90 text-gray-100 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 border border-gray-600">
                            <Play className="h-4 w-4" />
                            <span>Play Now</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold font-bruno-ace text-amber-400 truncate">{game.title}</h3>
                      <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                        {game.category.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{game.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="bg-gradient-to-r from-amber-500 to-amber-700 text-gray-950 px-3 py-2 rounded-lg text-sm font-bold hover:shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center space-x-1">
                        <Play className="h-3 w-3" />
                        <span>Play</span>
                      </div>
                      {game.is_premium && game.price && (
                        <span className="text-sm font-bold text-green-400">
                          ${game.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};