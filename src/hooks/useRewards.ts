import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSupabaseFunctionUrl } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface RewardData {
  coins: number;
  fair_coins: number;
  daily_coin_earnings: number;
  login_streak: number;
  last_login_date: string | null;
  referral_code: string | null;
  transactions: Array<{
    type: string;
    amount: number;
    description: string;
    created_at: string;
  }>;
  daily_progress: number;
  daily_remaining: number;
  daily_limit: number;
  weekly_progress: number;
  days_to_next_fair_coin: number;
  total_value_npr: number;
}

interface UseRewardsReturn {
  rewardData: RewardData | null;
  loading: boolean;
  error: string | null;
  awardCoins: (activity: string, options?: any) => Promise<void>;
  redeemFairCoin: () => Promise<void>;
  processReferral: (referralCode: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useRewards(): UseRewardsReturn {
  const { user } = useAuth();
  const [rewardData, setRewardData] = useState<RewardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRewardData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      console.log('🔍 Debug - User ID:', user.id);
      console.log('🔍 Debug - Has access token:', !!accessToken);
      
      // Check if we can get the function URL
      let functionUrl;
      try {
        functionUrl = getSupabaseFunctionUrl('get-reward-data');
        console.log('🔍 Debug - Function URL:', functionUrl);
      } catch (urlError) {
        console.error('Failed to get function URL:', urlError);
        setError('Rewards system not available');
        setLoading(false);
        return;
      }
      
      const requestBody = { user_id: user.id };
      console.log('🔍 Debug - Request body:', requestBody);
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🔍 Debug - Response status:', response.status);
      console.log('🔍 Debug - Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('🔍 Debug - Response data:', data);
      
      if (response.ok) {
        setRewardData(data);
      } else {
        setError(data.error || 'Failed to fetch reward data');
      }
    } catch (err) {
      console.error('🔍 Debug - Network error:', err);
      setError('Network error while fetching reward data');
    } finally {
      setLoading(false);
    }
  };

  const awardCoins = async (activity: string, options: any = {}) => {
    if (!user) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      // Check if we can get the function URL
      let functionUrl;
      try {
        functionUrl = getSupabaseFunctionUrl('award-coins');
      } catch (urlError) {
        console.error('Failed to get function URL:', urlError);
        throw new Error('Rewards system not available');
      }
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({
          user_id: user.id,
          activity,
          ...options
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Update local state with new data
        setRewardData(prev => prev ? {
          ...prev,
          coins: data.coins,
          fair_coins: data.fair_coins,
          daily_coin_earnings: data.daily_coin_earnings,
          login_streak: data.login_streak
        } : null);
      } else {
        throw new Error(data.error || 'Failed to award coins');
      }
    } catch (err) {
      throw err;
    }
  };

  const redeemFairCoin = async () => {
    if (!user) return;
    
    try {
      await awardCoins('fair_coin_redeem');
    } catch (err) {
      throw err;
    }
  };

  const processReferral = async (referralCode: string) => {
    if (!user) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      // Check if we can get the function URL
      let functionUrl;
      try {
        functionUrl = getSupabaseFunctionUrl('process-referral');
      } catch (urlError) {
        console.error('Failed to get function URL:', urlError);
        throw new Error('Rewards system not available');
      }
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({
          user_id: user.id,
          referral_code: referralCode
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process referral');
      }
      
      // Refresh data to get updated coin balance
      await fetchRewardData();
    } catch (err) {
      throw err;
    }
  };

  const refreshData = async () => {
    await fetchRewardData();
  };

  useEffect(() => {
    fetchRewardData();
  }, [user]);

  return {
    rewardData,
    loading,
    error,
    awardCoins,
    redeemFairCoin,
    processReferral,
    refreshData
  };
} 