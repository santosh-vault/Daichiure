import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Gamepad2, User, LogOut, Menu, X } from 'lucide-react';
import { getSupabaseFunctionUrl } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';

// Admin user emails - should match Dashboard.tsx
const ADMIN_EMAILS = ['admin@playhub.com', 'developer@playhub.com'];

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [coinData, setCoinData] = useState<{ coins: number; fair_play_coins: number } | null>(null);
  const [loadingCoins, setLoadingCoins] = useState(false);

  // Fetch coin and fair play coin balances
  useEffect(() => {
    const fetchCoins = async () => {
      if (!user) {
        setCoinData(null);
        return;
      }
      setLoadingCoins(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        const res = await fetch(getSupabaseFunctionUrl('get-reward-data'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
          },
          body: JSON.stringify({ user_id: user.id }),
        });
        const data = await res.json();
        if (res.ok) {
          setCoinData({ coins: data.coins, fair_play_coins: data.fair_play_coins });
        } else {
          setCoinData(null);
        }
      } catch {
        setCoinData(null);
      } finally {
        setLoadingCoins(false);
      }
    };
    fetchCoins();
  }, [user]);

  // Check if user is admin
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-gray-900 shadow-md border-b border-gray-800 sticky top-0 z-50 font-inter">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="bg-gradient-to-r from-amber-500 to-amber-700 p-3 rounded-xl shadow-lg group-hover:shadow-2xl transition-shadow duration-300 ease-in-out transform group-hover:scale-105">
            <Gamepad2 className="h-7 w-7 text-gray-950" />
          </div>
          <span className="text-3xl font-bold font-bruno-ace bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent drop-shadow-md">
            PlayHub
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-10">
          <Link
            to="/games"
            className="text-gray-300 hover:text-amber-400 font-medium text-md transition-colors duration-300 ease-in-out transform hover:scale-105"
          >
            Games
          </Link>
          <Link
            to="/categories"
            className="text-gray-300 hover:text-amber-400 font-medium text-md transition-colors duration-300 ease-in-out transform hover:scale-105"
          >
            Categories
          </Link>
          <Link
            to="/blogs"
            className="text-gray-300 hover:text-amber-400 font-medium text-md transition-colors duration-300 ease-in-out transform hover:scale-105"
          >
            Blog
          </Link>
          {user ? (
            <div className="flex items-center space-x-6">
              <Link
                to={isAdmin ? "/dashboard" : "/user-dashboard"}
                className="flex items-center space-x-2 text-gray-300 hover:text-amber-400 font-medium text-md transition-colors duration-300 ease-in-out transform hover:scale-105"
              >
                <User className="h-5 w-5" />
                <span>{isAdmin ? 'Dashboard' : 'My Dashboard'}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-300 hover:text-red-500 font-medium text-md transition-colors duration-300 ease-in-out transform hover:scale-105"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-6">
              <Link
                to="/login"
                className="text-gray-300 hover:text-amber-400 font-medium text-md transition-colors duration-300 ease-in-out transform hover:scale-105"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-amber-500 to-amber-700 text-gray-950 px-6 py-3 rounded-full font-bold text-md hover:shadow-[0_0_20px_rgba(255,215,0,0.7)] transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>

        {/* Coin balances */}
        {user && (
          <div className="flex items-center space-x-4 ml-6">
            <div className="flex items-center bg-gray-800 px-3 py-1 rounded-full text-amber-400 font-semibold text-sm">
              <span className="mr-1">Coins:</span>
              {loadingCoins ? <span className="animate-pulse">...</span> : <span>{coinData?.coins ?? 0}</span>}
            </div>
            <div className="flex items-center bg-gray-800 px-3 py-1 rounded-full text-blue-400 font-semibold text-sm">
              <span className="mr-1">Fair Play:</span>
              {loadingCoins ? <span className="animate-pulse">...</span> : <span>{coinData?.fair_play_coins ?? 0}</span>}
            </div>
            <button
              onClick={() => navigate('/rewards')}
              className="bg-gradient-to-r from-amber-500 to-amber-700 text-gray-950 px-5 py-2 rounded-full font-bold text-md ml-2 hover:shadow-[0_0_20px_rgba(255,215,0,0.7)] transition-all duration-300"
            >
              Claim Reward
            </button>
          </div>
        )}

        {/* Mobile menu button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-gray-300 hover:text-amber-400 hover:bg-gray-800 transition-colors duration-300"
        >
          {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden py-6 border-t border-gray-800 bg-gray-900">
          <nav className="flex flex-col space-y-5 px-4">
            <Link
              to="/games"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-300 hover:text-amber-400 font-medium text-md transition-colors duration-300 py-2 border-b border-gray-800"
            >
              Games
            </Link>
            <Link
              to="/categories"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-300 hover:text-amber-400 font-medium text-md transition-colors duration-300 py-2 border-b border-gray-800"
            >
              Categories
            </Link>
            <Link
              to="/blogs"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-300 hover:text-amber-400 font-medium text-md transition-colors duration-300 py-2 border-b border-gray-800"
            >
              Blog
            </Link>
            {user ? (
              <>
                <Link
                  to={isAdmin ? "/dashboard" : "/user-dashboard"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-amber-400 font-medium text-md transition-colors duration-300 py-2 border-b border-gray-800"
                >
                  <User className="h-5 w-5" />
                  <span>{isAdmin ? 'Dashboard' : 'My Dashboard'}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-gray-300 hover:text-red-500 font-medium text-md transition-colors duration-300 text-left py-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-amber-400 font-medium text-md transition-colors duration-300 py-2 border-b border-gray-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-gradient-to-r from-amber-500 to-amber-700 text-gray-950 px-6 py-3 rounded-full font-bold text-md hover:shadow-[0_0_20px_rgba(255,215,0,0.7)] transition-all duration-300 text-center mt-4"
                >
                  Get Started
                </Link>
              </>
            )}
            {user && (
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center bg-gray-800 px-3 py-1 rounded-full text-amber-400 font-semibold text-sm">
                  <span className="mr-1">Coins:</span>
                  {loadingCoins ? <span className="animate-pulse">...</span> : <span>{coinData?.coins ?? 0}</span>}
                </div>
                <div className="flex items-center bg-gray-800 px-3 py-1 rounded-full text-blue-400 font-semibold text-sm">
                  <span className="mr-1">Fair Play:</span>
                  {loadingCoins ? <span className="animate-pulse">...</span> : <span>{coinData?.fair_play_coins ?? 0}</span>}
                </div>
              </div>
            )}
            {user && (
              <button
                onClick={() => { setIsMobileMenuOpen(false); navigate('/rewards'); }}
                className="bg-gradient-to-r from-amber-500 to-amber-700 text-gray-950 px-5 py-2 rounded-full font-bold text-md mt-2 hover:shadow-[0_0_20px_rgba(255,215,0,0.7)] transition-all duration-300"
              >
                Claim Reward
              </button>
            )}
          </nav>
        </div>
      )}
    </div>
  </header>
  );
};