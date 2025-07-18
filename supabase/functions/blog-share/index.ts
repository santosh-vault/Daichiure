import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const COINS_FOR_SHARE = 5;
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
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: getCorsHeaders(origin) });
  }
  try {
    const { user_id, blog_id } = await req.json();
    if (!user_id || !blog_id) {
      return new Response(JSON.stringify({ error: 'Missing user_id or blog_id' }), { status: 400, headers: getCorsHeaders(origin) });
    }
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, coins, last_visit_date, daily_coin_earnings')
      .eq('id', user_id)
      .single();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: getCorsHeaders(origin) });
    }
    const today = new Date().toISOString().slice(0, 10);
    let dailyEarnings = user.daily_coin_earnings;
    let lastVisitDate = user.last_visit_date ? user.last_visit_date.slice(0, 10) : null;
    if (lastVisitDate !== today) {
      dailyEarnings = 0;
    }
    if (dailyEarnings + COINS_FOR_SHARE > DAILY_LIMIT) {
      return new Response(JSON.stringify({ error: 'Daily coin limit reached' }), { status: 403, headers: getCorsHeaders(origin) });
    }
    const newCoinBalance = user.coins + COINS_FOR_SHARE;
    const newDailyEarnings = dailyEarnings + COINS_FOR_SHARE;
    const updates = {
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
    await supabase.from('coin_transactions').insert({
      user_id,
      type: 'share',
      amount: COINS_FOR_SHARE,
      description: `Blog share reward (blog_id: ${blog_id})`,
    });
    return new Response(
      JSON.stringify({ coins: newCoinBalance, daily_coin_earnings: newDailyEarnings }),
      { status: 200, headers: getCorsHeaders(origin) }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: err.message }), { status: 500, headers: getCorsHeaders(origin) });
  }
}); 