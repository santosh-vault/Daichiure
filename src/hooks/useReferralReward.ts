import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

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
      const res = await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referrer_id: user.id, referred_email: referredEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Referral successful! You earned coins.');
      } else {
        setError(data.error || 'Failed to award referral coins.');
      }
    } catch (e) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return { referUser, loading, error, success };
} 