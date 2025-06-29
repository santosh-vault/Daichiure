import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Subscription {
  subscription_status: string;
  current_period_end?: number;
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
      // Temporarily disable subscription queries to fix immediate issues
      // TODO: Re-enable when database is properly set up
      console.log('Loading subscription for user:', user.id);
      setSubscription(null);
      setLoading(false);
      return;

      // Original database query (commented out for now)
      /*
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error);
      }

      setSubscription(data);
      */
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

  return {
    subscription,
    loading,
    hasActiveSubscription,
  };
};

// New hook to check if user has purchased a specific game
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
    if (!user || !gameSlug) return;

    try {
      console.log('Checking game purchase for:', gameSlug, 'user:', user.id);
      
      // First, let's check if the game exists in the database
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('id, title')
        .eq('slug', gameSlug)
        .single();

      if (gameError) {
        console.error('Game not found in database:', gameSlug, gameError);
        setHasPurchased(false);
        setLoading(false);
        return;
      }

      console.log('Game found in database:', gameData);

      // Now check if user has purchased this game
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          games!inner(
            slug
          )
        `)
        .eq('user_id', user.id)
        .eq('games.slug', gameSlug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - user hasn't purchased this game
          console.log('User has not purchased this game:', gameSlug);
          setHasPurchased(false);
        } else {
          console.error('Error checking game purchase:', error);
          setHasPurchased(false);
        }
      } else {
        console.log('User has purchased this game:', gameSlug, data);
        setHasPurchased(true);
      }
    } catch (error) {
      console.error('Error checking game purchase:', error);
      setHasPurchased(false);
    } finally {
      setLoading(false);
    }
  };

  // Temporary function to manually add a test purchase (for debugging)
  const addTestPurchase = async (gameSlug: string) => {
    if (!user) return;

    try {
      console.log('Adding test purchase for:', gameSlug);
      
      // First get the game ID
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('id')
        .eq('slug', gameSlug)
        .single();

      if (gameError) {
        console.error('Game not found:', gameError);
        return;
      }

      // Add the purchase
      const { data, error } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          game_id: gameData.id,
          amount_paid: 4.99
        })
        .select();

      if (error) {
        console.error('Error adding test purchase:', error);
      } else {
        console.log('Test purchase added successfully:', data);
        // Refresh the purchase check
        checkGamePurchase();
      }
    } catch (error) {
      console.error('Error adding test purchase:', error);
    }
  };

  return {
    hasPurchased,
    loading,
    addTestPurchase, // Expose this for debugging
  };
};