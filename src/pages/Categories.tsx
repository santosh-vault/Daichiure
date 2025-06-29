import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Grid, List, Crown, Play } from 'lucide-react';
import { gameMetadata } from '../games';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';

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
  description: string;
  icon: string;
  gameCount: number;
}

export const Categories: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { hasActiveSubscription } = useSubscription();

  useEffect(() => {
    loadData();
    
    // Set initial category from URL params
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const loadData = () => {
    // Load all games from gameMetadata
    const allGames: Game[] = Object.entries(gameMetadata).map(([slug, metadata], index) => ({
      id: index + 1,
      title: metadata.title,
      description: metadata.description,
      thumbnail_url: metadata.thumbnail_url,
      slug: slug,
      is_premium: metadata.is_premium,
      price: metadata.price,
      category: {
        name: metadata.category.charAt(0).toUpperCase() + metadata.category.slice(1),
        slug: metadata.category
      }
    }));

    setGames(allGames);

    // Create categories with game counts
    const categoryMap = new Map<string, number>();
    allGames.forEach(game => {
      const count = categoryMap.get(game.category.slug) || 0;
      categoryMap.set(game.category.slug, count + 1);
    });

    const categoryData: Category[] = [
      {
        id: 1,
        name: 'Arcade',
        slug: 'arcade',
        description: 'Classic arcade games with fast-paced action',
        icon: '🎮',
        gameCount: categoryMap.get('arcade') || 0
      },
      {
        id: 2,
        name: 'Puzzle',
        slug: 'puzzle',
        description: 'Brain-teasing puzzles and strategy games',
        icon: '🧩',
        gameCount: categoryMap.get('puzzle') || 0
      },
      {
        id: 3,
        name: 'Action',
        slug: 'action',
        description: 'High-energy action and adventure games',
        icon: '⚔️',
        gameCount: categoryMap.get('action') || 0
      },
      {
        id: 4,
        name: 'Adventure',
        slug: 'adventure',
        description: 'Epic adventures and exploration games',
        icon: '🗺️',
        gameCount: categoryMap.get('adventure') || 0
      }
    ];

    setCategories(categoryData);
    setLoading(false);
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || game.category.slug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const canPlayGame = (game: Game) => {
    return !game.is_premium || hasActiveSubscription();
  };

  const getCategoryStats = () => {
    const totalGames = games.length;
    const freeGames = games.filter(game => !game.is_premium).length;
    const premiumGames = games.filter(game => game.is_premium).length;
    const categoriesCount = categories.length;

    return { totalGames, freeGames, premiumGames, categoriesCount };
  };

  const stats = getCategoryStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

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
                className={`
                  bg-gray-900 rounded-xl p-6 cursor-pointer transition-all duration-300 border-2
                  ${selectedCategory === category.slug 
                    ? 'border-amber-500 shadow-[0_0_20px_rgba(255,215,0,0.3)]' 
                    : 'border-gray-800 hover:border-gray-700'
                  }
                  hover:shadow-lg hover:scale-105
                `}
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-bold text-amber-400 mb-2">{category.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{category.gameCount} games</span>
                  {selectedCategory === category.slug && (
                    <span className="text-amber-400 text-sm">✓ Selected</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-amber-400">
              {selectedCategory ? `${categories.find(c => c.slug === selectedCategory)?.name} Games` : 'All Games'}
            </h2>
            <span className="text-gray-400">{filteredGames.length} games found</span>
          </div>

          {filteredGames.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">No games found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {filteredGames.map((game) => (
                <div
                  key={game.id}
                  className={`
                    group relative bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-800 cursor-pointer
                    ${viewMode === 'list' ? 'flex items-center p-4' : ''}
                    hover:shadow-[0_0_25px_rgba(255,215,0,0.3)] transition-all duration-300
                  `}
                >
                  <div className={viewMode === 'list' ? 'flex-shrink-0 mr-4' : ''}>
                    <img
                      src={game.thumbnail_url}
                      alt={game.title}
                      className={`object-cover transition-all duration-300 group-hover:scale-105 ${
                        viewMode === 'list' ? 'w-24 h-24 rounded-lg' : 'w-full h-48'
                      }`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/400x200/5C4033/FFD700?text=${encodeURIComponent(game.title)}`;
                      }}
                    />
                  </div>

                  <div className={viewMode === 'list' ? 'flex-1' : 'p-6'}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-bold text-amber-400 ${viewMode === 'list' ? 'text-lg' : 'text-xl'}`}>
                        {game.title}
                      </h3>
                      {game.is_premium && (
                        <Crown className="h-5 w-5 text-amber-400 flex-shrink-0 ml-2" />
                      )}
                    </div>

                    <p className={`text-gray-400 mb-4 ${viewMode === 'list' ? 'text-sm' : 'text-base'}`}>
                      {game.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
                        {game.category.name}
                      </span>
                      {game.is_premium && game.price && (
                        <span className="text-sm font-bold text-amber-400">
                          ${game.price}
                        </span>
                      )}
                    </div>

                    {viewMode === 'list' && (
                      <div className="mt-4">
                        <Link
                          to={`/games/${game.slug}`}
                          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            canPlayGame(game)
                              ? 'bg-amber-500 text-gray-900 hover:bg-amber-600'
                              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Play className="h-4 w-4" />
                          <span>{canPlayGame(game) ? 'Play Now' : 'Subscribe to Play'}</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Grid view overlay */}
                  {viewMode === 'grid' && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Link
                        to={`/games/${game.slug}`}
                        className={`bg-amber-500 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center space-x-2 ${
                          !canPlayGame(game) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Play className="h-5 w-5" />
                        <span>{canPlayGame(game) ? 'Play Now' : 'Subscribe to Play'}</span>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back to Games */}
        <div className="text-center">
          <Link
            to="/games"
            className="inline-flex items-center space-x-2 bg-gray-800 text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            <span>Back to All Games</span>
          </Link>
        </div>
      </div>
    </div>
  );
}; 