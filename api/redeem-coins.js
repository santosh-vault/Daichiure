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

  const REDEEM_AMOUNT = 1_000_000;

  // Fetch user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('coins')
    .eq('id', user_id)
    .single();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
  }

  if (user.coins < REDEEM_AMOUNT) {
    return new Response(JSON.stringify({ error: 'Not enough coins to redeem' }), { status: 403 });
  }

  // Deduct coins
  const newBalance = user.coins - REDEEM_AMOUNT;
  const { error: updateError } = await supabase
    .from('users')
    .update({ coins: newBalance })
    .eq('id', user_id);
  if (updateError) {
    return new Response(JSON.stringify({ error: 'Failed to update user' }), { status: 500 });
  }

  // Log redemption
  await supabase.from('coin_transactions').insert({
    user_id,
    type: 'redeem',
    amount: -REDEEM_AMOUNT,
    description: 'Coin redemption',
  });

  return new Response(JSON.stringify({ coins: newBalance }), { status: 200 });
} 