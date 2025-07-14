import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const REDEEM_AMOUNT = 1_000_000;

serve(async (req) => {
  try {
    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'Missing user_id' }), { status: 400 });
    }

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
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: err.message }), { status: 500 });
  }
}); 