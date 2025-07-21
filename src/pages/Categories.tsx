import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { games } from '../data/games';
import { GameCard } from '../components/GameCard';
import { useSubscription } from '../hooks/useSubscription';
import { Helmet } from 'react-helmet-async';

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
  const location = useLocation();

  // Sync selectedCategory with URL query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category') || '';
    setSelectedCategory(cat);
    setSearchTerm(''); // Reset search bar when category changes
  }, [location.search]);

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

  // On mount, expand the sidebar if on categories page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: true }));
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Game Categories | PlayHub</title>
        <meta name="description" content="Explore and discover games by category. Find your favorite Nepali and 2D games by genre, type, and more!" />
        <meta name="keywords" content="game categories, Nepali games, 2D games, online games, puzzle, action, sports, adventure, arcade" />
        <meta property="og:title" content="Game Categories | Online 2D Browser Games | Nepali Games | No Download required" />
        <meta property="og:description" content="Explore and discover games by category. Find your favorite Nepali and 2D games by genre, type, and more!" />
        <meta property="og:image" content="https://yourdomain.com/og-image.png" />
      </Helmet>
      <div className="min-h-screen bg-gray-950 font-inter text-gray-100 antialiased py-8">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Only show games grid for selected category */}
          {filteredGames.length === 0 ? (
            <div className="text-center py-20 bg-gray-900 rounded-xl shadow-xl border border-gray-800">
              <h3 className="text-3xl font-bold font-bruno-ace text-amber-400 mb-4">No games found</h3>
              <p className="text-xl text-gray-400">
                Try selecting a different category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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
        </section>
      </div>
    </>
  );
}; 