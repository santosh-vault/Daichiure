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

    const { user_id, referral_code } = await req.json();
    
    if (!user_id || !referral_code) {
      return corsResponse({ error: 'User ID and referral code required' }, 400);
    }

    // Find the referrer by referral code
    const { data: referrer, error: referrerError } = await supabase
      .from('users')
      .select('id, coins, referral_code')
      .eq('referral_code', referral_code)
      .single();

    if (referrerError || !referrer) {
      return corsResponse({ error: 'Invalid referral code' }, 404);
    }

    // Check if user is trying to refer themselves
    if (referrer.id === user_id) {
      return corsResponse({ error: 'Cannot refer yourself' }, 400);
    }

    // Check if user was already referred
    const { data: existingReferral } = await supabase
      .from('users')
      .select('referred_by')
      .eq('id', user_id)
      .single();

    if (existingReferral?.referred_by) {
      return corsResponse({ error: 'User already referred' }, 400);
    }

    // Update user with referrer
    const { error: updateError } = await supabase
      .from('users')
      .update({ referred_by: referrer.id })
      .eq('id', user_id);

    if (updateError) {
      return corsResponse({ error: 'Failed to update user' }, 500);
    }

    // Award coins to referrer (referrals are exempt from daily limit)
    const referralCoins = 1000;
    const { error: awardError } = await supabase
      .from('users')
      .update({ coins: referrer.coins + referralCoins })
      .eq('id', referrer.id);

    if (awardError) {
      return corsResponse({ error: 'Failed to award referral coins' }, 500);
    }

    // Log transaction for referrer
    await supabase.from('coin_transactions').insert({
      user_id: referrer.id,
      type: 'referral',
      amount: referralCoins,
      description: 'Referral reward'
    });

    return corsResponse({ 
      message: 'Referral processed successfully',
      referrer_coins: referrer.coins + referralCoins
    });

  } catch (error: any) {
    console.error(`Process referral error: ${error.message}`);
    return corsResponse({ error: 'Server error', details: error.message }, 500);
  }
}); 