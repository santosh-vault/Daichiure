import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight } from 'lucide-react';
import AdSense from '../components/AdSense';
import { Helmet } from 'react-helmet-async';
import { games } from '../data/games';
import { GameCard } from '../components/GameCard';
import "../App.css";

export const Home: React.FC = () => {
  // Custom order for the first 8 games (2 rows of 4)
  const customOrder = [
    'freefire', 'shooter', 'towerstack', 'allofaredead', // 1st row
    'snake', 'pong', 'tetris', 'breakout',              // 2nd row
  ];
  const orderedGames = customOrder
    .map(slug => games.find(g => g.slug === slug))
    .filter(Boolean);

  return (
    <>
      <Helmet>
        <title>Play Free Nepali & 2D Games Online | YourSiteName</title>
        <meta name="description" content="Play the best free Nepali games and 2D games online. Action, puzzle, and more. No download required!" />
        <meta name="keywords" content="Nepali games, free 2D games, online games, play Nepali games, Nepali puzzle games, Nepali action games, browser games, Kathmandu games, Everest games, Nepali runner, Nepali temple, Nepali football, Nepali arcade" />
        <meta property="og:title" content="Play Free Nepali & 2D Games Online" />
        <meta property="og:description" content="Enjoy a huge collection of free Nepali and 2D games. Compete, have fun, and share with friends!" />
        <meta property="og:image" content="https://yourdomain.com/og-image.png" />
      </Helmet>
      <div className="min-h-screen bg-gray-950 font-inter text-gray-100 antialiased">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden py-24 lg:py-36 rounded-b-3xl shadow-xl" aria-labelledby="hero-heading">
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
              <h1 id="hero-heading" className="text-5xl sm:text-6xl lg:text-7xl font-bruno-ace mb-6 leading-tight drop-shadow-lg">
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

        {/* Featured Games Section */}
        <section className="py-20 bg-gray-950" aria-labelledby="featured-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="featured-heading" className="text-4xl sm:text-5xl font-bruno-ace text-amber-400 mb-6 drop-shadow-md">
                Featured Games
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto font-inter leading-relaxed">
                Handpicked classics and modern favorites that will keep you entertained for hours.
              </p>
            </div>

            {/* AdSense Banner - Top of Games Section */}
            <AdSense 
              adSlot="1234567890" 
              className="mb-8"
              style={{ minHeight: '90px' }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {orderedGames.map((game) => {
                if (!game) return null;
                return (
                  <Link
                    key={game.slug}
                    to={`/games/${game.slug}`}
                    className="block group"
                  >
                    <GameCard game={game} />
                  </Link>
                );
              })}
            </div>

            {/* AdSense Banner - Middle of Games Section */}
            <AdSense 
              adSlot="0987654321" 
              className="my-8"
              style={{ minHeight: '90px' }}
            />

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
        <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-t-3xl shadow-xl" aria-labelledby="cta-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="cta-heading" className="text-4xl sm:text-5xl font-bruno-ace mb-6 drop-shadow-md">
              Ready to Start Gaming?
            </h2>
            <p className="text-xl text-gray-300 mb-10 font-inter">
              Join thousands of players and unlock access to premium games and exclusive content.
            </p>
            
            {/* AdSense Banner - Before CTA Button */}
            <AdSense 
              adSlot="1122334455" 
              className="mb-8"
              style={{ minHeight: '90px' }}
            />
            
            <Link
              to="/register"
              className="bg-amber-400 text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:shadow-[0_0_25px_rgba(255,215,0,0.7)] transform hover:scale-105 transition-all duration-300 ease-in-out border-2 border-transparent hover:border-amber-700"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;