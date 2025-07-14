import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'Missing user_id' }), { status: 400 });
    }

    // Fetch user balances
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('coins, fair_play_coins')
      .eq('id', user_id)
      .single();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Fetch recent transactions (last 20)
    const { data: transactions, error: txError } = await supabase
      .from('coin_transactions')
      .select('type, amount, description, created_at')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (txError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch transactions' }), { status: 500 });
    }

    return new Response(
      JSON.stringify({
        coins: user.coins,
        fair_play_coins: user.fair_play_coins,
        transactions,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: err.message }), { status: 500 });
  }
}); 