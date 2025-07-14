export const config = {
  schedule: '0 0 * * 0', // Every Sunday at midnight UTC
  runtime: 'edge'
};

export default async function handler(req) {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

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