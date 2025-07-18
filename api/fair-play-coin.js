export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const { redeem, user_id } = await req.json();
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (redeem && user_id) {
    // Redeem 1 fair play coin for 20 coins
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('fair_play_coins, coins')
      .eq('id', user_id)
      .single();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }
    if (user.fair_play_coins < 1) {
      return new Response(JSON.stringify({ error: 'Not enough fair play coins' }), { status: 400 });
    }
    const newFair = user.fair_play_coins - 1;
    const newCoins = user.coins + 20;
    await supabase.from('users').update({ fair_play_coins: newFair, coins: newCoins }).eq('id', user_id);
    await supabase.from('coin_transactions').insert({
      user_id,
      type: 'fair-coin-redeem',
      amount: 20,
      description: 'Fair play coin redeemed for coins',
    });
    return new Response(JSON.stringify({ coins: newCoins, fair_play_coins: newFair }), { status: 200 });
  }

  // Helper to get all dates in the last week (UTC, yyyy-mm-dd)
  function getLastWeekDates() {
    const dates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  }

  // Get all users
  const { data: users, error } = await supabase
    .from('users')
    .select('id, weekly_fair_play_awarded, fair_play_coins');
  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch users' }), { status: 500 });
  }

  const lastWeekDates = getLastWeekDates();
  const today = new Date().toISOString().slice(0, 10);
  let updatedCount = 0;

  for (const user of users) {
    // Only award if not already awarded this week
    if (user.weekly_fair_play_awarded === today) continue;

    // Check if user has a visit for each day in the last week
    const { data: visits, error: visitsError } = await supabase
      .from('user_visits')
      .select('visit_date')
      .eq('user_id', user.id)
      .in('visit_date', lastWeekDates);
    if (visitsError) continue;
    const visitDates = (visits || []).map(v => v.visit_date);
    const allDaysVisited = lastWeekDates.every(date => visitDates.includes(date));
    if (allDaysVisited) {
      // Award fair play coin
      await supabase.from('users').update({
        fair_play_coins: user.fair_play_coins + 1,
        weekly_fair_play_awarded: today,
      }).eq('id', user.id);
      updatedCount++;
    }
  }

  return new Response(JSON.stringify({ awarded: updatedCount }), { status: 200 });
}