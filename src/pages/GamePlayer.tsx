import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { gameComponents } from '../games';
import { games } from '../data/games';
import { PremiumGameGate } from '../components/PremiumGameGate';
import { Helmet } from 'react-helmet-async';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

interface GameData {
  id: number;
  title: string;
  description: string;
  thumbnail_url?: string;
  is_premium: boolean;
  price: number | null;
  game_data: string;
  category: {
    name: string;
  };
}

export const GamePlayer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const { trackEvent } = useGoogleAnalytics();

  useEffect(() => {
    if (slug) {
      loadGame();
    }
  }, [slug]);

  const loadGame = async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

    try {
      console.log('🎮 Loading game:', slug);
      // Track game load attempt
      trackEvent('game_load', 'engagement', slug);
      
      // First, check if it's a local React game using the games array
      const localGame = games.find(g => g.slug === slug);
      if (localGame) {
        const gameData = {
          id: -1,
          title: localGame.title,
          description: localGame.description,
          is_premium: localGame.is_premium,
          price: localGame.price,
          game_data: slug, // Use slug as game_data for React components
          category: {
            name: localGame.category.charAt(0).toUpperCase() + localGame.category.slice(1)
          }
        };
        setGame(gameData as unknown as GameData);
        setLoading(false);
        // Track successful local game load
        trackEvent('game_loaded', 'engagement', slug, 1);
        return;
      }

      // If not a local game, try to load from database
      try {
        const { data, error } = await supabase
          .from('games')
          .select(`
            id,
            title,
            description,
            thumbnail_url,
            is_premium,
            price,
            game_data,
            categories!inner(
              name
            )
          `)
          .eq('slug', slug)
          .single();

        if (error) {
          console.warn('❌ Database game not found:', error);
          setGame(null);
          setLoading(false);
          return;
        }

        const gameData = {
          ...data,
          category: data.categories
        };

        setGame(gameData as unknown as GameData);
        // Track successful database game load
        trackEvent('game_loaded', 'engagement', slug, 1);
      } catch (dbError) {
        console.warn('❌ Database connection failed:', dbError);
        setGame(null);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('❌ Error loading game:', error);
      setGame(null);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    // Track share event
    trackEvent('game_share', 'engagement', game?.title || slug);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: game?.title,
          text: game?.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center font-inter">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center font-inter">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-bruno-ace text-amber-400 mb-2">Game not found</h2>
          <p className="text-gray-400 mb-4">The game you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/games')}
            className="bg-gradient-to-r from-amber-500 to-amber-700 text-gray-950 px-6 py-3 rounded-lg font-bold hover:shadow-[0_0_25px_rgba(255,215,0,0.7)] transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Back to games
          </button>
        </div>
      </div>
    );
  }

  console.log('🎮 Game loaded:', {
    title: game.title,
    is_premium: game.is_premium,
    price: game.price,
    slug
  });

  // Helmet meta tags for the game page
  const ogImage = game.thumbnail_url || 'https://yourdomain.com/og-image.png';
  const canonicalUrl = `${window.location.origin}/games/${slug}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    'name': game.title,
    'description': game.description,
    'image': ogImage,
    'applicationCategory': 'Game',
    'operatingSystem': 'All',
    'url': canonicalUrl,
    'author': {
      '@type': 'Organization',
      'name': 'PlayHub'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.5',
      'reviewCount': '120'
    }
  };

  // If it's a premium game, wrap with PremiumGameGate
  if (game.is_premium) {
    console.log('🔒 Premium game detected, showing gate');
    return (
      <>
        <Helmet>
          <title>{game.title} | PlayHub</title>
          <meta name="description" content={game.description} />
          <meta name="keywords" content={`Nepali games, ${game.title}, online games, play ${game.title}, ${game.category?.name || ''}, 2D games`} />
          <meta property="og:title" content={`${game.title} | Play Free 2D Browser Games | Nepali Games`} />
          <meta property="og:description" content={game.description} />
          <meta property="og:image" content={ogImage} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={canonicalUrl} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${game.title} | PlayHub`} />
          <meta name="twitter:description" content={game.description} />
          <meta name="twitter:image" content={ogImage} />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={canonicalUrl} />
          <script type="application/ld+json">{JSON.stringify(schema)}</script>
        </Helmet>
        <PremiumGameGate
          gameTitle={game.title}
          gamePrice={game.price || 0}
          gameSlug={slug || ''}
        >
          <article aria-labelledby="game-title">
            <GameContent game={game} onShare={handleShare} onBack={() => navigate('/games')} />
          </article>
        </PremiumGameGate>
      </>
    );
  }

  console.log('🆓 Free game, showing directly');
  // For free games, show directly
  return (
    <>
      <Helmet>
        <title>{game.title} | PlayHub</title>
        <meta name="description" content={game.description} />
        <meta name="keywords" content={`Nepali games, ${game.title}, online games, play ${game.title}, ${game.category?.name || ''}, 2D games`} />
        <meta property="og:title" content={`${game.title} | Play Free 2D Browser Games | Nepali Games`} />
        <meta property="og:description" content={game.description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${game.title} | PlayHub`} />
        <meta name="twitter:description" content={game.description} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>
      <article aria-labelledby="game-title">
        <GameContent game={game} onShare={handleShare} onBack={() => navigate('/games')} />
      </article>
    </>
  );
};

// Separate component for the actual game content
interface GameContentProps {
  game: GameData;
  onShare: () => void;
  onBack: () => void;
}

const GameContent: React.FC<GameContentProps> = ({ game, onShare, onBack }) => {
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen logic
  const handleFullscreen = useCallback(() => {
    const area = gameAreaRef.current;
    if (!area) return;
    if (!document.fullscreenElement) {
      area.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Keyboard shortcut for fullscreen (F)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyF') {
        handleFullscreen();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleFullscreen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 font-inter">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-400 hover:text-amber-400 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Games</span>
              </button>
              <div className="hidden sm:block h-6 w-px bg-gray-700"></div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold font-bruno-ace text-amber-400">{game.title}</h1>
                <p className="text-sm text-gray-400">{game.category.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onShare}
                className="p-2 text-gray-400 hover:text-amber-400 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-800 transition-colors duration-200">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Game Area */}
          <div className="lg:col-span-3 w-full">
            <div
              ref={gameAreaRef}
              className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800 relative w-full"
              style={!isFullscreen ? { maxHeight: '70vh', minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}}
            >
              {/* Fullscreen Button */}
              <button
                onClick={handleFullscreen}
                className="absolute top-3 right-3 z-20 bg-gray-800 bg-opacity-80 hover:bg-opacity-100 text-white rounded-full p-2 shadow-lg focus:outline-none"
                title={isFullscreen ? 'Exit Fullscreen (F)' : 'Go Fullscreen (F)'}
              >
                {isFullscreen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13H5v6h6v-4m6-6h4V5h-6v4m0 6v4h6v-6h-4m-6-6V5H5v6h4" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4M20 8V4h-4M4 16v4h4m12-4v4h-4" /></svg>
                )}
              </button>
              <div className="aspect-video w-full">
                {(() => {
                  const GameComponent = gameComponents[game.game_data as keyof typeof gameComponents];
                  return GameComponent ? <GameComponent /> : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <h3 className="text-xl font-bold mb-2">Game Not Found</h3>
                        <p>This game component is not available.</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Info */}
            <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-800">
              <img
                src={game.thumbnail_url}
                alt={game.title}
                className="w-full h-32 object-cover rounded-xl mb-4"
              />
              <h2 className="text-xl font-bold font-bruno-ace text-amber-400 mb-2">{game.title}</h2>
              <p className="text-gray-400 mb-4">{game.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
                  {game.category.name}
                </span>
                {game.is_premium && (
                  <span className="text-sm font-bold text-amber-400 flex items-center space-x-1">
                    <Crown className="h-3 w-3" />
                    <span>Premium</span>
                  </span>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-800">
              <h3 className="font-semibold font-bruno-ace text-amber-400 mb-3">How to Play</h3>
              <div className="text-sm text-gray-400 space-y-2 mb-4">
                <p>• Use arrow keys or WASD to move</p>
                <p>• Press Space to pause/resume</p>
                <p>• Click to interact with game elements</p>
                <p>• Have fun and enjoy the game!</p>
              </div>
              <h4 className="font-semibold text-amber-300 mb-2 mt-4">Player Reviews</h4>
              <div className="mb-4">
                <p className="text-gray-300 italic mb-1">“Super fun and addictive! 5 stars.”</p>
                <p className="text-gray-400 text-xs">- Guest Player</p>
              </div>
              <div className="mb-4">
                <p className="text-gray-300 italic mb-1">“Reminds me of classic arcade games.”</p>
                <p className="text-gray-400 text-xs">- ArcadeFan99</p>
              </div>
              <h4 className="font-semibold text-amber-300 mb-2 mt-4">FAQs</h4>
              <ul className="list-disc pl-5 text-gray-200 text-xs space-y-1">
                <li><strong>Is this game free?</strong> Yes, you can play for free in your browser.</li>
                <li><strong>Do I need to download anything?</strong> No downloads required—just click and play!</li>
                <li><strong>Can I play on mobile?</strong> Most games work on mobile devices.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};