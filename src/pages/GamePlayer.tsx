import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Share2,
  Crown,
  Maximize,
  Minimize,
  Loader,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { gameComponents } from "../games";
import { games } from "../data/games";
import { PremiumGameGate } from "../components/PremiumGameGate";
import { Helmet } from "react-helmet-async";
import { useGoogleAnalytics } from "../hooks/useGoogleAnalytics";
import FullscreenSuggestDialog from "../components/FullscreenSuggestDialog";

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
  const [error, setError] = useState<string | null>(null);
  const { trackEvent } = useGoogleAnalytics();

  useEffect(() => {
    if (slug) {
      loadGame();
    }
  }, [slug]);

  const loadGame = async () => {
    if (!slug) {
      setError("No game specified");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log("🎮 Loading game:", slug);
      trackEvent("game_load", "engagement", slug);

      // First, check if it's a local React game using the games array
      const localGame = games.find((g) => g.slug === slug);
      if (localGame) {
        const gameData = {
          id: -1,
          title: localGame.title,
          description: localGame.description,
          thumbnail_url: localGame.thumbnail_url || "/placeholder-game.jpg",
          is_premium: localGame.is_premium,
          price: localGame.price,
          game_data: slug,
          category: {
            name:
              localGame.category.charAt(0).toUpperCase() +
              localGame.category.slice(1),
          },
        };
        setGame(gameData as unknown as GameData);
        trackEvent("game_loaded", "engagement", slug, 1);
        setLoading(false);
        return;
      }

      // If not a local game, try to load from database
      try {
        const { data, error } = await supabase
          .from("games")
          .select(
            `
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
          `
          )
          .eq("slug", slug)
          .single();

        if (error) {
          console.warn("❌ Database game not found:", error);
          throw new Error("Game not found in database");
        }

        const gameData = {
          ...data,
          category: data.categories,
        };

        setGame(gameData as unknown as GameData);
        trackEvent("game_loaded", "engagement", slug, 1);
      } catch (dbError) {
        console.warn("❌ Database connection failed:", dbError);
        throw new Error("Failed to load game from database");
      }
    } catch (error: any) {
      console.error("❌ Error loading game:", error);
      setError(error.message || "Failed to load game");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    trackEvent("game_share", "engagement", game?.title || slug);

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
      toast.success("Link copied to clipboard!");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center font-inter">
        <div className="text-center">
          <Loader className="h-12 w-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading game...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center font-inter">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold font-bruno-ace text-red-400 mb-4">
            Game Not Found
          </h2>
          <p className="text-gray-400 mb-6">
            {error || "The game you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate("/games")}
            className="bg-gradient-to-r from-amber-500 to-amber-700 text-gray-950 px-6 py-3 rounded-lg font-bold hover:shadow-[0_0_25px_rgba(255,215,0,0.7)] transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  console.log("🎮 Game loaded:", {
    title: game.title,
    is_premium: game.is_premium,
    price: game.price,
    slug,
  });

  // Helmet meta tags for the game page
  const ogImage = game.thumbnail_url || "/placeholder-game.jpg";
  const canonicalUrl = `${window.location.origin}/games/${slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    description: game.description,
    image: ogImage,
    applicationCategory: "Game",
    operatingSystem: "All",
    url: canonicalUrl,
    author: {
      "@type": "Organization",
      name: "Daichiure",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "120",
    },
  };

  const gameContent = (
    <article aria-labelledby="game-title">
      <GameContent
        game={game}
        onShare={handleShare}
        onBack={() => navigate("/games")}
        slug={slug || ""}
      />
    </article>
  );

  // Render with SEO meta tags
  const seoContent = (
    <>
      <Helmet>
        <title>{game.title} | Daichiure</title>
        <meta name="description" content={game.description} />
        <meta
          name="keywords"
          content={`Nepali games, ${game.title}, online games, play ${
            game.title
          }, ${game.category?.name || ""}, 2D games`}
        />
        <meta
          property="og:title"
          content={`${game.title} | Play Free 2D Browser Games | Nepali Games`}
        />
        <meta property="og:description" content={game.description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${game.title} | Daichiure`} />
        <meta name="twitter:description" content={game.description} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>
      {gameContent}
    </>
  );

  // If it's a premium game, wrap with PremiumGameGate
  if (game.is_premium) {
    console.log("🔒 Premium game detected, showing gate");
    return (
      <>
        {seoContent.props.children[0]}
        <PremiumGameGate
          gameTitle={game.title}
          gamePrice={game.price || 0}
          gameSlug={slug || ""}
        >
          {gameContent}
        </PremiumGameGate>
      </>
    );
  }

  console.log("🆓 Free game, showing directly");
  return seoContent;
};

