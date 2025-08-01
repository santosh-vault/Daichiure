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
const ADMIN_EMAILS = ["admin@daichiure.com", "developer@daichiure.com"];

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { rewardData, loading: rewardsLoading } = useRewards();
  const [search, setSearch] = useState("");

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
        <div className="flex justify-between items-center h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Logo - smaller */}
          <Link
            to="/"
            className="flex items-center space-x-1 sm:space-x-2 group animate-fade-in-scale min-w-fit"
          >
            <img
              src="/logo.png"
              alt="Daichiure Logo"
              className="h-6 w-6 sm:h-8 sm:w-8 object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
            <span className="text-lg sm:text-xl font-bold font-bruno-ace gradient-text drop-shadow-md">
              Daichiure
            </span>
          </Link>

          {/* Search Bar - centered and prominent */}
          {isUser && (
            <form
              onSubmit={handleSearchSubmit}
              className="hidden sm:flex flex-1 justify-center"
            >
              <div className="w-full max-w-xl flex items-center bg-gray-800/80 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-inner border border-gray-700 focus-within:ring-2 focus-within:ring-amber-400">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search games..."
                  className="flex-1 bg-transparent outline-none border-none text-gray-100 placeholder-gray-400 px-1 sm:px-2 text-sm sm:text-base"
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
                    className="w-4 h-4 sm:w-5 sm:h-5"
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
              className="hidden sm:flex flex-1 justify-center"
            >
              <div className="w-full max-w-xl flex items-center bg-gray-800/80 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-inner border border-gray-700 focus-within:ring-2 focus-within:ring-amber-400">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search games..."
                  className="flex-1 bg-transparent outline-none border-none text-gray-100 placeholder-gray-400 px-1 sm:px-2 text-sm sm:text-base"
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
                    className="w-4 h-4 sm:w-5 sm:h-5"
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
          <nav className="hidden md:flex items-center space-x-3 lg:space-x-6 min-w-fit">
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
                    className="btn-primary hover-lift px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm rounded-md"
                  >
                    Earn Money
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
                  <div className="flex items-center glass px-2 lg:px-4 py-1.5 lg:py-2 rounded-full text-amber-400 font-semibold text-xs lg:text-sm hover-lift">
                    <Coins className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2 animate-pulse" />
                    {rewardsLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <span>{rewardData?.coins?.toLocaleString() ?? 0}</span>
                    )}
                  </div>
                  <div className="flex items-center glass px-2 lg:px-4 py-1.5 lg:py-2 rounded-full text-blue-400 font-semibold text-xs lg:text-sm hover-lift ml-1 lg:ml-2">
                    <Trophy className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                    {rewardsLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <span>{rewardData?.fair_coins ?? 0}</span>
                    )}
                  </div>
                </div>
                <Link
                  to="/user-dashboard"
                  className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gray-800 hover:bg-gray-700 text-amber-400 text-xl shadow-lg ml-2 lg:ml-4"
                  aria-label="User profile"
                >
                  <UserIcon className="w-4 h-4 lg:w-6 lg:h-6" />
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
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 sm:p-3 rounded-xl text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all duration-300 hover-lift"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </button>
        </div>

        {/* Enhanced Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 sm:py-6 border-t border-white/10 glass-strong animate-fade-in-up">
            {/* Mobile Search Bar */}
            {(isUser || !isUserDashboard) && (
              <form onSubmit={handleSearchSubmit} className="px-4 mb-4">
                <div className="flex items-center bg-gray-800/80 rounded-full px-4 py-2 shadow-inner border border-gray-700 focus-within:ring-2 focus-within:ring-amber-400">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search games..."
                    className="flex-1 bg-transparent outline-none border-none text-gray-100 placeholder-gray-400 px-2 text-sm"
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
                      className="w-4 h-4"
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

            <nav className="flex flex-col space-y-2 px-4">
              {/* Guest Navigation */}
              {!user && (
                <>
                  <Link
                    to="/games"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 text-gray-300 hover:text-amber-400 font-medium text-sm transition-all duration-300 py-3 px-4 rounded-lg hover:bg-white/5"
                  >
                    <Gamepad2 className="h-5 w-5" />
                    <span>Games</span>
                  </Link>
                  <Link
                    to="/blogs"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 text-gray-300 hover:text-amber-400 font-medium text-sm transition-all duration-300 py-3 px-4 rounded-lg hover:bg-white/5"
                  >
                    <User className="h-5 w-5" />
                    <span>Blog</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-primary text-center mt-4 py-3 rounded-md"
                  >
                    Earn Money
                  </Link>
                </>
              )}

              {/* User Navigation */}
              {isUser && (
                <>
                  <Link
                    to="/games"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 text-gray-300 hover:text-amber-400 font-medium text-sm transition-all duration-300 py-3 px-4 rounded-lg hover:bg-white/5"
                  >
                    <Gamepad2 className="h-5 w-5" />
                    <span>Games</span>
                  </Link>
                  <Link
                    to="/blogs"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 text-gray-300 hover:text-amber-400 font-medium text-sm transition-all duration-300 py-3 px-4 rounded-lg hover:bg-white/5"
                  >
                    <User className="h-5 w-5" />
                    <span>Blog</span>
                  </Link>
                  <Link
                    to="/user-dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 text-gray-300 hover:text-amber-400 font-medium text-sm transition-all duration-300 py-3 px-4 rounded-lg hover:bg-white/5"
                  >
                    <UserIcon className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>

                  {/* Mobile Coins/Trophy Display */}
                  <div className="flex items-center justify-between py-3 px-4 bg-gray-800/30 rounded-lg mt-2">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-amber-400 font-semibold text-sm">
                        <Coins className="h-4 w-4 mr-2 animate-pulse" />
                        {rewardsLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          <span>
                            {rewardData?.coins?.toLocaleString() ?? 0}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-blue-400 font-semibold text-sm">
                        <Trophy className="h-4 w-4 mr-2" />
                        {rewardsLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          <span>{rewardData?.fair_coins ?? 0}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 text-red-400 hover:text-red-300 font-medium text-sm transition-all duration-300 py-3 px-4 rounded-lg hover:bg-red-500/10 mt-2"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}

              {/* Admin Navigation */}
              {isAdmin && (
                <>
                  <Link
                    to="/games"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 text-gray-300 hover:text-amber-400 font-medium text-sm transition-all duration-300 py-3 px-4 rounded-lg hover:bg-white/5"
                  >
                    <Gamepad2 className="h-5 w-5" />
                    <span>Games</span>
                  </Link>
                  <Link
                    to="/blogs"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 text-gray-300 hover:text-amber-400 font-medium text-sm transition-all duration-300 py-3 px-4 rounded-lg hover:bg-white/5"
                  >
                    <User className="h-5 w-5" />
                    <span>Blog</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 text-gray-300 hover:text-amber-400 font-medium text-sm transition-all duration-300 py-3 px-4 rounded-lg hover:bg-white/5"
                  >
                    <User className="h-5 w-5" />
                    <span>Admin Dashboard</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 text-red-400 hover:text-red-300 font-medium text-sm transition-all duration-300 py-3 px-4 rounded-lg hover:bg-red-500/10 mt-2"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
