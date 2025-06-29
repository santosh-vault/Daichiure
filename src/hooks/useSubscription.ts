import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Subscription {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean | null;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error);
      }

      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveSubscription = () => {
    return subscription?.subscription_status === 'active' || 
           subscription?.subscription_status === 'trialing';
  };

  const isSubscriptionCanceled = () => {
    return subscription?.cancel_at_period_end === true;
  };

  const refetch = () => {
    loadSubscription();
  };

  return {
    subscription,
    loading,
    hasActiveSubscription,
    isSubscriptionCanceled,
    refetch,
  };
};

// Hook to check if user has purchased a specific game
export const useGamePurchase = (gameSlug: string) => {
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user && gameSlug) {
      checkGamePurchase();
    } else {
      setHasPurchased(false);
      setLoading(false);
    }
  }, [user, gameSlug]);

  const checkGamePurchase = async () => {
    if (!user || !gameSlug) {
      setHasPurchased(false);
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Checking purchase for game:', gameSlug, 'user:', user.id);
      
      // First, check if the game exists in the database
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('id, title, is_premium')
        .eq('slug', gameSlug)
        .single();

      if (gameError) {
        console.error('❌ Game not found in database:', gameSlug, gameError);
        setHasPurchased(false);
        setLoading(false);
        return;
      }

      console.log('✅ Game found:', gameData);

      // If it's not a premium game, allow access
      if (!gameData.is_premium) {
        console.log('🆓 Game is free, allowing access');
        setHasPurchased(true);
        setLoading(false);
        return;
      }

      // For premium games, check if user has purchased it
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .select('id, amount_paid, purchase_date')
        .eq('user_id', user.id)
        .eq('game_id', gameData.id);

      if (purchaseError) {
        console.error('❌ Error checking purchases:', purchaseError);
        setHasPurchased(false);
      } else if (purchaseData && purchaseData.length > 0) {
        console.log('✅ Purchase found:', purchaseData);
        setHasPurchased(true);
      } else {
        console.log('❌ No purchase found for premium game');
        setHasPurchased(false);
      }
    } catch (error) {
      console.error('❌ Error in checkGamePurchase:', error);
      setHasPurchased(false);
    } finally {
      setLoading(false);
    }
  };

  const addTestPurchase = async (gameSlug: string) => {
    if (!user) {
      console.error('❌ No user for test purchase');
      return;
    }

    try {
      console.log('🧪 Adding test purchase for:', gameSlug);
      
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('id, title')
        .eq('slug', gameSlug)
        .single();

      if (gameError) {
        console.error('❌ Game not found for test purchase:', gameError);
        return;
      }

      const { data, error } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          game_id: gameData.id,
          amount_paid: 1.00
        })
        .select();

      if (error) {
        console.error('❌ Error adding test purchase:', error);
      } else {
        console.log('✅ Test purchase added successfully:', data);
        // Refresh the purchase check
        checkGamePurchase();
      }
    } catch (error) {
      console.error('❌ Error in addTestPurchase:', error);
    }
  };

  return {
    hasPurchased,
    loading,
    addTestPurchase,
  };
};