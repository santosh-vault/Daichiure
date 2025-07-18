import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const allowedOrigins = [
  'http://localhost:5173',
  'https://daichiure.vercel.app',
];
function getCorsHeaders(origin: string | null) {
  const allowOrigin = allowedOrigins.includes(origin || '') ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: getCorsHeaders(origin) });
  }
  try {
    const { referrer_id, referred_email } = await req.json();
    if (!referrer_id || !referred_email) {
      return new Response(JSON.stringify({ error: 'Missing referrer_id or referred_email' }), { status: 400, headers: getCorsHeaders(origin) });
    }
    
    // Check if referred user exists
    const { data: referredUser, error: referredUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', referred_email)
      .single();
    if (referredUserError || !referredUser) {
      return new Response(JSON.stringify({ error: 'Referred user not found' }), { status: 404, headers: getCorsHeaders(origin) });
    }
    
    // Check if referral already exists
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', referrer_id)
      .eq('referred_id', referredUser.id)
      .maybeSingle();
    if (existingReferral) {
      return new Response(JSON.stringify({ error: 'Referral already exists' }), { status: 409, headers: getCorsHeaders(origin) });
    }
    
    // Generate a unique token for referral confirmation
    const token = Math.random().toString(36).substr(2, 12) + Date.now().toString(36);
    
    // Log referral as pending
    await supabase.from('referrals').insert({
      referrer_id,
      referred_id: referredUser.id,
      status: 'pending',
      token,
      created_at: new Date().toISOString(),
    });
    
    return new Response(JSON.stringify({ message: 'Referral created. Awaiting confirmation.', token }), { status: 200, headers: getCorsHeaders(origin) });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: err.message }), { status: 500, headers: getCorsHeaders(origin) });
  }
});