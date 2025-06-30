import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Users, Trophy, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import "../App.css";

interface FeaturedGame {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  slug: string;
  is_premium: boolean;
  price: number | null;
}

export const Home: React.FC = () => {
  const [featuredGames, setFeaturedGames] = useState<FeaturedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show all local games including Snake, Pong, and new premium Nepali games
    setFeaturedGames([
      {
        id: 1,
        title: 'Snake Classic',
        description: 'The classic snake game. Eat food, grow longer, and avoid walls and your own tail. Use arrow keys or WASD.',
        thumbnail_url: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
        slug: 'snake',
        is_premium: false,
        price: null,
      },
      {
        id: 2,
        title: 'Pong Retro',
        description: 'Classic Pong game. Play against the computer. Use arrow keys or W/S to control your paddle.',
        thumbnail_url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
        slug: 'pong',
        is_premium: false,
        price: null,
      },
      {
        id: 3,
        title: 'Tetris Classic',
        description: 'The legendary puzzle game. Arrange falling blocks to clear lines and score points. Use arrow keys to move and rotate.',
        thumbnail_url: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg',
        slug: 'tetris',
        is_premium: false,
        price: null,
      },
      {
        id: 4,
        title: 'Breakout Arcade',
        description: 'Smash through colorful blocks with your paddle and ball. Don\'t let the ball fall! Use arrow keys to control.',
        thumbnail_url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
        slug: 'breakout',
        is_premium: false,
        price: null,
      },
      {
        id: 5,
        title: 'Memory Match',
        description: 'Test your memory by matching pairs of cards. Find all matches to win! Click cards to flip them.',
        thumbnail_url: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
        slug: 'memory',
        is_premium: false,
        price: null,
      },
      {
        id: 6,
        title: 'Pixel Adventure',
        description: 'A simple RPG adventure game. Explore the world, collect items, and battle monsters. Use WASD to move.',
        thumbnail_url: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg',
        slug: 'rpg',
        is_premium: true,
        price: 4.99,
      },
      {
        id: 7,
        title: 'Everest Climb',
        description: 'Climb Mount Everest! Navigate through treacherous terrain, manage oxygen levels, and reach the summit. Use arrow keys.',
        thumbnail_url: 'https://images.pexels.com/photos/1367192/pexels-photo-1367192.jpeg',
        slug: 'everest',
        is_premium: true,
        price: 7.99,
      },
      {
        id: 8,
        title: 'Kathmandu Maze',
        description: 'Navigate through the ancient streets of Kathmandu. Find hidden temples and avoid obstacles in this cultural maze adventure.',
        thumbnail_url: 'https://images.pexels.com/photos/1367192/pexels-photo-1367192.jpeg',
        slug: 'kathmandu',
        is_premium: true,
        price: 5.99,
      },
      {
        id: 9,
        title: 'Nepali Temple Puzzle',
        description: 'Solve ancient puzzles in beautiful Nepali temples. Match patterns, unlock secrets, and discover hidden treasures.',
        thumbnail_url: 'https://images.pexels.com/photos/1367192/pexels-photo-1367192.jpeg',
        slug: 'temple',
        is_premium: true,
        price: 6.99,
      },
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 font-inter text-gray-100 antialiased">
    {/* Hero Section */}
    <section className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden py-24 lg:py-36 rounded-b-3xl shadow-xl">
      {/* Video game image background with opacity */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://i.pinimg.com/736x/fb/5d/9a/fb5d9acca9f9e6c13430d5192f84fb57.jpg")', // Placeholder for video game image
          opacity: 0.20, // Explicitly set opacity
        }}
      ></div>
      <div className="absolute inset-0 bg-black/40 z-10"></div> {/* Dark overlay */}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 z-20">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bruno-ace mb-6 leading-tight drop-shadow-lg">
            Your Ultimate
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              {' '}Gaming Hub
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed font-inter">
            Discover hundreds of classic HTML5 games, from retro arcade favorites to modern puzzles.
            Play instantly in your browser or unlock premium experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/games"
              className="bg-gradient-to-r from-amber-400 to-amber-600 text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:shadow-[0_0_25px_rgba(255,215,0,0.7)] transform hover:scale-105 transition-all duration-300 ease-in-out flex items-center justify-center space-x-3 border-2 border-transparent hover:border-amber-700"
            >
              <Play className="h-6 w-6" />
              <span>Play Now</span>
            </Link>
            <Link
              to="/register"
              className="border-2 border-amber-400 text-amber-400 px-10 py-4 rounded-full font-bold text-lg hover:bg-amber-400 hover:text-gray-900 transition-all duration-300 ease-in-out flex items-center justify-center space-x-3 hover:shadow-[0_0_25px_rgba(255,215,0,0.5)]"
            >
              <span>Join Free</span>
              <ArrowRight className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* Stats Section - Removed as per user request */}
    {/* <section className="py-20 bg-gray-900 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 transform hover:scale-105 transition-transform duration-300 ease-in-out">
            <div className="bg-gradient-to-r from-amber-500 to-amber-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Trophy className="h-10 w-10 text-gray-900" />
            </div>
            <h3 className="text-4xl font-bold text-amber-400 mb-3 font-['Press_Start_2P']">50+</h3>
            <p className="text-gray-400 text-lg">Premium Games</p>
          </div>
          <div className="text-center bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 transform hover:scale-105 transition-transform duration-300 ease-in-out">
            <div className="bg-gradient-to-r from-amber-500 to-amber-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Users className="h-10 w-10 text-gray-900" />
            </div>
            <h3 className="text-4xl font-bold text-amber-400 mb-3 font-['Press_Start_2P']">10K+</h3>
            <p className="text-gray-400 text-lg">Active Players</p>
          </div>
          <div className="text-center bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 transform hover:scale-105 transition-transform duration-300 ease-in-out">
            <div className="bg-gradient-to-r from-amber-500 to-amber-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Star className="h-10 w-10 text-gray-900" />
            </div>
            <h3 className="text-4xl font-bold text-amber-400 mb-3 font-['Press_Start_2P']">4.9</h3>
            <p className="text-gray-400 text-lg">Average Rating</p>
          </div>
        </div>
      </div>
    </section> */}

    {/* Featured Games Section */}
    <section className="py-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bruno-ace text-amber-400 mb-6 drop-shadow-md">
            Featured Games
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto font-inter leading-relaxed">
            Handpicked classics and modern favorites that will keep you entertained for hours.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-xl shadow-xl overflow-hidden animate-pulse border border-gray-700">
                <div className="bg-gray-700 h-56 rounded-t-xl"></div>
                <div className="p-7">
                  <div className="h-7 bg-gray-700 rounded mb-3"></div>
                  <div className="h-5 bg-gray-700 rounded mb-5 w-4/5"></div>
                  <div className="h-12 bg-gray-700 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredGames.map((game) => (
              <div
                key={game.id}
                className="group relative bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700 cursor-pointer"
              >
                <img
                  src={game.thumbnail_url}
                  alt={game.title}
                  className="w-full h-56 object-cover rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:opacity-70"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/400x200/5C4033/FFD700?text=${encodeURIComponent(game.title)}`;
                  }}
                />

                {game.is_premium && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-amber-600 text-gray-900 px-3 py-1.5 rounded-full text-sm font-bold shadow-md z-20">
                    Premium
                  </div>
                )}

                {/* Overlay for details on hover */}
                <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out transform scale-95 group-hover:scale-100
                                group-hover:shadow-[0_0_40px_rgba(255,215,0,0.6)] border border-transparent group-hover:border-amber-500">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-amber-300 mb-3 font-bruno-ace">{game.title}</h3>
                    <p className="text-gray-300 mb-6 line-clamp-2 text-base font-inter">{game.description}</p>
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Link
                        to={`/games/${game.slug}`}
                        className="bg-gradient-to-r from-amber-500 to-amber-700 text-gray-900 px-6 py-3 rounded-lg font-medium hover:shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-shadow flex items-center space-x-2 text-base"
                      >
                        <Play className="h-5 w-5" />
                        <span>Play Now</span>
                      </Link>
                      {game.is_premium && game.price && (
                        <span className="text-xl font-bold text-amber-300">
                          ${game.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-16">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/games"
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-amber-500 to-amber-700 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:shadow-[0_0_25px_rgba(255,215,0,0.7)] transition-shadow transform hover:scale-105 ease-in-out"
            >
              <span>View All Games</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/categories"
              className="inline-flex items-center space-x-3 bg-gray-800 text-gray-300 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-700 hover:text-amber-400 transition-all duration-300 border border-gray-700"
            >
              <span>Browse Categories</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-t-3xl shadow-xl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-bruno-ace mb-6 drop-shadow-md">
          Ready to Start Gaming?
        </h2>
        <p className="text-xl text-gray-300 mb-10 font-inter">
          Join thousands of players and unlock access to premium games and exclusive content.
        </p>
        <Link
          to="/register"
          className="bg-amber-400 text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:shadow-[0_0_25px_rgba(255,215,0,0.7)] transform hover:scale-105 transition-all duration-300 ease-in-out border-2 border-transparent hover:border-amber-700"
        >
          Create Free Account
        </Link>
      </div>
    </section>
  </div>
  );
};