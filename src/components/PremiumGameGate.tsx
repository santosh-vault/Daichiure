import React from 'react';
import { Lock, Crown, CreditCard, ShoppingCart, Bug, AlertCircle } from 'lucide-react';
import { useSubscription, useGamePurchase } from '../hooks/useSubscription';
import { useAuth } from '../contexts/AuthContext';
import { useStripe } from '../hooks/useStripe';
import { stripeProducts } from '../stripe-config';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface PremiumGameGateProps {
  children: React.ReactNode;
  gameTitle: string;
  gamePrice: number;
  gameSlug: string;
}

export const PremiumGameGate: React.FC<PremiumGameGateProps> = ({
  children,
  gameTitle,
  gamePrice,
  gameSlug
}) => {
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading, hasActiveSubscription } = useSubscription();
  const { hasPurchased, loading: purchaseLoading, addTestPurchase } = useGamePurchase(gameSlug);
  const { createCheckoutSession, loading: checkoutLoading } = useStripe();

  const loading = subscriptionLoading || purchaseLoading;

  console.log('🎮 PremiumGameGate Debug:', {
    gameSlug,
    gameTitle,
    user: !!user,
    hasActiveSubscription: hasActiveSubscription(),
    hasPurchased,
    loading,
    subscription
  });

  const handlePurchaseGame = async () => {
    if (!user) {
      toast.error('Please sign in to purchase');
      return;
    }

    const gameProduct = stripeProducts.find(p => p.gameSlug === gameSlug);
    if (!gameProduct) {
      console.error('❌ Game product not found for slug:', gameSlug);
      console.log('Available products:', stripeProducts);
      toast.error('Game product not found. Please check console for details.');
      return;
    }

    try {
      console.log('💳 Starting purchase for game:', gameSlug, 'with product:', gameProduct);
      await createCheckoutSession({
        priceId: gameProduct.priceId,
        mode: gameProduct.mode,
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: window.location.href,
        metadata: {
          game_slug: gameSlug,
          game_title: gameTitle,
        },
      });
    } catch (error) {
      console.error('❌ Game purchase checkout error:', error);
      toast.error('Failed to start game purchase checkout');
    }
  };

  const handleSubscriptionPurchase = async () => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    const subscriptionProduct = stripeProducts.find(p => p.mode === 'subscription');
    if (!subscriptionProduct) {
      console.error('❌ Subscription product not found');
      toast.error('Subscription product not found');
      return;
    }

    try {
      console.log('💳 Starting subscription purchase:', subscriptionProduct);
      await createCheckoutSession({
        priceId: subscriptionProduct.priceId,
        mode: subscriptionProduct.mode,
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: window.location.href,
        metadata: {
          subscription_type: 'premium',
        },
      });
    } catch (error) {
      console.error('❌ Subscription checkout error:', error);
      toast.error('Failed to start subscription checkout');
    }
  };

  const handleTestPurchase = async () => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }
    
    try {
      await addTestPurchase(gameSlug);
      toast.success('Test purchase added! Check console for details.');
    } catch (error) {
      console.error('❌ Test purchase error:', error);
      toast.error('Failed to add test purchase');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Checking access...</p>
          </div>
        </div>
      </div>
    );
  }

  // If user has active subscription or has purchased this specific game, show the game
  if (hasActiveSubscription() || hasPurchased) {
    console.log('✅ Access granted - showing game');
    return <>{children}</>;
  }

  console.log('❌ Access denied - showing payment gate');

  // If no user, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700 max-w-md w-full">
          <div className="text-center">
            <Lock className="h-16 w-16 text-amber-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-amber-400 mb-4">Premium Game Locked</h2>
            <p className="text-gray-300 mb-6">
              {gameTitle} is a premium game. Please log in to purchase and play.
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full bg-amber-500 text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="block w-full border-2 border-amber-500 text-amber-500 px-6 py-3 rounded-lg font-bold hover:bg-amber-500 hover:text-gray-900 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in but no subscription or purchase, show payment options
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700 max-w-md w-full">
        <div className="text-center">
          <Crown className="h-16 w-16 text-amber-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-amber-400 mb-4">Premium Game</h2>
          <div className="bg-gray-800 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-bold text-white mb-2">{gameTitle}</h3>
            <p className="text-gray-300 text-sm mb-3">
              Choose how you'd like to access this premium game.
            </p>
          </div>
          
          <div className="space-y-3">
            {/* Individual Game Purchase */}
            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <h4 className="text-amber-400 font-bold mb-2">Buy This Game</h4>
              <div className="flex items-center justify-center space-x-2 text-amber-400 mb-3">
                <CreditCard className="h-5 w-5" />
                <span className="font-bold">${gamePrice.toFixed(2)}</span>
              </div>
              <button
                onClick={handlePurchaseGame}
                disabled={checkoutLoading}
                className="w-full bg-amber-500 text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>{checkoutLoading ? 'Redirecting to Stripe...' : `Buy ${gameTitle}`}</span>
              </button>
              <p className="text-xs text-gray-400 mt-2">One-time purchase • Lifetime access</p>
            </div>

            {/* Subscription Option */}
            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <h4 className="text-purple-400 font-bold mb-2">Premium Subscription</h4>
              <div className="flex items-center justify-center space-x-2 text-purple-400 mb-3">
                <Crown className="h-5 w-5" />
                <span className="font-bold">$9.99/month</span>
              </div>
              <button
                onClick={handleSubscriptionPurchase}
                disabled={checkoutLoading}
                className="w-full bg-purple-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Crown className="h-5 w-5" />
                <span>{checkoutLoading ? 'Redirecting to Stripe...' : 'Subscribe for All Games'}</span>
              </button>
              <p className="text-xs text-gray-400 mt-2">Access all premium games • Cancel anytime</p>
            </div>
            
            {/* Debug section */}
            <div className="mt-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-sm font-bold text-red-400">Debug Tools</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Use these tools to test the purchase system
              </p>
              
              <button
                onClick={handleTestPurchase}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Bug className="h-4 w-4" />
                <span>Add Test Purchase</span>
              </button>
            </div>
            
            <Link
              to="/games"
              className="block w-full border-2 border-gray-600 text-gray-300 px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
            >
              Browse Free Games
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};