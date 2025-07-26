import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

// Coin values for different activities
const COIN_VALUES = {
  login: 100,
  game: 20,
  comment: 5,
  share: 5,
  referral: 1000,
  fair_coin_redeem: 100,
  weekly_fair_coin: 0  // Special case: adds fair coin instead of regular coins
};

const DAILY_LIMIT = 1200;

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  // For 204 No Content, don't include Content-Type or body
  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const { user_id, activity, game_id, blog_id, platform, score, duration } = await req.json();
    
    if (!user_id || !COIN_VALUES[activity]) {
      return corsResponse({ error: 'Invalid input' }, 400);
    }

    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, coins, fair_coins, daily_coin_earnings, last_login_date, login_streak, referral_code, last_fair_coin_awarded')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return corsResponse({ error: 'User not found' }, 404);
    }

    const today = new Date().toISOString().slice(0, 10);
    const coinsToAward = COIN_VALUES[activity];
    let newCoinBalance = user.coins;
    let newDailyEarnings = user.daily_coin_earnings;
    let newLoginStreak = user.login_streak;
    let newLastLoginDate = user.last_login_date;
    let description = '';

    // Check if a new day has started to reset daily earnings
    if (user.last_login_date && user.last_login_date < today) {
      newDailyEarnings = 0;
    }

    // Handle different activities
    switch (activity) {
      case 'login':
        // Check if already logged in today
        if (user.last_login_date === today) {
          return corsResponse({ error: 'Already logged in today' }, 400);
        }

        // Update login streak
        if (user.last_login_date) {
          const lastLogin = new Date(user.last_login_date);
          const todayDate = new Date(today);
          const diffTime = todayDate.getTime() - lastLogin.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newLoginStreak = user.login_streak + 1;
          } else if (diffDays > 1) {
            newLoginStreak = 1;
          }
        } else {
          newLoginStreak = 1;
        }

        newLastLoginDate = today;
        description = 'Daily login reward';
        break;

      case 'game':
        if (!game_id) {
          return corsResponse({ error: 'Game ID required' }, 400);
        }

        // Log game play
        await supabase.from('game_plays').insert({
          user_id,
          game_id,
          score: score || 0,
          duration: duration || 0
        });

        description = 'Game completion reward';
        break;

      case 'comment':
        if (!blog_id) {
          return corsResponse({ error: 'Blog ID required' }, 400);
        }

        description = 'Blog comment reward';
        break;

      case 'share':
        if (!blog_id || !platform) {
          return corsResponse({ error: 'Blog ID and platform required' }, 400);
        }

        // Check if already shared this blog on this platform today
        const { data: existingShare } = await supabase
          .from('blog_shares')
          .select('id')
          .eq('user_id', user_id)
          .eq('blog_id', blog_id)
          .eq('platform', platform)
          .gte('created_at', today)
          .single();

        if (existingShare) {
          return corsResponse({ error: 'Already shared this blog on this platform today' }, 400);
        }

        // Log share
        await supabase.from('blog_shares').insert({
          user_id,
          blog_id,
          platform
        });

        description = `Blog share reward (${platform})`;
        break;

      case 'referral':
        description = 'Referral reward';
        break;

      case 'fair_coin_redeem':
        if (user.fair_coins < 1) {
          return corsResponse({ error: 'Not enough fair coins' }, 400);
        }
        description = 'Fair coin redemption';
        break;

      case 'weekly_fair_coin':
        // Check if user has 7+ day streak and hasn't been awarded fair coin for this streak
        if (user.login_streak < 7) {
          return corsResponse({ error: 'Login streak less than 7 days' }, 400);
        }
        
        // Check if already awarded fair coin within the last 7 days
        if (user.last_fair_coin_awarded) {
          const lastAwarded = new Date(user.last_fair_coin_awarded);
          const today = new Date();
          const diffTime = today.getTime() - lastAwarded.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays < 7) {
            return corsResponse({ error: 'Fair coin already awarded within the last 7 days' }, 400);
          }
        }
        
        description = 'Weekly login streak fair coin reward';
        break;
    }

    // Check daily limit (referrals, fair coin redemption, and weekly fair coins are exempt)
    const dailyLimited = ['login', 'game', 'comment', 'share'];
    if (dailyLimited.includes(activity)) {
      if (newDailyEarnings + coinsToAward > DAILY_LIMIT) {
        return corsResponse({ error: 'Daily coin limit reached' }, 403);
      }
      newDailyEarnings += coinsToAward;
    }

    // Update user
    const updateData: any = {
      coins: newCoinBalance + coinsToAward,
      daily_coin_earnings: newDailyEarnings
    };

    if (activity === 'login') {
      updateData.last_login_date = newLastLoginDate;
      updateData.login_streak = newLoginStreak;
    }

    if (activity === 'fair_coin_redeem') {
      updateData.fair_coins = user.fair_coins - 1;
    }

    if (activity === 'weekly_fair_coin') {
      // Award fair coin instead of regular coins
      updateData.fair_coins = user.fair_coins + 1;
      updateData.coins = newCoinBalance; // Don't add regular coins for this activity
      updateData.last_fair_coin_awarded = today; // Track when fair coin was awarded
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user_id);

    if (updateError) {
      return corsResponse({ error: 'Failed to update user' }, 500);
    }

    // Log transaction
    await supabase.from('coin_transactions').insert({
      user_id,
      type: activity,
      amount: activity === 'weekly_fair_coin' ? 1 : coinsToAward, // Log fair coin as 1, regular coins as coinsToAward
      description
    });

    // Log visit for login
    if (activity === 'login') {
      await supabase.from('user_visits').insert({
        user_id,
        visit_date: today
      });
    }

    return corsResponse({ 
      coins: activity === 'weekly_fair_coin' ? newCoinBalance : newCoinBalance + coinsToAward,
      fair_coins: activity === 'fair_coin_redeem' ? user.fair_coins - 1 : 
                  activity === 'weekly_fair_coin' ? user.fair_coins + 1 : user.fair_coins,
      daily_coin_earnings: newDailyEarnings,
      login_streak: newLoginStreak
    });

  } catch (error: any) {
    console.error(`Award coins error: ${error.message}`);
    return corsResponse({ error: 'Server error', details: error.message }, 500);
  }
}); 