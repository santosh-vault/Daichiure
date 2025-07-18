export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const { token } = await req.json();
  if (!token) {
    return new Response(JSON.stringify({ error: 'Missing token' }), { status: 400 });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Find the pending referral by token
  const { data: referral, error: referralError } = await supabase
    .from('referrals')
    .select('id, referrer_id, referred_id, status')
    .eq('token', token)
    .eq('status', 'pending')
    .maybeSingle();
  if (referralError || !referral) {
    return new Response(JSON.stringify({ error: 'Invalid or already confirmed token' }), { status: 404 });
  }

  // Mark referral as completed
  await supabase.from('referrals').update({ status: 'completed', confirmed_at: new Date().toISOString() }).eq('id', referral.id);

  // Award 2000 coins to referrer (not subject to daily limit)
  const COINS_FOR_REFERRAL = 2000;
  const { data: referrer, error: referrerError } = await supabase
    .from('users')
    .select('coins')
    .eq('id', referral.referrer_id)
    .single();
  if (referrerError || !referrer) {
    return new Response(JSON.stringify({ error: 'Referrer not found' }), { status: 404 });
  }
  const newBalance = referrer.coins + COINS_FOR_REFERRAL;
  await supabase.from('users').update({ coins: newBalance }).eq('id', referral.referrer_id);
  await supabase.from('coin_transactions').insert({
    user_id: referral.referrer_id,
    type: 'referral',
    amount: COINS_FOR_REFERRAL,
    description: 'Referral reward (confirmed)',
  });

  return new Response(JSON.stringify({ message: 'Referral confirmed and coins awarded.' }), { status: 200 });
} 