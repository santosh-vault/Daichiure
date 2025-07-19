// Debug script to check user status and function responses
// Run this in your browser console

const SUPABASE_URL = 'https://aepxsvgcoraegvbnhplu.supabase.co';
const USER_ID = '2ae4e144-dcbb-4bb2-823b-c4728fca38bd';

// Get the anon key from localStorage or environment
const anonKey = localStorage.getItem('sb-aepxsvgcoraegvbnhplu-auth-token')?.split('.')[0] || 
                import.meta.env?.VITE_SUPABASE_ANON_KEY || 
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcHhzdmdjb3JhZWd2Ym5ocGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzQsImV4cCI6MjA1MDU0ODk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

async function debugUserStatus() {
  console.log('🔍 Starting comprehensive debug...\n');
  
  try {
    // 1. Check if Supabase client works
    console.log('1️⃣ Testing Supabase client...');
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(SUPABASE_URL, anonKey);
    
    // 2. Check if user exists in auth
    console.log('2️⃣ Checking auth user...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth user:', user?.id);
    console.log('Auth error:', authError);
    
    // 3. Check if user exists in users table
    console.log('3️⃣ Checking users table...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', USER_ID)
      .single();
    
    console.log('User data:', userData);
    console.log('User error:', userError);
    
    // 4. Check table structure
    console.log('4️⃣ Checking table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('users')
      .select('id, email, coins, fair_coins, daily_coin_earnings, login_streak, referral_code')
      .eq('id', USER_ID)
      .single();
    
    console.log('Columns data:', columns);
    console.log('Columns error:', columnsError);
    
    // 5. Test function directly
    console.log('5️⃣ Testing function directly...');
    const accessToken = localStorage.getItem('sb-aepxsvgcoraegvbnhplu-auth-token');
    console.log('Access token exists:', !!accessToken);
    
    const functionResponse = await fetch(`${SUPABASE_URL}/functions/v1/get-reward-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
      },
      body: JSON.stringify({ user_id: USER_ID })
    });
    
    console.log('Function status:', functionResponse.status);
    console.log('Function headers:', Object.fromEntries(functionResponse.headers.entries()));
    
    const functionData = await functionResponse.json();
    console.log('Function response:', functionData);
    
    // 6. Check if user needs initialization
    if (userData && (!userData.coins || userData.coins === null)) {
      console.log('⚠️ User exists but needs initialization!');
      console.log('Run this SQL to initialize:');
      console.log(`
        UPDATE users 
        SET 
            coins = COALESCE(coins, 0),
            fair_coins = COALESCE(fair_coins, 0),
            daily_coin_earnings = COALESCE(daily_coin_earnings, 0),
            login_streak = COALESCE(login_streak, 0),
            referral_code = COALESCE(referral_code, upper(substring(md5(random()::text) from 1 for 6)))
        WHERE id = '${USER_ID}';
      `);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

// Export for browser console
if (typeof window !== 'undefined') {
  window.debugUserStatus = debugUserStatus;
  console.log('💡 Run debugUserStatus() to debug');
}

// Auto-run if in Node.js
if (typeof module !== 'undefined' && module.exports) {
  debugUserStatus();
} 