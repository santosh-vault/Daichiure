import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useAwardGameCoins(trigger: boolean) {
  const { user } = useAuth();
  useEffect(() => {
    if (trigger && user) {
      fetch('/functions/v1/award-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, activity: 'game' }),
      });
    }
  }, [trigger, user]);
} 