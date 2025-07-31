import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import AdSense from "../components/AdSense";
import { games } from "../data/games";
import { GameCard } from "../components/GameCard";
import { Helmet } from "react-helmet-async";
import { useGoogleAnalytics } from "../hooks/useGoogleAnalytics";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export const Games: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "Arcade", slug: "arcade" },
    { id: 2, name: "Puzzle", slug: "puzzle" },
    { id: 3, name: "Action", slug: "action" },
    { id: 4, name: "Adventure", slug: "adventure" },
    { id: 5, name: "Sports", slug: "sports" },
    { id: 6, name: "Building", slug: "building" },
    { id: 7, name: "Card", slug: "card" },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchParams] = useSearchParams();
  const { trackEvent } = useGoogleAnalytics();
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    // Third row: recently added games
    // Removed: '100balls',
    "vcecgonb",
    "zt2tti9k",
    "fxzsxwyi",
    "77b5mbmq",
    "rc0aptuu",
    "qkqlhh9c",
    "9ptv2pby",
    // Fourth row: continue with other featured games
    "squidgame",
  ];

  // Sync searchTerm with ?search= param
  useEffect(() => {
    const search = searchParams.get("search") || "";
    setSearchTerm(search);
  }, [searchParams]);

  // Listen for header searchbar events
  useEffect(() => {
    const handler = (e: any) => {
      if (typeof e.detail === "string") {
        setSearchTerm(e.detail);
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener("games-search", handler);
    return () => window.removeEventListener("games-search", handler);
  }, []);

  const filteredGames = games.filter((game) => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Reorder games: custom order first, then the rest
  const orderedGames = [
    ...(customOrder
      .map((slug) => filteredGames.find((g) => g.slug === slug))
      .filter(Boolean) as typeof games),
    ...filteredGames.filter((game) => !customOrder.includes(game.slug)),
  ];

  return (
    <>
      <Helmet>
        <title>All Games | Free Online 2D Games | Daichiure</title>
        <meta
          name="description"
          content="Browse and play 100+ free Nepali and 2D games online. Action, puzzle, sports, arcade games and more! No downloads required, play instantly in your browser."
        />
        <meta
          name="keywords"
          content="free games, Nepali games, 2D games, online games, browser games, arcade games, puzzle games, action games, sports games, play games online"
        />
        <meta
          property="og:title"
          content="All Games | Free Online 2D Games | Daichiure"
        />
        <meta
          property="og:description"
          content="Browse and play 100+ free Nepali and 2D games online. Action, puzzle, sports, arcade games and more!"
        />
        <meta
          property="og:image"
          content="https://www.daichiure.live/logo.png"
        />
        <meta property="og:url" content="https://www.daichiure.live/games" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="All Games | Free Online 2D Games | Daichiure"
        />
        <meta
          name="twitter:description"
          content="Browse and play 100+ free Nepali and 2D games online. Action, puzzle, sports, arcade games and more!"
        />
        <meta
          name="twitter:image"
          content="https://www.daichiure.live/logo.png"
        />
        <link rel="canonical" href="https://www.daichiure.live/games" />

        {/* Games Collection Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Free Online Games Collection",
            description: "Browse and play 100+ free 2D games online",
            url: "https://www.daichiure.live/games",
            mainEntity: {
              "@type": "ItemList",
              name: "Free Games",
              numberOfItems: orderedGames.length,
              itemListElement: orderedGames.slice(0, 10).map((game, index) => ({
                "@type": "VideoGame",
                position: index + 1,
                name: game.title,
                description: game.description,
                url: `https://www.daichiure.live/games/${game.slug}`,
                applicationCategory: "Game",
              })),
            },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://www.daichiure.live",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Games",
                  item: "https://www.daichiure.live/games",
                },
              ],
            },
          })}
        </script>
      </Helmet>
      <div className="min-h-screen bg-gray-950 font-inter text-gray-100 antialiased py-8">
        <section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          aria-labelledby="games-heading"
        >
          {/* Games Grid Only */}
          <section aria-label="Games Grid">
            {orderedGames.length === 0 ? (
              <div className="text-center py-12 sm:py-20 bg-gray-900 rounded-xl shadow-xl border border-gray-800 mx-4">
                <div className="text-gray-600 mb-4 sm:mb-6">
                  <Search className="h-12 w-12 sm:h-20 sm:w-20 mx-auto text-gray-700" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-['Orbitron'] text-amber-400 mb-4">
                  No games found
                </h2>
                <p className="text-lg sm:text-xl text-gray-400 px-4">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              <>
                {/* AdSense Banner - Top of Games Grid */}
                <div className="mb-8">
                  <AdSense
                    adSlot="5989385709"
                    className="w-full"
                    style={{ minHeight: "90px" }}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
                  {orderedGames.map((game) => (
                    <Link
                      key={game.slug}
                      to={`/games/${game.slug}`}
                      className="block"
                    >
                      <GameCard game={game} />
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>
        </section>
      </div>
    </>
  );
};
