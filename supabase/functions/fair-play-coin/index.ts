import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
  try {
    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, weekly_fair_play_awarded, fair_play_coins');
    if (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch users' }), { status: 500, headers: getCorsHeaders(origin) });
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

    return new Response(JSON.stringify({ awarded: updatedCount }), { status: 200, headers: getCorsHeaders(origin) });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: err.message }), { status: 500, headers: getCorsHeaders(origin) });
  }
}); 