// Separate component for the actual game content
interface GameContentProps {
  game: GameData;
  onShare: () => void;
  onBack: () => void;
  slug: string;
}

const GameContent: React.FC<GameContentProps> = ({
  game,
  onShare,
  onBack,
  slug,
}) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenDialog, setShowFullscreenDialog] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);

  // Fullscreen logic
  const handleFullscreen = useCallback(async () => {
    const container = gameContainerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setShowFullscreenDialog(false);
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
      toast.error("Fullscreen not supported");
    }
  }, []);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);

      // Dispatch resize event when entering/exiting fullscreen
      window.dispatchEvent(new Event("resize"));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F key for fullscreen
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        handleFullscreen();
      }
      // Escape to exit fullscreen
      if (e.key === "Escape" && isFullscreen) {
        document.exitFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFullscreen, isFullscreen]);

  // Show fullscreen suggestion for first-time users
  useEffect(() => {
    const hasSeenDialog = localStorage.getItem(`fullscreen-dialog-${slug}`);
    if (!hasSeenDialog) {
      const timer = setTimeout(() => {
        setShowFullscreenDialog(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [slug]);

  const handleDialogClose = () => {
    setShowFullscreenDialog(false);
    localStorage.setItem(`fullscreen-dialog-${slug}`, "true");
  };

  const handleDialogFullscreen = () => {
    handleFullscreen();
    handleDialogClose();
  };

  // Game component renderer
  const renderGame = () => {
    try {
      const GameComponent =
        gameComponents[game.game_data as keyof typeof gameComponents];
      if (!GameComponent) {
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-bold mb-2">Game Unavailable</h3>
              <p className="text-sm">This game component is not available.</p>
            </div>
          </div>
        );
      }

      return (
        <div className="w-full h-full bg-black rounded-lg overflow-hidden">
          <GameComponent />
        </div>
      );
    } catch (error: any) {
      console.error("Game rendering error:", error);
      setGameError(error.message);
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
          <div className="text-center text-red-400">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2">Game Error</h3>
            <p className="text-sm">{gameError || "Failed to load game"}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reload Game
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 font-inter">
      {/* Fullscreen suggestion dialog */}
      <FullscreenSuggestDialog
        open={showFullscreenDialog && !isFullscreen}
        onClose={handleDialogClose}
        onGoFullscreen={handleDialogFullscreen}
      />

      {/* Header - only show when not in fullscreen */}
      {!isFullscreen && (
        <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onBack}
                  className="flex items-center space-x-2 text-gray-400 hover:text-amber-400 transition-colors duration-200 group"
                >
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="hidden sm:inline">Back to Games</span>
                </button>

                <div className="hidden sm:block h-6 w-px bg-gray-700"></div>

                <div className="hidden md:block">
                  <h1
                    id="game-title"
                    className="text-lg font-bold font-bruno-ace text-amber-400"
                  >
                    {game.title}
                  </h1>
                  <p className="text-xs text-gray-500">{game.category.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={onShare}
                  className="p-2 text-gray-400 hover:text-amber-400 rounded-lg hover:bg-gray-800 transition-all duration-200"
                  title="Share game"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-800 transition-all duration-200"
                  title="Like game"
                >
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className={isFullscreen ? "h-screen" : "min-h-[calc(100vh-4rem)]"}>
        <div
          className={
            isFullscreen
              ? "h-full"
              : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
          }
        >
          <div
            className={
              isFullscreen ? "h-full" : "grid grid-cols-1 xl:grid-cols-4 gap-6"
            }
          >
            {/* Game Container */}
            <div className={isFullscreen ? "h-full relative" : "xl:col-span-3"}>
              <div
                ref={gameContainerRef}
                className={`
                  relative group
                  ${
                    isFullscreen
                      ? "h-full w-full bg-black"
                      : "bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl aspect-video"
                  }
                `}
              >
                {/* Fullscreen Toggle Button */}
                <button
                  onClick={handleFullscreen}
                  className={`
                    absolute top-4 right-4 z-30 
                    bg-black/50 hover:bg-black/70 text-white 
                    rounded-full p-3 transition-all duration-200
                    hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500
                    ${
                      isFullscreen
                        ? "opacity-0 hover:opacity-100"
                        : "opacity-70 group-hover:opacity-100"
                    }
                  `}
                  title={
                    isFullscreen
                      ? "Exit Fullscreen (F/Esc)"
                      : "Go Fullscreen (F)"
                  }
                >
                  {isFullscreen ? (
                    <Minimize className="h-5 w-5" />
                  ) : (
                    <Maximize className="h-5 w-5" />
                  )}
                </button>

                {/* Game Content */}
                <div className="w-full h-full">{renderGame()}</div>
              </div>

              {/* Mobile game info - show below game on mobile */}
              {!isFullscreen && (
                <div className="md:hidden mt-4 bg-gray-900 rounded-lg p-4 border border-gray-800">
                  <h2 className="text-lg font-bold font-bruno-ace text-amber-400 mb-2">
                    {game.title}
                  </h2>
                  <p className="text-gray-400 text-sm mb-3">
                    {game.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
                      {game.category.name}
                    </span>
                    {game.is_premium && (
                      <span className="text-xs font-bold text-amber-400 flex items-center space-x-1">
                        <Crown className="h-3 w-3" />
                        <span>Premium</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - only show when not fullscreen */}
            {!isFullscreen && (
              <aside className="space-y-6 hidden xl:block">
                {/* Game Info Card */}
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-xl">
                  <div className="aspect-video bg-gray-800 rounded-lg mb-4 overflow-hidden">
                    <img
                      src={game.thumbnail_url || "/placeholder-game.jpg"}
                      alt={game.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-game.jpg";
                      }}
                    />
                  </div>

                  <h2 className="text-lg font-bold font-bruno-ace text-amber-400 mb-2">
                    {game.title}
                  </h2>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    {game.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                      {game.category.name}
                    </span>
                    {game.is_premium && (
                      <span className="text-xs font-bold text-amber-400 flex items-center space-x-1">
                        <Crown className="h-3 w-3" />
                        <span>Premium</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* How to Play Card */}
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-xl">
                  <h3 className="font-semibold font-bruno-ace text-amber-400 mb-4">
                    How to Play
                  </h3>
                  <div className="text-sm text-gray-400 space-y-2">
                    <div className="flex items-start space-x-2">
                      <span className="text-amber-500 font-mono">•</span>
                      <span>Use arrow keys or WASD to move</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-amber-500 font-mono">•</span>
                      <span>Press Space to pause/resume</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-amber-500 font-mono">•</span>
                      <span>Press F for fullscreen mode</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-amber-500 font-mono">•</span>
                      <span>Click to interact with elements</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-800">
                    <h4 className="font-semibold text-amber-300 mb-3 text-sm">
                      Quick Tips
                    </h4>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>• Best experienced in fullscreen mode</li>
                      <li>• Use headphones for better audio</li>
                      <li>• Game saves progress automatically</li>
                    </ul>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
