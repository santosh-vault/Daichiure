import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

// Environment variables for service role key and URL
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Coin values for each activity
const COIN_VALUES: Record<string, number> = {
  visit: 10,
  game: 50,
  share: 20,
  referral: 1000,
};
const DAILY_LIMIT = 1200;

serve(async (req) => {
  try {
    const { user_id, activity } = await req.json();
    if (!user_id || !COIN_VALUES[activity]) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
    }

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

    // Check daily limit
    const coinsToAward = COIN_VALUES[activity];
    if (dailyEarnings + coinsToAward > DAILY_LIMIT) {
      return new Response(JSON.stringify({ error: 'Daily coin limit reached' }), { status: 403 });
    }

    // If activity is 'visit', log the visit in user_visits (if not already logged for today)
    if (activity === 'visit') {
      const { data: visit, error: visitError } = await supabase
        .from('user_visits')
        .select('id')
        .eq('user_id', user_id)
        .eq('visit_date', today)
        .maybeSingle();
      if (!visit) {
        await supabase.from('user_visits').insert({
          user_id,
          visit_date: today,
        });
      }
    }

    // Award coins and update user
    const newCoinBalance = user.coins + coinsToAward;
    const newDailyEarnings = dailyEarnings + coinsToAward;
    const updates: any = {
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
    await supabase.from('coin_transactions').insert({
      user_id,
      type: activity,
      amount: coinsToAward,
      description: `${activity} reward`,
    });

    return new Response(JSON.stringify({ coins: newCoinBalance, daily_coin_earnings: newDailyEarnings }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: err.message }), { status: 500 });
  }
}); 