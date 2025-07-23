import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Users, Trophy, Zap } from "lucide-react";
import AdSense from "../components/AdSense";
import { Helmet } from "react-helmet-async";
import { games } from "../data/games";
import { GameCard } from "../components/GameCard";
import { useGoogleAnalytics } from "../hooks/useGoogleAnalytics";
import "../App.css";

export const Home: React.FC = () => {
  const { trackEvent } = useGoogleAnalytics();

  // Custom order for the first 8 games (2 rows of 4)
  const customOrder = [
    "freefire",
    "shooter",
    "towerstack",
    "allofaredead", // 1st row
    "snake",
    "pong",
    "tetris",
    "breakout", // 2nd row
  ];
  const orderedGames = customOrder
    .map((slug) => games.find((g) => g.slug === slug))
    .filter(Boolean);

  const stats = [
    { icon: Users, value: "1K+", label: "Active Players" },
    { icon: Trophy, value: "25+", label: "Games Available" },
    { icon: Zap, value: "24/7", label: "Always Online" },
  ];

  return (
    <>
      <Helmet>
        <title>Play Free Nepali & 2D Games Online | YourSiteName</title>
        <meta
          name="description"
          content="Play the best free Nepali games and 2D games online. Action, puzzle, and more. No download required!"
        />
        <meta
          name="keywords"
          content="Nepali games, free 2D games, online games, play Nepali games, Nepali puzzle games, Nepali action games, browser games, Kathmandu games, Everest games, Nepali temple, Nepali football, Nepali arcade"
        />
        <meta
          property="og:title"
          content="Play Free Nepali & 2D Games Online"
        />
        <meta
          property="og:description"
          content="Enjoy a huge collection of free Nepali and 2D games. Compete, have fun, and share with friends!"
        />
        <meta
          property="og:image"
          content="https://yourdomain.com/og-image.png"
        />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 font-inter text-gray-100 antialiased">
        {/* Enhanced Hero Section */}
        <section
          className="relative overflow-hidden h-screen"
          aria-labelledby="hero-heading"
        >
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{
                backgroundImage:
                  'url("https://i.pinimg.com/736x/fb/5d/9a/fb5d9acca9f9e6c13430d5192f84fb57.jpg")',
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60"></div>

            {/* Animated Particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-amber-400 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                ></div>
              ))}
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  z-20 h-full flex items-center justify-center">
            <div className="text-center animate-fade-in-up">
              {/* Sparkles Icon */}
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 rounded-full shadow-2xl animate-pulse-glow">
                  <Sparkles className="h-8 w-8 text-gray-950" />
                </div>
              </div>

              <h1
                id="hero-heading"
                className="text-5xl sm:text-6xl lg:text-7xl font-bruno-ace mb-8 leading-tight"
              >
                Your Ultimate
                <span className="gradient-text block mt-2">Gaming Hub</span>
              </h1>

              <p className="text-xl sm:text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed font-inter">
                Turn your gaming skills into real cash by playing exciting Games
                — join Daichiure today and start earning while you play!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch max-w-md mx-auto w-full">
                <Link
                  to="/register"
                  onClick={() =>
                    trackEvent("cta_click", "engagement", "start_earning_home")
                  }
                  className="btn-primary text-lg px-8 py-4 hover-lift w-full sm:w-auto flex items-center justify-center font-bold shadow-lg animate-pulse-glow border-2 border-amber-400"
                >
                  <span>Start Earning</span>
                  <Sparkles className="h-6 w-6 ml-2" />
                </Link>
                <Link
                  to="/games"
                  onClick={() =>
                    trackEvent("cta_click", "engagement", "play_now_home")
                  }
                  className="btn-secondary text-lg px-8 py-4 hover-lift w-full sm:w-auto flex items-center justify-center"
                >
                  <Sparkles className="h-6 w-6 mr-2" />
                  <span>Play Now</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Featured Games Section */}
        <section
          className="py-24 bg-gradient-to-br from-gray-950/50 to-black/50"
          aria-labelledby="featured-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20 animate-fade-in-up">
              <h2
                id="featured-heading"
                className="text-4xl sm:text-5xl font-bruno-ace gradient-text mb-8"
              >
                Featured Games
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto font-inter leading-relaxed">
                Handpicked classics and modern favorites that will keep you
                entertained for hours.
              </p>
            </div>

            {/* AdSense Banner - Top of Games Section */}
            <div className="mb-12">
              <AdSense
                adSlot="1234567890"
                className="mb-8"
                style={{ minHeight: "90px" }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {orderedGames.map((game, index) => {
                if (!game) return null;
                return (
                  <div
                    key={game.slug}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Link to={`/games/${game.slug}`} className="block">
                      <GameCard game={game} />
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* AdSense Banner - Middle of Games Section */}
            <div className="my-12">
              <AdSense
                adSlot="0987654321"
                className="my-8"
                style={{ minHeight: "90px" }}
              />
            </div>
          </div>
        </section>

        {/* Stats Section moved below Featured Games */}
        <section
          className="pb-12 bg-gradient-to-br from-gray-950/70 to-black/70"
          aria-labelledby="stats-heading"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="glass rounded-2xl p-6 hover-lift">
                  <div className="flex items-center justify-center mb-3">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-3 rounded-full">
                      <stat.icon className="h-6 w-6 text-gray-950" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-amber-400 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section
          className="py-24 bg-gradient-to-r from-gray-900/80 to-gray-800/80 glass-strong rounded-t-3xl"
          aria-labelledby="cta-heading"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fade-in-up">
              <h2
                id="cta-heading"
                className="text-4xl sm:text-5xl font-bruno-ace mb-8 gradient-text"
              >
                Ready to Start Gaming?
              </h2>
              <p className="text-xl text-gray-300 mb-12 font-inter leading-relaxed">
                Join thousands of players and unlock access to premium games and
                exclusive content.
              </p>

              {/* AdSense Banner - Before CTA Button */}
              <div className="mb-12">
                <AdSense
                  adSlot="1122334455"
                  className="mb-8"
                  style={{ minHeight: "90px" }}
                />
              </div>

              <Link
                to="/register"
                onClick={() =>
                  trackEvent("cta_click", "engagement", "create_account_cta")
                }
                className="btn-primary text-lg px-12 py-5 hover-lift inline-flex items-center space-x-3"
              >
                <Sparkles className="h-6 w-6" />
                <span>Create Free Account</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
