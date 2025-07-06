import React from 'react';
import { GameThumbnail } from './GameThumbnail';

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
    <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700 cursor-pointer" onClick={handleClick}>
    <GameThumbnail slug={game.slug} alt={game.title} />
    <div className="p-4 flex flex-col items-center">
      <h3 className="text-lg font-bold text-white mb-2">{game.title}</h3>
      {game.is_premium && (
        <div className="text-amber-400 font-bold text-xs mb-1">Premium</div>
      )}
      {game.price && (
        <div className="text-green-400 font-bold text-xs mb-1">${game.price.toFixed(2)}</div>
      )}
      <div className="text-xs text-gray-500 mb-3 capitalize">{game.category}</div>
      <button className="w-full bg-amber-500 text-gray-900 px-4 py-2 rounded-lg font-bold hover:bg-amber-600 transition-colors mt-auto">
        Play Now
      </button>
    </div>
  </div>
  );
}; 