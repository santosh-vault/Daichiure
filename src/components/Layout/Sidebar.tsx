import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const categories = [
  { name: "Arcade", slug: "arcade", icon: "🎮" },
  { name: "Puzzle", slug: "puzzle", icon: "🧩" },
  { name: "Action", slug: "action", icon: "⚔️" },
  { name: "Adventure", slug: "adventure", icon: "🗺️" },
  { name: "Sports", slug: "sports", icon: "🏆" },
  { name: "Building", slug: "building", icon: "🏗️" },
  { name: "Card", slug: "card", icon: "🃏" },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selected =
    location.pathname === "/games" ? params.get("category") : null;
  const [expanded, setExpanded] = useState(false); // default to collapsed

  const handleMouseEnter = () => {
    setExpanded(true);
  };

  const handleMouseLeave = () => {
    setExpanded(false);
  };

  return (
    <aside
      className={`fixed top-20 left-0 h-[calc(100vh-5rem)] z-40 hidden md:flex flex-col py-6 px-2 gap-2 shadow-xl bg-gradient-to-b from-gray-950/95 to-gray-900/95 border-r border-gray-800 transition-all duration-300 ${
        expanded ? "w-56" : "w-16 px-0"
      } ${
        expanded
          ? "opacity-100 pointer-events-auto"
          : "opacity-90 pointer-events-auto"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col gap-2">
        {expanded && (
          <h2 className="text-lg font-bold text-amber-400 mb-4 px-4">
            Categories
          </h2>
        )}
        <nav className="flex flex-col gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/games?category=${cat.slug}`}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-all font-medium text-gray-300 hover:text-amber-400 hover:bg-gray-800/60 ${
                selected === cat.slug
                  ? "bg-gray-800/80 text-amber-400 font-bold border-l-4 border-amber-400"
                  : ""
              }`}
            >
              <span className="text-xl flex-shrink-0 w-8 text-center">
                {cat.icon}
              </span>
              {expanded && (
                <span className="whitespace-nowrap">{cat.name}</span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};
