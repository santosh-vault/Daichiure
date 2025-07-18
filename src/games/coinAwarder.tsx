import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSupabaseFunctionUrl } from '../lib/supabase';
import { supabase } from '../lib/supabase';

export function useAwardGameCoins(trigger: boolean) {
  const { user } = useAuth();
  useEffect(() => {
    if (trigger && user) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const accessToken = session?.access_token;
        fetch(getSupabaseFunctionUrl('award-coins'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
          },
          body: JSON.stringify({ user_id: user.id, activity: 'game' }),
        });
      });
    }
  }, [trigger, user]);
} 