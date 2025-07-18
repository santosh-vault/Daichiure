import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, coins, fair_play_coins');
    if (userError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch users' }), { status: 500, headers: getCorsHeaders(origin) });
    }
    const results = [];
    for (const user of users) {
      const { count } = await supabase
        .from('coin_transactions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      results.push({
        id: user.id,
        email: user.email,
        coins: user.coins,
        fair_play_coins: user.fair_play_coins,
        transaction_count: count ?? 0,
      });
    }
    return new Response(JSON.stringify({ users: results }), { status: 200, headers: getCorsHeaders(origin) });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: err.message }), { status: 500, headers: getCorsHeaders(origin) });
  }
}); 