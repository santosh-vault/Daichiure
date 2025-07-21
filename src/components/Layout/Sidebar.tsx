import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const categories = [
  { name: 'Arcade', slug: 'arcade', icon: '🎮' },
  { name: 'Puzzle', slug: 'puzzle', icon: '🧩' },
  { name: 'Action', slug: 'action', icon: '⚔️' },
  { name: 'Adventure', slug: 'adventure', icon: '🗺️' },
  { name: 'Sports', slug: 'sports', icon: '🏆' },
  { name: 'Building', slug: 'building', icon: '🏗️' },
  { name: 'Card', slug: 'card', icon: '🃏' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selected = params.get('category');
  const [expanded, setExpanded] = useState(false); // default to collapsed

  useEffect(() => {
    const handler = (e: any) => {
      if (typeof e.detail === 'boolean') {
        setExpanded(e.detail);
      }
    };
    window.addEventListener('sidebar-toggle', handler);
    return () => window.removeEventListener('sidebar-toggle', handler);
  }, []);

  return (
    <aside className={`fixed top-20 left-0 h-[calc(100vh-5rem)] z-40 hidden md:flex flex-col py-6 px-2 gap-2 shadow-xl bg-gradient-to-b from-gray-950/95 to-gray-900/95 border-r border-gray-800 transition-all duration-300 ${expanded ? 'w-56' : 'w-16 px-0'} ${expanded ? 'opacity-100 pointer-events-auto' : 'opacity-90 pointer-events-auto'}`}>
      <div className="flex flex-col gap-2">
        <button
          className="flex items-center justify-center w-10 h-10 rounded-lg mb-2 ml-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-amber-400 transition-all duration-200 shadow-lg"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {expanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        {expanded && <h2 className="text-lg font-bold text-amber-400 mb-4 px-4">Categories</h2>}
        <nav className="flex flex-col gap-2">
          {categories.map(cat => (
            <Link
              key={cat.slug}
              to={`/categories?category=${cat.slug}`}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-all font-medium text-gray-300 hover:text-amber-400 hover:bg-gray-800/60 ${selected === cat.slug ? 'bg-gray-800/80 text-amber-400 font-bold border-l-4 border-amber-400' : ''}`}
              style={{ pointerEvents: expanded ? 'auto' : 'none' }}
            >
              <span className="text-xl flex-shrink-0 w-8 text-center">{cat.icon}</span>
              {expanded && <span className="whitespace-nowrap">{cat.name}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}; 