import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Grid, List } from 'lucide-react';
import { games } from '../data/games';
import { GameCard } from '../components/GameCard';
import { useSubscription } from '../hooks/useSubscription';

interface Game {
  slug: string;
  title: string;
  description: string;
  is_premium: boolean;
  price: number | null;
  category: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  gameCount: number;
}

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([{
    id: 1, name: 'Arcade', slug: 'arcade', description: 'Classic arcade games with fast-paced action', icon: '🎮', gameCount: 0
  },{
    id: 2, name: 'Puzzle', slug: 'puzzle', description: 'Brain-teasing puzzles and strategy games', icon: '🧩', gameCount: 0
  },{
    id: 3, name: 'Action', slug: 'action', description: 'High-energy action and adventure games', icon: '⚔️', gameCount: 0
  },{
    id: 4, name: 'Adventure', slug: 'adventure', description: 'Epic adventures and exploration games', icon: '🗺️', gameCount: 0
  },{
    id: 5, name: 'Sports', slug: 'sports', description: 'Sports and competition games', icon: '🏆', gameCount: 0
  },{
    id: 6, name: 'Building', slug: 'building', description: 'Building and creative games', icon: '🏗️', gameCount: 0
  }]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { hasActiveSubscription } = useSubscription();

  // Update category game counts
  React.useEffect(() => {
    const categoryMap = new Map<string, number>();
    games.forEach(game => {
      const count = categoryMap.get(game.category) || 0;
      categoryMap.set(game.category, count + 1);
    });
    setCategories(prev => prev.map(cat => ({ ...cat, gameCount: categoryMap.get(cat.slug) || 0 })));
  }, []);

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryStats = () => {
    const totalGames = games.length;
    const freeGames = games.filter(game => !game.is_premium).length;
    const premiumGames = games.filter(game => game.is_premium).length;
    const categoriesCount = categories.length;
    return { totalGames, freeGames, premiumGames, categoriesCount };
  };

  const stats = getCategoryStats();

  return (
    <div className="min-h-screen bg-gray-950 font-inter text-gray-100 antialiased py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold font-bruno-ace text-amber-400 mb-4 drop-shadow-md">
            Game Categories
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Explore games by category and discover your next favorite
          </p>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 text-center border border-gray-800">
            <div className="text-2xl font-bold text-amber-400">{stats.totalGames}</div>
            <div className="text-sm text-gray-400">Total Games</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center border border-gray-800">
            <div className="text-2xl font-bold text-green-400">{stats.freeGames}</div>
            <div className="text-sm text-gray-400">Free Games</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center border border-gray-800">
            <div className="text-2xl font-bold text-purple-400">{stats.premiumGames}</div>
            <div className="text-sm text-gray-400">Premium Games</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center border border-gray-800">
            <div className="text-2xl font-bold text-blue-400">{stats.categoriesCount}</div>
            <div className="text-sm text-gray-400">Categories</div>
          </div>
        </div>
        {/* Categories Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-amber-400 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(selectedCategory === category.slug ? '' : category.slug)}
                className={
                  `bg-gray-900 rounded-xl p-6 cursor-pointer transition-all duration-300 border-2
                  ${selectedCategory === category.slug 
                    ? 'border-amber-500 shadow-[0_0_20px_rgba(255,215,0,0.3)]' 
                    : 'border-gray-800 hover:border-gray-700'}
                  hover:shadow-lg hover:scale-105`
                }
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-bold text-amber-400 mb-2">{category.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{category.gameCount} games</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Search and View Mode */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="flex-1 relative w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-6 w-6" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-lg"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`p-2 rounded-lg border ${viewMode === 'grid' ? 'bg-amber-500 text-gray-900 border-amber-500' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              className={`p-2 rounded-lg border ${viewMode === 'list' ? 'bg-amber-500 text-gray-900 border-amber-500' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
        {/* Games Grid/List */}
        {filteredGames.length === 0 ? (
          <div className="text-center py-20 bg-gray-900 rounded-xl shadow-xl border border-gray-800">
            <div className="text-gray-600 mb-6">
              <Search className="h-20 w-20 mx-auto text-gray-700" />
            </div>
            <h3 className="text-3xl font-bold font-bruno-ace text-amber-400 mb-4">No games found</h3>
            <p className="text-xl text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <Link
                key={game.slug}
                to={`/games/${game.slug}`}
                className="block"
              >
                <GameCard game={game} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredGames.map((game) => (
              <Link
                key={game.slug}
                to={`/games/${game.slug}`}
                className="block"
              >
                <GameCard game={game} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 