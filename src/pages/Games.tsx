import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import AdSense from '../components/AdSense';
import { games } from '../data/games';
import { GameCard } from '../components/GameCard';
import { Helmet } from 'react-helmet-async';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export const Games: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: 'Arcade', slug: 'arcade' },
    { id: 2, name: 'Puzzle', slug: 'puzzle' },
    { id: 3, name: 'Action', slug: 'action' },
    { id: 4, name: 'Adventure', slug: 'adventure' },
    { id: 5, name: 'Sports', slug: 'sports' },
    { id: 6, name: 'Building', slug: 'building' },
    { id: 7, name: 'Card', slug: 'card' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchParams] = useSearchParams();
  const { trackEvent } = useGoogleAnalytics();

  // Custom order for the first 8 games (2 rows of 4)
  const customOrder = [
    'freefire', 'shooter', 'towerstack', 'allofaredead', // 1st row
    'snake', 'pong', 'tetris', 'breakout',              // 2nd row
  ];

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Reorder games: custom order first, then the rest
  const orderedGames = [
    ...customOrder
      .map(slug => filteredGames.find(g => g.slug === slug))
      .filter(Boolean) as typeof games,
    ...filteredGames.filter(game => !customOrder.includes(game.slug))
  ];

  return (
    <>
      <Helmet>
        <title>All Games | PlayHub</title>
        <meta name="description" content="Browse and play a huge collection of free Nepali and 2D games online. Action, puzzle, sports, and more!" />
        <meta name="keywords" content="Nepali games, free games, 2D games, online games, play games, browser games, arcade, puzzle, action, sports" />
        <meta property="og:title" content="Games | Play Free 2D Browser Games | Nepali Games" />
        <meta property="og:description" content="Browse and play a huge collection of free Nepali and 2D games online. Action, puzzle, sports, and more!" />
        <meta property="og:image" content="https://yourdomain.com/og-image.png" />
      </Helmet>
      <div className="min-h-screen bg-gray-950 font-inter text-gray-100 antialiased py-8">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="games-heading">
          {/* Header and Filters Row */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-6">
            {/* Heading on the left */}
            <div className="flex-1">
              <h1 id="games-heading" className="text-4xl sm:text-5xl font-bold font-['Orbitron'] text-amber-400 mb-2 drop-shadow-md text-left">
                Game Library
              </h1>
            </div>
            {/* Filters on the right */}
            <div className="flex flex-col sm:flex-row gap-3 items-end w-full md:w-auto md:ml-8">
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value) {
                      trackEvent('game_search', 'engagement', e.target.value);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-base"
                />
              </div>
              <div className="relative w-full sm:w-44">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    if (e.target.value) {
                      trackEvent('game_filter', 'engagement', e.target.value);
                    }
                  }}
                  className="w-full pl-10 pr-8 py-2 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-800 text-gray-100 appearance-none text-base"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Games Grid */}
          <section aria-label="Games Grid">
            {orderedGames.length === 0 ? (
              <div className="text-center py-20 bg-gray-900 rounded-xl shadow-xl border border-gray-800">
                <div className="text-gray-600 mb-6">
                  <Search className="h-20 w-20 mx-auto text-gray-700" />
                </div>
                <h2 className="text-3xl font-bold font-['Orbitron'] text-amber-400 mb-4">No games found</h2>
                <p className="text-xl text-gray-400">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              <>
                {/* AdSense Banner - Top of Games Grid */}
                <AdSense 
                  adSlot="5566778899" 
                  className="mb-8"
                  style={{ minHeight: '90px' }}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {orderedGames.map((game) => (
                    <Link
                      key={game.slug}
                      to={`/games/${game.slug}`}
                      className="block"
                    >
                      <GameCard game={game} />
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>
        </section>
      </div>
    </>
  );
};