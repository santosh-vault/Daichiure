export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const { user_id, activity } = await req.json();
  if (!user_id || !['visit', 'game', 'share', 'referral', 'login', 'fair-coin-redeem'].includes(activity)) {
    return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Updated coin values
  const COIN_VALUES = {
    visit: 10,
    game: 10,
    share: 5,
    referral: 0, // Referral handled in its own endpoint
    login: 1000,
    'fair-coin-redeem': 20,
  };
  const DAILY_LIMIT = 1200;

  // Fetch user data
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, coins, last_visit_date, daily_coin_earnings')
    .eq('id', user_id)
    .single();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
  }

  // Get today's date (UTC)
  const today = new Date().toISOString().slice(0, 10);
  let dailyEarnings = user.daily_coin_earnings;
  let lastVisitDate = user.last_visit_date ? user.last_visit_date.slice(0, 10) : null;

  // Reset daily earnings if last visit was not today
  if (lastVisitDate !== today) {
    dailyEarnings = 0;
  }

  // Only apply daily limit to these activities
  const dailyLimited = ['visit', 'game', 'share'];
  const coinsToAward = COIN_VALUES[activity];
  if (dailyLimited.includes(activity)) {
    if (dailyEarnings + coinsToAward > DAILY_LIMIT) {
      return new Response(JSON.stringify({ error: 'Daily coin limit reached' }), { status: 403 });
    }
  }

  // Award coins and update user
  const newCoinBalance = user.coins + coinsToAward;
  const newDailyEarnings = dailyLimited.includes(activity)
    ? dailyEarnings + coinsToAward
    : dailyEarnings;
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
    return new Response(JSON.stringify({ error: 'Failed to update user' }), { status: 500 });
  }

  // Log transaction
  let description = '';
  switch (activity) {
    case 'login':
      description = 'Login reward';
      break;
    case 'game':
      description = 'Game start reward';
      break;
    case 'visit':
      description = 'Daily visit reward';
      break;
    case 'share':
      description = 'Blog share reward';
      break;
    case 'fair-coin-redeem':
      description = 'Fair play coin redeemed for coins';
      break;
    default:
      description = `${activity} reward`;
  }
  await supabase.from('coin_transactions').insert({
    user_id,
    type: activity,
    amount: coinsToAward,
    description,
  });

  return new Response(
    JSON.stringify({ coins: newCoinBalance, daily_coin_earnings: newDailyEarnings }),
    { status: 200 }
  );
} 