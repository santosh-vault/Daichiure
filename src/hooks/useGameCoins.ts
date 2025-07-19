import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSupabaseFunctionUrl } from '../lib/supabase';
import { supabase } from '../lib/supabase';

// Admin user emails - should match Header.tsx
const ADMIN_EMAILS = ['admin@playhub.com', 'developer@playhub.com'];

interface UseGameCoinsProps {
  gameId: string;
  trigger: boolean;
  score?: number;
  duration?: number;
}

export function useGameCoins({ gameId, trigger, score = 0, duration = 0 }: UseGameCoinsProps) {
  const { user } = useAuth();

  useEffect(() => {
    // Only award coins for regular users, not admins
    if (trigger && user && gameId && !ADMIN_EMAILS.includes(user.email || '')) {
      const awardGameCoins = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const accessToken = session?.access_token;
          
          await fetch(getSupabaseFunctionUrl('award-coins'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
            },
            body: JSON.stringify({
              user_id: user.id,
              activity: 'game',
              game_id: gameId,
              score,
              duration
            }),
          });
        } catch (error) {
          console.error('Failed to award game coins:', error);
        }
      };

      awardGameCoins();
    }
  }, [trigger, user, gameId, score, duration]);
} 