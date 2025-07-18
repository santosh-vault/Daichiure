import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Environment variables for service role key and URL
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Updated coin values according to requirements
const COIN_VALUES: Record<string, number> = {
  visit: 10,
  game: 10,
  share: 5,
  referral: 2000, // Referral gives 2000 coins
  login: 1000,    // Login gives 1000 coins
  'fair-coin-redeem': 20, // Fair coin redemption gives 20 coins
};
const DAILY_LIMIT = 1200;

const allowedOrigins = [
  'http://localhost:5173',
  'https://daichiure.vercel.app',
];
function getCorsHeaders(origin: string | null) {
  const allowOrigin = allowedOrigins.includes(origin || '') ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
  }
  try {
    const { user_id, activity } = await req.json();
    if (!user_id || !COIN_VALUES[activity]) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400, headers: getCorsHeaders(origin) });
    }

    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, coins, last_visit_date, daily_coin_earnings')
      .eq('id', user_id)
      .single();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: getCorsHeaders(origin) });
    }

    // Get today's date (UTC)
    const today = new Date().toISOString().slice(0, 10);
    let dailyEarnings = user.daily_coin_earnings;
    let lastVisitDate = user.last_visit_date ? user.last_visit_date.slice(0, 10) : null;

    // Reset daily earnings if last visit was not today
    if (lastVisitDate !== today) {
      dailyEarnings = 0;
    }

    // Activities that are subject to daily limit
    const dailyLimited = ['visit', 'game', 'share'];
    const coinsToAward = COIN_VALUES[activity];
    
    // Check daily limit only for limited activities
    if (dailyLimited.includes(activity)) {
      if (dailyEarnings + coinsToAward > DAILY_LIMIT) {
        return new Response(JSON.stringify({ error: 'Daily coin limit reached' }), { status: 403, headers: getCorsHeaders(origin) });
      }
    }

    // If activity is 'visit', log the visit in user_visits (if not already logged for today)
    if (activity === 'visit') {
      const { data: visit, error: visitError } = await supabase
        .from('user_visits')
        .select('id')
        .eq('user_id', user_id)
        .eq('visit_date', today)
        .maybeSingle();
      if (!visit) {
        await supabase.from('user_visits').insert({
          user_id,
          visit_date: today,
        });
      }
    }

    // Award coins and update user
    const newCoinBalance = user.coins + coinsToAward;
    const newDailyEarnings = dailyLimited.includes(activity)
      ? dailyEarnings + coinsToAward
      : dailyEarnings; // Don't count referral and fair-coin-redeem towards daily limit
    
    const updates: any = {
      coins: newCoinBalance,
      daily_coin_earnings: newDailyEarnings,
      last_visit_date: today,
    };

    const { error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user_id);
    if (updateError) {
      return new Response(JSON.stringify({ error: 'Failed to update user' }), { status: 500, headers: getCorsHeaders(origin) });
    }

    // Log transaction with proper descriptions
    let description = '';
    switch (activity) {
      case 'login':
        description = 'Login reward';
        break;
      case 'game':
        description = 'Game start reward';
        break;
      case 'visit':
        description = 'Daily visit reward';
        break;
      case 'share':
        description = 'Blog share reward';
        break;
      case 'referral':
        description = 'Referral reward';
        break;
      case 'fair-coin-redeem':
        description = 'Fair play coin redeemed for coins';
        break;
      default:
        description = `${activity} reward`;
    }
    
    await supabase.from('coin_transactions').insert({
      user_id,
      type: activity,
      amount: coinsToAward,
      description,
    });

    return new Response(JSON.stringify({ coins: newCoinBalance, daily_coin_earnings: newDailyEarnings }), { status: 200, headers: getCorsHeaders(origin) });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: err.message }), { status: 500, headers: getCorsHeaders(origin) });
  }
});