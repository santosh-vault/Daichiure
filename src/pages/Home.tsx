import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Users,
  Trophy,
  Zap,
  ChevronDown,
  DollarSign,
  Gift,
  Calendar,
  Target,
} from "lucide-react";
import AdSense from "../components/AdSense";
import { Helmet } from "react-helmet-async";
import { games } from "../data/games";
import { GameCard } from "../components/GameCard";
import { useGoogleAnalytics } from "../hooks/useGoogleAnalytics";
import "../App.css";

export const Home: React.FC = () => {
  const { trackEvent } = useGoogleAnalytics();

  // FAQ state for accordion
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

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

  // FAQ data about earning money
  const faqs = [
    {
      icon: DollarSign,
      question: "How can I earn real money on this platform?",
      answer:
        "You can earn money by accumulating coins through various activities: playing games daily, maintaining login streaks, completing challenges, and referring friends. Once you reach 1,000,000 coins, you can exchange them for real money.",
    },
    {
      icon: Gift,
      question: "What are Fair Coins and how do they help me earn?",
      answer:
        "Fair Coins are premium currency earned through weekly login streaks (1 Fair Coin every 7 consecutive days). Fair Coins can be redeemed for 100 regular coins each, helping you reach the 1M coin threshold faster for money withdrawal.",
    },
    {
      icon: Calendar,
      question: "How do login streaks work for earning?",
      answer:
        "Maintain daily login streaks to earn bonus coins and Fair Coins. Every 7 consecutive days, you automatically receive 1 Fair Coin. The longer your streak, the more you earn over time!",
    },
    {
      icon: Target,
      question: "When can i withdraw?",
      answer:
        "The minimum withdrawal is 1,000,000 Coins. This ensures fair value exchange and covers transaction costs. We process withdrawals within 24 hours of request.",
    },
    {
      icon: Users,
      question: "How does the referral system help me earn more?",
      answer:
        "Invite friends using your unique referral code! Both you and your friend receive bonus coins when they sign up and start playing. More referrals = more bonus coins = faster path to withdrawal!",
    },
    {
      icon: Trophy,
      question: "Do different games give different coin rewards?",
      answer:
        "Yes! Each game has specific coin rewards based on performance, time played, and achievements. Focus on games you're good at to maximize your daily coin earnings within the daily limit.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
      <Helmet>
        <title>Play Free Games Online & Earn Real Money | Daichiure</title>
        <meta
          name="description"
          content="Play the best free 2D games online and earn real money. Join Daichiure gaming platform with 100+ games, rewards system, and instant cash payouts!"
        />
        <meta
          name="keywords"
          content="free online games, earn money gaming, 2D games, browser games, gaming rewards, play to earn, Nepali games, cash rewards, gaming platform, online gaming hub"
        />
        <meta
          property="og:title"
          content="Play Free Games Online & Earn Real Money | Daichiure"
        />
        <meta
          property="og:description"
          content="Turn your gaming skills into real cash rewards! Join Daichiure and start earning money while playing your favorite games."
        />
        <meta
          property="og:image"
          content="https://www.daichiure.live/logo.png"
        />
        <meta property="og:url" content="https://www.daichiure.live/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Play Free Games Online & Earn Real Money | Daichiure"
        />
        <meta
          name="twitter:description"
          content="Turn your gaming skills into real cash rewards! Join Daichiure and start earning money while playing your favorite games."
        />
        <meta
          name="twitter:image"
          content="https://www.daichiure.live/logo.png"
        />
        <link rel="canonical" href="https://www.daichiure.live/" />

        {/* Enhanced Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Daichiure",
            url: "https://www.daichiure.live",
            description:
              "Play free 2D games online and earn real money with Daichiure gaming platform",
            potentialAction: {
              "@type": "SearchAction",
              target:
                "https://www.daichiure.live/games?search={search_term_string}",
              "query-input": "required name=search_term_string",
            },
            publisher: {
              "@type": "Organization",
              name: "Daichiure",
              logo: {
                "@type": "ImageObject",
                url: "https://www.daichiure.live/logo.png",
              },
            },
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "GameServer",
            name: "Daichiure Gaming Platform",
            description: "Free online gaming platform with reward system",
            url: "https://www.daichiure.live",
            game: {
              "@type": "VideoGameSeries",
              name: "Free 2D Browser Games",
              gameItem: [
                { "@type": "VideoGame", name: "Snake Classic" },
                { "@type": "VideoGame", name: "Tetris" },
                { "@type": "VideoGame", name: "Pong Retro" },
                { "@type": "VideoGame", name: "FreeFire 2D" },
              ],
            },
          })}
        </script>
      </Helmet>

      {/* Add custom styles for ultra-smooth scrolling */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          * {
            scroll-behavior: smooth;
          }
          
          body {
            overflow-x: hidden;
          }
          
          .smooth-section {
            position: relative;
            z-index: 1;
            transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
          
          .hero-sticky {
            position: sticky;
            top: 0;
            height: 100vh;
            z-index: 1;
          }
          
          .content-layer {
            position: relative;
            z-index: 2;
            background: linear-gradient(135deg, rgba(3, 7, 18, 0.95), rgba(0, 0, 0, 0.9));
            border-radius: 2rem 2rem 0 0;
            margin-top: -10vh;
            box-shadow: 0 -20px 40px rgba(0, 0, 0, 0.5);
          }
          
          .overlap-section {
            position: relative;
            z-index: 3;
            background: linear-gradient(135deg, rgba(3, 7, 18, 0.98), rgba(17, 24, 39, 0.95));
            border-radius: 2rem 2rem 0 0;
            margin-top: -8vh;
            box-shadow: 0 -20px 40px rgba(0, 0, 0, 0.6);
          }
          
          .final-section {
            position: relative;
            z-index: 4;
            background: linear-gradient(135deg, rgba(3, 7, 18, 0.9), rgba(0, 0, 0, 0.95));
            border-radius: 2rem 2rem 0 0;
            margin-top: -6vh;
            box-shadow: 0 -20px 40px rgba(0, 0, 0, 0.7);
          }
          
          @media (prefers-reduced-motion: reduce) {
            * {
              scroll-behavior: auto !important;
              transition: none !important;
              animation: none !important;
            }
          }
          
          /* Smooth entrance animations */
          .fade-in-up {
            opacity: 0;
            transform: translateY(30px);
            animation: fadeInUp 0.8s ease-out forwards;
          }
          
          @keyframes fadeInUp {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `,
        }}
      />

      <div className="relative bg-gradient-to-br from-gray-950 via-black to-gray-950 font-inter text-gray-100 antialiased">
        {/* Enhanced Hero Section */}
        <section
          className="hero-sticky overflow-hidden"
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
              <h1
                id="hero-heading"
                className="text-5xl sm:text-6xl lg:text-7xl font-bruno-ace mb-8 leading-tight"
              >
                Your Ultimate
                <span className="gradient-text block mt-2">Gaming Hub</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-inter">
                Turn your gaming skills into real cash by playing exciting Games
                — join Daichiure today and start earning while you play!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto w-full">
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
          className="content-layer py-24 smooth-section"
          aria-labelledby="featured-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20 fade-in-up">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {orderedGames.map((game, index) => {
                if (!game) return null;
                return (
                  <div
                    key={game.slug}
                    className="fade-in-up"
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

        {/* QNA Section - How to Earn Money */}
        <section
          className="overlap-section py-20 overflow-hidden smooth-section"
          aria-labelledby="faq-heading"
        >
          {/* Fancy Background Elements */}
          <div className="absolute inset-0">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-950/80 via-black/70 to-gray-900/80"></div>

            {/* Animated circles */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-xl animate-pulse"></div>
            <div
              className="absolute bottom-20 right-20 w-40 h-40 bg-amber-600/10 rounded-full blur-xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-1/2 left-1/4 w-24 h-24 bg-amber-400/10 rounded-full blur-xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>

            {/* Animated dots pattern */}
            <div className="absolute inset-0 opacity-30">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-amber-400/50 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                ></div>
              ))}
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
            <div className="text-center mb-16 fade-in-up">
              <h2
                id="faq-heading"
                className="text-4xl sm:text-5xl font-bruno-ace gradient-text mb-6"
              >
                How to Earn Money
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto font-inter leading-relaxed">
                Everything you need to know about turning your gaming time into
                real cash rewards.
              </p>
            </div>

            <div className="space-y-4 mb-12 max-w-4xl mx-auto">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="glass rounded-xl overflow-hidden hover-lift fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-2.5 rounded-full flex-shrink-0">
                          <faq.icon className="h-5 w-5 text-gray-950" />
                        </div>
                        <h3 className="text-base font-semibold text-white font-inter">
                          {faq.question}
                        </h3>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-amber-400 transition-transform duration-200 flex-shrink-0 ${
                          openFaq === index ? "transform rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      openFaq === index
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-5 pb-5">
                      <div className="ml-12 text-gray-300 font-inter leading-relaxed text-sm">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section - Final Section */}
        <section
          className="final-section py-24 smooth-section"
          aria-labelledby="stats-heading"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 fade-in-up">
              <h2
                id="stats-heading"
                className="text-4xl sm:text-5xl font-bruno-ace gradient-text mb-8"
              >
                Join the Community
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto font-inter leading-relaxed">
                Be part of our growing gaming community and start your earning
                journey today!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center mb-16">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="glass rounded-2xl p-8 hover-lift fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 rounded-full">
                      <stat.icon className="h-8 w-8 text-gray-950" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-amber-400 mb-2 font-bruno-ace">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 font-inter">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Final Call to Action */}
            <div className="text-center glass rounded-3xl p-8 fade-in-up">
              <h3 className="text-2xl font-bruno-ace text-amber-400 mb-4">
                Ready to Start Your Gaming Journey?
              </h3>
              <p className="text-gray-300 mb-6 font-inter">
                Join now and turn your gaming passion into real rewards!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/register"
                  onClick={() =>
                    trackEvent("cta_click", "engagement", "join_community")
                  }
                  className="btn-primary text-lg px-8 py-4 hover-lift flex items-center space-x-3"
                >
                  <Sparkles className="h-6 w-6" />
                  <span>Join Now</span>
                </Link>
                <Link
                  to="/games"
                  onClick={() =>
                    trackEvent("cta_click", "engagement", "explore_games_final")
                  }
                  className="btn-secondary text-lg px-8 py-4 hover-lift flex items-center space-x-3"
                >
                  <Trophy className="h-6 w-6" />
                  <span>Explore Games</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
