export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

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

  return new Response(JSON.stringify({ users: results }), { status: 200 });
} 