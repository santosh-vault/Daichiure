import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

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

    const { user_id } = await req.json();
    
    if (!user_id) {
      return corsResponse({ error: 'User ID required' }, 400);
    }

    // Check if user exists in auth
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(user_id);
    
    if (authError || !user) {
      return corsResponse({ error: 'User not found in auth' }, 404);
    }

    // Check if user exists in users table
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, email, coins, fair_coins, daily_coin_earnings, login_streak, referral_code')
      .eq('id', user_id)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      return corsResponse({ error: 'Database error', details: userError.message }, 500);
    }

    let result;
    
    if (!existingUser) {
      // Create new user record
      const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: user_id,
          email: user.email,
          coins: 0,
          fair_coins: 0,
          daily_coin_earnings: 0,
          login_streak: 0,
          referral_code: referralCode
        })
        .select()
        .single();

      if (createError) {
        return corsResponse({ error: 'Failed to create user', details: createError.message }, 500);
      }

      result = newUser;
    } else {
      // Update existing user with default values if missing
      const updateData: any = {};
      
      if (existingUser.coins === null || existingUser.coins === undefined) updateData.coins = 0;
      if (existingUser.fair_coins === null || existingUser.fair_coins === undefined) updateData.fair_coins = 0;
      if (existingUser.daily_coin_earnings === null || existingUser.daily_coin_earnings === undefined) updateData.daily_coin_earnings = 0;
      if (existingUser.login_streak === null || existingUser.login_streak === undefined) updateData.login_streak = 0;
      if (!existingUser.referral_code) updateData.referral_code = Math.random().toString(36).substring(2, 8).toUpperCase();

      if (Object.keys(updateData).length > 0) {
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', user_id)
          .select()
          .single();

        if (updateError) {
          return corsResponse({ error: 'Failed to update user', details: updateError.message }, 500);
        }

        result = updatedUser;
      } else {
        result = existingUser;
      }
    }

    return corsResponse({
      message: 'User initialized successfully',
      user: {
        id: result.id,
        email: result.email,
        coins: result.coins,
        fair_coins: result.fair_coins,
        daily_coin_earnings: result.daily_coin_earnings,
        login_streak: result.login_streak,
        referral_code: result.referral_code
      }
    });

  } catch (error: any) {
    console.error(`Initialize user error: ${error.message}`);
    return corsResponse({ error: 'Server error', details: error.message }, 500);
  }
}); 