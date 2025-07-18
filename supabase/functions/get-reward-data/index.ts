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
    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'Missing user_id' }), { status: 400, headers: getCorsHeaders(origin) });
    }
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('coins, fair_play_coins')
      .eq('id', user_id)
      .single();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: getCorsHeaders(origin) });
    }
    const { data: transactions, error: txError } = await supabase
      .from('coin_transactions')
      .select('type, amount, description, created_at')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (txError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch transactions' }), { status: 500, headers: getCorsHeaders(origin) });
    }
    return new Response(
      JSON.stringify({
        coins: user.coins,
        fair_play_coins: user.fair_play_coins,
        transactions,
      }),
      { status: 200, headers: getCorsHeaders(origin) }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: err.message }), { status: 500, headers: getCorsHeaders(origin) });
  }
}); 