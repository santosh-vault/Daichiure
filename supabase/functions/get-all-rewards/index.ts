import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (_req) => {
  try {
    // Fetch all users with their coin and fair play coin balances
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, coins, fair_play_coins');
    if (userError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch users' }), { status: 500 });
    }

    // For each user, fetch total number of transactions
    const results = [];
    for (const user of users) {
      const { count, error: txError } = await supabase
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

    return new Response(JSON.stringify({ users: results }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: err.message }), { status: 500 });
  }
}); 