// Fix missing user records script
// Run this in your browser console

const SUPABASE_URL = 'https://aepxsvgcoraegvbnhplu.supabase.co';

async function fixMissingUsers() {
  console.log('🔧 Fixing missing user records...\n');
  
  try {
    // Step 1: Check current user
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(SUPABASE_URL, 'your-anon-key'); // Replace with your actual anon key
    
    const { data: { user } } = await supabase.auth.getUser();
    console.log('1️⃣ Current auth user:', user?.email);
    
    // Step 2: Check if user exists in users table
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user?.id)
      .single();
    
    console.log('2️⃣ User record in database:', userRecord);
    console.log('User error:', userError);
    
    if (!userRecord) {
      console.log('\n❌ User record missing! Run this SQL:');
      console.log(`
-- Create trigger for future users (run this first)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, coins, fair_coins, daily_coin_earnings, login_streak, referral_code)
  VALUES (
    new.id,
    new.email,
    0, 0, 0, 0,
    upper(substring(md5(random()::text) from 1 for 6))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create records for existing users (run this second)
INSERT INTO public.users (id, email, coins, fair_coins, daily_coin_earnings, login_streak, referral_code)
SELECT 
    au.id,
    au.email,
    0, 0, 0, 0,
    upper(substring(md5(random()::text) from 1 for 6))
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL
AND au.email != 'admin@playhub.com'; -- Exclude admin
      `);
    } else {
      console.log('✅ User record exists!');
      
      // Check if user has reward columns
      if (userRecord.coins === null || userRecord.coins === undefined) {
        console.log('\n⚠️ User missing reward columns! Run this SQL:');
        console.log(`
UPDATE users 
SET 
    coins = COALESCE(coins, 0),
    fair_coins = COALESCE(fair_coins, 0),
    daily_coin_earnings = COALESCE(daily_coin_earnings, 0),
    login_streak = COALESCE(login_streak, 0),
    referral_code = COALESCE(referral_code, upper(substring(md5(random()::text) from 1 for 6)))
WHERE id = '${user?.id}';
        `);
      } else {
        console.log('✅ User has all reward columns!');
      }
    }
    
    // Step 3: Test rewards function
    console.log('\n3️⃣ Testing rewards function...');
    const accessToken = localStorage.getItem('sb-aepxsvgcoraegvbnhplu-auth-token');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-reward-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
      },
      body: JSON.stringify({ user_id: user?.id })
    });
    
    const data = await response.json();
    console.log('Rewards function response:', data);
    
    if (data.coins !== undefined) {
      console.log('🎉 SUCCESS! Rewards system is working!');
    } else {
      console.log('❌ Still having issues. Run the SQL above.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Export for browser console
if (typeof window !== 'undefined') {
  window.fixMissingUsers = fixMissingUsers;
  console.log('💡 Run fixMissingUsers() to fix user records');
}

// Auto-run if in Node.js
if (typeof module !== 'undefined' && module.exports) {
  fixMissingUsers();
} 