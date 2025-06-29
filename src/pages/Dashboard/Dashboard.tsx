import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, TowerControl as GameController, CreditCard, Settings, Trophy } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SubscriptionStatus } from '../../components/SubscriptionStatus';
import { Link } from 'react-router-dom';

interface PurchasedGame {
  id: number;
  title: string;
  thumbnail_url: string;
  slug: string;
  purchase_date: string;
  amount_paid: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [purchasedGames, setPurchasedGames] = useState<PurchasedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('games');

  useEffect(() => {
    if (user) {
      loadPurchasedGames();
    }
  }, [user]);

  const loadPurchasedGames = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          purchase_date,
          amount_paid,
          games!inner(
            id,
            title,
            thumbnail_url,
            slug
          )
        `)
        .eq('user_id', user.id)
        .order('purchase_date', { ascending: false });

      if (error) {
        console.error('Error loading purchased games:', error);
      } else {
        const formattedGames = data?.map((purchase: any) => ({
          id: purchase.games.id,
          title: purchase.games.title,
          thumbnail_url: purchase.games.thumbnail_url,
          slug: purchase.games.slug,
          purchase_date: purchase.purchase_date,
          amount_paid: purchase.amount_paid,
        })) || [];
        setPurchasedGames(formattedGames);
      }
    } catch (error) {
      console.error('Error loading purchased games:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center font-inter">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-bruno-ace text-amber-400 mb-4">Access Denied</h2>
          <p className="text-gray-400">Please sign in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 mb-8 border border-gray-800">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-amber-500 to-amber-700 w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
              <User className="h-8 w-8 text-gray-950" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-['Bruno_Ace_SC'] text-amber-400">
                Welcome, {user.user_metadata?.full_name || 'Player'}
              </h1>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="mb-8">
          <SubscriptionStatus />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl mb-8 border border-gray-800">
          <div className="border-b border-gray-800">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('games')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'games'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-gray-400 hover:text-amber-400 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <GameController className="h-4 w-4" />
                  <span>My Games</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('purchases')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'purchases'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-gray-400 hover:text-amber-400 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Purchase History</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'settings'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-gray-400 hover:text-amber-400 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* My Games Tab */}
            {activeTab === 'games' && (
              <div>
                <h2 className="text-xl font-bold font-['Bruno_Ace_SC'] text-amber-400 mb-6">My Games</h2>
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-gray-800 rounded-xl h-48 animate-pulse border border-gray-700"></div>
                    ))}
                  </div>
                ) : purchasedGames.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold font-['Bruno_Ace_SC'] text-gray-300 mb-2">No games yet</h3>
                    <p className="text-gray-400 mb-6">
                      You haven't purchased any premium games yet. Browse our collection to get started!
                    </p>
                    <Link
                      to="/games"
                      className="bg-gradient-to-r from-amber-500 to-amber-700 text-gray-950 px-6 py-3 rounded-lg font-bold hover:shadow-[0_0_25px_rgba(255,215,0,0.7)] transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                      Browse Games
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {purchasedGames.map((game) => (
                      <div
                        key={game.id}
                        className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:shadow-[0_0_25px_rgba(255,215,0,0.3)] transition-all duration-300 ease-in-out transform hover:scale-105"
                      >
                        <img
                          src={game.thumbnail_url}
                          alt={game.title}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold font-['Bruno_Ace_SC'] text-amber-400 mb-2">{game.title}</h3>
                          <p className="text-sm text-gray-400 mb-4">
                            Purchased on {new Date(game.purchase_date).toLocaleDateString()}
                          </p>
                          <Link
                            to={`/games/${game.slug}`}
                            className="bg-gradient-to-r from-amber-500 to-amber-700 text-gray-950 px-4 py-2 rounded-lg text-sm font-bold hover:shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-all duration-300 ease-in-out transform hover:scale-105 w-full block text-center"
                          >
                            Play Now
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Purchase History Tab */}
            {activeTab === 'purchases' && (
              <div>
                <h2 className="text-xl font-bold font-['Bruno_Ace_SC'] text-amber-400 mb-6">Purchase History</h2>
                {purchasedGames.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold font-['Bruno_Ace_SC'] text-gray-300 mb-2">No purchases</h3>
                    <p className="text-gray-400">Your purchase history will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchasedGames.map((game) => (
                      <div
                        key={`${game.id}-${game.purchase_date}`}
                        className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-between hover:shadow-[0_0_15px_rgba(255,215,0,0.2)] transition-all duration-300"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={game.thumbnail_url}
                            alt={game.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <h3 className="font-semibold font-['Bruno_Ace_SC'] text-amber-400">{game.title}</h3>
                            <p className="text-sm text-gray-400">
                              {new Date(game.purchase_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-400">
                            ${game.amount_paid.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-bold font-['Bruno_Ace_SC'] text-amber-400 mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold font-['Bruno_Ace_SC'] text-amber-400 mb-4">Profile Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={user.user_metadata?.full_name || ''}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-100 placeholder-gray-400"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400"
                        />
                      </div>
                      <button className="bg-gradient-to-r from-amber-500 to-amber-700 text-gray-950 px-4 py-2 rounded-lg font-bold hover:shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-all duration-300 ease-in-out transform hover:scale-105">
                        Update Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};