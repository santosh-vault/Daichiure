export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const { user_id } = await req.json();
  if (!user_id) {
    return new Response(JSON.stringify({ error: 'Missing user_id' }), { status: 400 });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

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
} 