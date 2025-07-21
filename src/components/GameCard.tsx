import React from 'react';
import { GameThumbnail } from './GameThumbnail';
import { Play, Star, Crown } from 'lucide-react';

// Declare global gtag function
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

interface GameCardProps {
  game: {
    slug: string;
    title: string;
    is_premium: boolean;
    price: number | null;
    category: string;
  };
  onClick?: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
  const handleClick = () => {
    // Track game click
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'game_click', {
        event_category: 'engagement',
        event_label: game.title,
        value: game.is_premium ? 1 : 0
      });
    }
    if (onClick) onClick();
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-2xl cursor-pointer animate-fade-in-scale hover-lift"
      onClick={handleClick}
    >
      {/* Enhanced Card Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-white/10 rounded-2xl transition-all duration-300 group-hover:border-amber-400/30 group-hover:shadow-2xl group-hover:shadow-amber-500/20"></div>
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 via-amber-400/0 to-amber-400/0 rounded-2xl transition-all duration-500 group-hover:from-amber-400/5 group-hover:via-amber-400/10 group-hover:to-amber-400/5"></div>
      {/* Content */}
      <div className="relative z-10">
        {/* Thumbnail Container with floating category */}
        <div className="relative overflow-hidden rounded-t-2xl">
          {/* Category Tag Floating */}
          <span className="absolute top-3 left-3 z-20 bg-gradient-to-r from-gray-900/90 to-gray-800/90 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold shadow-lg capitalize border border-amber-400">
            {game.category}
          </span>
          <GameThumbnail slug={game.slug} alt={game.title} />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
              <div className="bg-amber-500 text-gray-900 p-3 rounded-full shadow-lg">
                <Play className="h-6 w-6" />
              </div>
            </div>
          </div>
          {/* Premium Badge */}
          {game.is_premium && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg z-20">
              <Crown className="h-3 w-3" />
              <span>Premium</span>
            </div>
          )}
          {/* Price Badge */}
          {game.price && (
            <div className="absolute top-10 right-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-20">
              ${game.price.toFixed(2)}
            </div>
          )}
        </div>
        {/* Card Content */}
        <div className="p-3 flex flex-col items-start">
          {/* Title */}
          <h3 className="text-base font-semibold text-white mb-1 group-hover:text-amber-400 transition-colors duration-300 truncate w-full">
            {game.title}
          </h3>
          {/* Play Button */}
          <button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 px-4 py-2 rounded-xl font-bold text-xs hover:from-amber-400 hover:to-amber-500 transition-all duration-300 transform group-hover:scale-105 flex items-center justify-center space-x-2 shadow-lg group-hover:shadow-xl group-hover:shadow-amber-500/25 mt-1">
            <Play className="h-4 w-4" />
            <span>Play Now</span>
          </button>
        </div>
      </div>
      {/* Hover Border Animation */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-amber-400/20 transition-all duration-300"></div>
    </div>
  );
}; 