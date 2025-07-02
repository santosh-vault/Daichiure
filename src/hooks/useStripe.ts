import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface CreateCheckoutSessionParams {
  priceId: string;
  mode: 'payment' | 'subscription';
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
}

export const useStripe = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const createCheckoutSession = async ({
    priceId,
    mode,
    successUrl = `${window.location.origin}/success`,
    cancelUrl = window.location.href,
    metadata,
  }: CreateCheckoutSessionParams) => {
    if (!user) {
      toast.error('Please sign in to continue');
      return null;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Authentication required');
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            price_id: priceId,
            success_url: successUrl,
            cancel_url: cancelUrl,
            mode,
            metadata,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }

      return data;
    } catch (error: unknown) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCheckoutSession,
    loading,
  };
};