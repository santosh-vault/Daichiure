import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { addGamesToDatabase, checkGamesInDatabase } from '../utils/addGamesToDatabase';
import { useSubscription, useGamePurchase } from '../hooks/useSubscription';
import { Database, Bug, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export const Debug: React.FC = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { subscription, hasActiveSubscription } = useSubscription();
  const { hasPurchased, addTestPurchase } = useGamePurchase('rpg');

  const runDebugChecks = async () => {
    setLoading(true);
    const info: any = {};

    try {
      // Check user authentication
      info.user = {
        authenticated: !!user,
        id: user?.id,
        email: user?.email,
      };

      // Check subscription status
      info.subscription = {
        hasSubscription: hasActiveSubscription(),
        subscriptionData: subscription,
      };

      // Check game purchase status
      info.gamePurchase = {
        hasPurchasedRPG: hasPurchased,
      };

      // Check database games
      const hasGames = await checkGamesInDatabase();
      info.database = {
        hasGames,
      };

      // Check specific game in database
      if (user) {
        const { data: games, error: gamesError } = await supabase
          .from('games')
          .select('*')
          .eq('slug', 'rpg');

        info.rpgGame = {
          found: games && games.length > 0,
          data: games?.[0] || null,
          error: gamesError,
        };

        // Check user purchases
        const { data: purchases, error: purchasesError } = await supabase
          .from('purchases')
          .select(`
            *,
            games!inner(*)
          `)
          .eq('user_id', user.id);

        info.purchases = {
          count: purchases?.length || 0,
          data: purchases || [],
          error: purchasesError,
        };
      }

      setDebugInfo(info);
    } catch (error) {
      console.error('Debug check error:', error);
      info.error = error;
    } finally {
      setLoading(false);
    }
  };

  const handleAddGamesToDatabase = async () => {
    setLoading(true);
    try {
      const success = await addGamesToDatabase();
      if (success) {
        alert('Games added to database successfully!');
        await runDebugChecks();
      } else {
        alert('Failed to add games to database.');
      }
    } catch (error) {
      console.error('Error adding games:', error);
      alert('Error adding games to database.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestPurchase = async () => {
    if (!user) {
      alert('Please sign in first');
      return;
    }

    try {
      await addTestPurchase('rpg');
      alert('Test purchase added! Check console for details.');
      await runDebugChecks();
    } catch (error) {
      console.error('Test purchase error:', error);
      alert('Failed to add test purchase');
    }
  };

  useEffect(() => {
    runDebugChecks();
  }, [user]);

  const renderStatus = (condition: boolean, label: string) => (
    <div className="flex items-center space-x-2">
      {condition ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500" />
      )}
      <span className={condition ? 'text-green-400' : 'text-red-400'}>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 font-inter text-gray-100 antialiased py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold font-['Orbitron'] text-amber-400 mb-4 drop-shadow-md">
            Debug Panel
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-6">
            Troubleshoot purchase and database issues
          </p>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-900 rounded-2xl shadow-xl p-6 mb-8 border border-gray-800">
          <h2 className="text-2xl font-bold font-['Bruno_Ace_SC'] text-amber-400 mb-4">Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={runDebugChecks}
              disabled={loading}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Bug className="h-5 w-5" />
              <span>{loading ? 'Running...' : 'Run Debug Checks'}</span>
            </button>
            
            <button
              onClick={handleAddGamesToDatabase}
              disabled={loading}
              className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Database className="h-5 w-5" />
              <span>Add Games to DB</span>
            </button>
            
            <button
              onClick={handleAddTestPurchase}
              disabled={loading || !user}
              className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <AlertCircle className="h-5 w-5" />
              <span>Add Test Purchase</span>
            </button>
          </div>
        </div>

        {/* Debug Information */}
        <div className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-800">
          <h2 className="text-2xl font-bold font-['Bruno_Ace_SC'] text-amber-400 mb-6">Debug Information</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <p className="text-gray-300">Running debug checks...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* User Status */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-3">User Status</h3>
                {renderStatus(!!user, 'User Authenticated')}
                {user && (
                  <div className="mt-2 text-sm text-gray-300">
                    <p>ID: {user.id}</p>
                    <p>Email: {user.email}</p>
                  </div>
                )}
              </div>

              {/* Subscription Status */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-3">Subscription Status</h3>
                {renderStatus(hasActiveSubscription(), 'Has Active Subscription')}
                {subscription && (
                  <div className="mt-2 text-sm text-gray-300">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(subscription, null, 2)}</pre>
                  </div>
                )}
              </div>

              {/* Game Purchase Status */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-3">Game Purchase Status</h3>
                {renderStatus(hasPurchased, 'Has Purchased RPG Game')}
              </div>

              {/* Database Status */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-3">Database Status</h3>
                {renderStatus(debugInfo.database?.hasGames, 'Games in Database')}
                
                {debugInfo.rpgGame && (
                  <div className="mt-3">
                    <h4 className="text-md font-semibold text-gray-300 mb-2">RPG Game Details:</h4>
                    {renderStatus(debugInfo.rpgGame.found, 'RPG Game Found')}
                    {debugInfo.rpgGame.error && (
                      <p className="text-red-400 text-sm mt-1">Error: {debugInfo.rpgGame.error.message}</p>
                    )}
                    {debugInfo.rpgGame.data && (
                      <div className="mt-2 text-sm text-gray-300">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(debugInfo.rpgGame.data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Purchases */}
              {debugInfo.purchases && (
                <div className="bg-gray-800 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-white mb-3">User Purchases</h3>
                  <p className="text-gray-300">Total Purchases: {debugInfo.purchases.count}</p>
                  {debugInfo.purchases.error && (
                    <p className="text-red-400 text-sm mt-1">Error: {debugInfo.purchases.error.message}</p>
                  )}
                  {debugInfo.purchases.data.length > 0 && (
                    <div className="mt-2 text-sm text-gray-300">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(debugInfo.purchases.data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}

              {/* Raw Debug Info */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-3">Raw Debug Data</h3>
                <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-auto max-h-96">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 