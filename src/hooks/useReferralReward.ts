import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSupabaseFunctionUrl } from '../lib/supabase';
import { supabase } from '../lib/supabase';

export function useReferralReward() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const referUser = async (referredEmail: string) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const res = await fetch(getSupabaseFunctionUrl('referral'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({ referrer_id: user.id, referred_email: referredEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Referral sent! You will earn 2000 coins when they confirm their visit.');
      } else {
        setError(data.error || 'Failed to send referral. Please check the email.');
      }
    } catch (e) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const confirmReferral = async (token: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/referral-confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Referral confirmed! Coins have been awarded.');
      } else {
        setError(data.error || 'Failed to confirm referral.');
      }
    } catch (e) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return { referUser, confirmReferral, loading, error, success };
}