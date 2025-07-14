export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const { referrer_id, referred_email } = await req.json();
  if (!referrer_id || !referred_email) {
    return new Response(JSON.stringify({ error: 'Missing referrer_id or referred_email' }), { status: 400 });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Check if referred user exists
  const { data: referredUser, error: referredUserError } = await supabase
    .from('users')
    .select('id')
    .eq('email', referred_email)
    .single();
  if (referredUserError || !referredUser) {
    return new Response(JSON.stringify({ error: 'Referred user not found' }), { status: 404 });
  }

  // Check if referral already exists
  const { data: existingReferral } = await supabase
    .from('referrals')
    .select('id')
    .eq('referrer_id', referrer_id)
    .eq('referred_id', referredUser.id)
    .maybeSingle();
  if (existingReferral) {
    return new Response(JSON.stringify({ error: 'Referral already exists' }), { status: 409 });
  }

  // Log referral
  await supabase.from('referrals').insert({
    referrer_id,
    referred_id: referredUser.id,
  });

  // Award coins to referrer
  const COINS_FOR_REFERRAL = 1000;
  const { data: referrer, error: referrerError } = await supabase
    .from('users')
    .select('coins')
    .eq('id', referrer_id)
    .single();
  if (referrerError || !referrer) {
    return new Response(JSON.stringify({ error: 'Referrer not found' }), { status: 404 });
  }
  const newBalance = referrer.coins + COINS_FOR_REFERRAL;
  await supabase.from('users').update({ coins: newBalance }).eq('id', referrer_id);
  await supabase.from('coin_transactions').insert({
    user_id: referrer_id,
    type: 'referral',
    amount: COINS_FOR_REFERRAL,
    description: 'Referral reward',
  });

  return new Response(JSON.stringify({ coins: newBalance }), { status: 200 });
} 