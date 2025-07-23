import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Gamepad2,
  User,
  LogOut,
  Menu,
  X,
  Coins,
  Trophy,
  User as UserIcon,
} from "lucide-react";
import { useRewards } from "../../hooks/useRewards";

// Admin user emails - should match Dashboard.tsx
const ADMIN_EMAILS = ["admin@playhub.com", "developer@playhub.com"];

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { rewardData, loading: rewardsLoading } = useRewards();
  const [search, setSearch] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);

  // Check if user is admin
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || "");
  // Show profile icon for logged-in non-admin users
  const isUser = user && !isAdmin;
  const isUserDashboard = location.pathname.startsWith("/user-dashboard");

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      if (location.pathname.startsWith("/games")) {
        // Dispatch a custom event to update searchTerm in Games page
        window.dispatchEvent(
          new CustomEvent("games-search", { detail: search.trim() })
        );
      } else {
        navigate(`/games?search=${encodeURIComponent(search.trim())}`);
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? "glass-strong shadow-lg border-b border-white/10"
          : "bg-gradient-to-r from-gray-900/95 to-gray-950/95 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          {/* Logo - smaller */}
          <Link
            to="/"
            className="flex items-center space-x-2 group animate-fade-in-scale min-w-fit"
          >
            <div className="relative">
              <div className="bg-gradient-to-r from-amber-500 to-amber-700 p-2 rounded-lg shadow-lg group-hover:shadow-2xl transition-all duration-300 ease-in-out transform group-hover:scale-105 group-hover:rotate-3">
                <Gamepad2 className="h-5 w-5 text-gray-950" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
            </div>
            <span className="text-xl font-bold font-bruno-ace gradient-text drop-shadow-md">
              PlayHub
            </span>
          </Link>

          {/* Search Bar - centered and prominent */}
          {isUser && (
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 flex justify-center"
            >
              <div className="w-full max-w-xl flex items-center bg-gray-800/80 rounded-full px-4 py-2 shadow-inner border border-gray-700 focus-within:ring-2 focus-within:ring-amber-400">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search"
                  className="flex-1 bg-transparent outline-none border-none text-gray-100 placeholder-gray-400 px-2 text-base"
                />
                <button
                  type="submit"
                  className="text-gray-400 hover:text-amber-400 p-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                    />
                  </svg>
                </button>
              </div>
            </form>
          )}
          {!isUser && !isUserDashboard && (
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 flex justify-center"
            >
              <div className="w-full max-w-xl flex items-center bg-gray-800/80 rounded-full px-4 py-2 shadow-inner border border-gray-700 focus-within:ring-2 focus-within:ring-amber-400">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search"
                  className="flex-1 bg-transparent outline-none border-none text-gray-100 placeholder-gray-400 px-2 text-base"
                />
                <button
                  type="submit"
                  className="text-gray-400 hover:text-amber-400 p-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                    />
                  </svg>
                </button>
              </div>
            </form>
          )}

          {/* Navigation/Profile/Rewards */}
          <nav className="hidden md:flex items-center space-x-6 min-w-fit">
            {/* Guest View */}
            {!user && (
              <>
                <Link
                  to="/games"
                  className="relative text-gray-300 hover:text-amber-400 font-medium text-md transition-all duration-300 ease-in-out transform hover:scale-105 group"
                >
                  <span className="relative z-10">Games</span>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 group-hover:w-full"></div>
                </Link>
                <Link
                  to="/blogs"
                  className="relative text-gray-300 hover:text-amber-400 font-medium text-md transition-all duration-300 ease-in-out transform hover:scale-105 group"
                >
                  <span className="relative z-10">Blog</span>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 group-hover:w-full"></div>
                </Link>
                <div className="flex items-center min-w-fit">
                  <Link
                    to="/register"
                    className="btn-primary hover-lift px-4 py-2 text-sm"
                  >
                    Login
                  </Link>
                </div>
              </>
            )}

            {/* Regular User View */}
            {isUser && (
              <>
                <Link
                  to="/games"
                  className="relative text-gray-300 hover:text-amber-400 font-medium text-md transition-all duration-300 ease-in-out transform hover:scale-105 group"
                >
                  <span className="relative z-10">Games</span>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 group-hover:w-full"></div>
                </Link>
                <Link
                  to="/blogs"
                  className="relative text-gray-300 hover:text-amber-400 font-medium text-md transition-all duration-300 ease-in-out transform hover:scale-105 group"
                >
                  <span className="relative z-10">Blog</span>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 group-hover:w-full"></div>
                </Link>
                <div className="flex items-center min-w-fit">
                  <div className="flex items-center glass px-4 py-2 rounded-full text-amber-400 font-semibold text-sm hover-lift">
                    <Coins className="h-4 w-4 mr-2 animate-pulse" />
                    {rewardsLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <span>{rewardData?.coins?.toLocaleString() ?? 0}</span>
                    )}
                  </div>
                  <div className="flex items-center glass px-4 py-2 rounded-full text-blue-400 font-semibold text-sm hover-lift ml-2">
                    <Trophy className="h-4 w-4 mr-2" />
                    {rewardsLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <span>{rewardData?.fair_coins ?? 0}</span>
                    )}
                  </div>
                </div>
                <Link
                  to="/user-dashboard"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 text-amber-400 text-xl shadow-lg ml-4"
                  aria-label="User profile"
                >
                  <UserIcon className="w-6 h-6" />
                </Link>
              </>
            )}

            {/* Admin View */}
            {isAdmin && (
              <>
                <Link
                  to="/games"
                  className="relative text-gray-300 hover:text-amber-400 font-medium text-md transition-all duration-300 ease-in-out transform hover:scale-105 group"
                >
                  <span className="relative z-10">Games</span>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 group-hover:w-full"></div>
                </Link>
                <Link
                  to="/blogs"
                  className="relative text-gray-300 hover:text-amber-400 font-medium text-md transition-all duration-300 ease-in-out transform hover:scale-105 group"
                >
                  <span className="relative z-10">Blog</span>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 group-hover:w-full"></div>
                </Link>
                <Link
                  to="/dashboard"
                  className="relative text-gray-300 hover:text-amber-400 font-medium text-md transition-all duration-300 ease-in-out transform hover:scale-105 group"
                >
                  <span className="relative z-10">Admin Dashboard</span>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 group-hover:w-full"></div>
                </Link>
              </>
            )}
          </nav>

          {/* Enhanced Mobile menu button */}
          {!isUser && (
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-3 rounded-xl text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all duration-300 hover-lift"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          )}
        </div>

        {/* Enhanced Mobile Navigation */}
        {!isUser && isMobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-white/10 glass-strong animate-fade-in-up">
            <nav className="flex flex-col space-y-4 px-4">
              <Link
                to="/games"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 text-gray-300 hover:text-amber-400 font-medium text-md transition-all duration-300 py-3 px-4 rounded-lg hover:bg-white/5"
              >
                <Gamepad2 className="h-5 w-5" />
                <span>Games</span>
              </Link>
              <Link
                to="/blogs"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 text-gray-300 hover:text-amber-400 font-medium text-md transition-all duration-300 py-3 px-4 rounded-lg hover:bg-white/5"
              >
                <User className="h-5 w-5" />
                <span>Blog</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-primary text-center mt-4"
              >
                Login
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
