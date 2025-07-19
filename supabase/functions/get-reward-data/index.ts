import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  // For 204 No Content, don't include Content-Type or body
  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const { user_id } = await req.json();
    
    if (!user_id) {
      return corsResponse({ error: 'User ID required' }, 400);
    }

    // Fetch user reward data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('coins, fair_coins, daily_coin_earnings, login_streak, last_login_date, referral_code')
      .eq('id', user_id)
      .single();

    if (userError) {
      console.error('Database error:', userError);
      return corsResponse({ error: 'Database error', details: userError.message }, 500);
    }

    if (!user) {
      console.error('User not found:', user_id);
      return corsResponse({ error: 'User not found', user_id }, 200);
    }

    // Check if user has required columns
    if (user.coins === null || user.coins === undefined) {
      console.error('User missing reward columns:', user_id);
      return corsResponse({ 
        error: 'User needs initialization', 
        user_id,
        message: 'Please run the database migration and initialize user data'
      }, 200);
    }

    // Fetch recent transactions
    const { data: transactions, error: txError } = await supabase
      .from('coin_transactions')
      .select('type, amount, description, created_at')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (txError) {
      return corsResponse({ error: 'Failed to fetch transactions' }, 500);
    }

    // Calculate daily progress
    const today = new Date().toISOString().slice(0, 10);
    const dailyLimit = 1200;
    const dailyProgress = Math.min(user.daily_coin_earnings / dailyLimit, 1);
    const dailyRemaining = Math.max(0, dailyLimit - user.daily_coin_earnings);

    // Calculate weekly streak progress
    const weeklyProgress = Math.min(user.login_streak / 7, 1);
    const daysToNextFairCoin = Math.max(0, 7 - user.login_streak);

    // Calculate total value in NPR (1 coin = 0.01 NPR)
    const coinValueNPR = (user.coins + (user.fair_coins * 100)) * 0.01;

    return corsResponse({
      coins: user.coins,
      fair_coins: user.fair_coins,
      daily_coin_earnings: user.daily_coin_earnings,
      login_streak: user.login_streak,
      last_login_date: user.last_login_date,
      referral_code: user.referral_code,
      transactions: transactions || [],
      daily_progress: dailyProgress,
      daily_remaining: dailyRemaining,
      daily_limit: dailyLimit,
      weekly_progress: weeklyProgress,
      days_to_next_fair_coin: daysToNextFairCoin,
      total_value_npr: coinValueNPR
    });

  } catch (error: any) {
    console.error(`Get reward data error: ${error.message}`);
    return corsResponse({ error: 'Server error', details: error.message }, 500);
  }
}); 