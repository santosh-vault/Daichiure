// Fix user initialization script
// Run this in your browser console

const USER_ID = '2ae4e144-dcbb-4bb2-823b-c4728fca38bd';
const SUPABASE_URL = 'https://aepxsvgcoraegvbnhplu.supabase.co';

async function fixUserIssue() {
  console.log('🔧 Starting user fix process...\n');
  
  try {
    // Step 1: Check current user status
    console.log('1️⃣ Checking current user status...');
    
    const accessToken = localStorage.getItem('sb-aepxsvgcoraegvbnhplu-auth-token');
    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-reward-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
      },
      body: JSON.stringify({ user_id: USER_ID })
    });
    
    const data = await response.json();
    console.log('Current response:', data);
    
    // Step 2: If user needs initialization, provide SQL
    if (data.error === 'User not found' || data.error === 'User needs initialization') {
      console.log('\n2️⃣ User needs initialization!');
      console.log('Run this SQL in your Supabase dashboard:');
      console.log(`
-- First, check if user exists
SELECT id, email, coins, fair_coins, daily_coin_earnings, login_streak, referral_code 
FROM users 
WHERE id = '${USER_ID}';

-- If user doesn't exist, create it
INSERT INTO users (id, email, coins, fair_coins, daily_coin_earnings, login_streak, referral_code)
VALUES (
    '${USER_ID}',
    'user@example.com', -- Replace with actual email
    0, 0, 0, 0,
    upper(substring(md5(random()::text) from 1 for 6))
)
ON CONFLICT (id) DO NOTHING;

-- If user exists but has null values, update it
UPDATE users 
SET 
    coins = COALESCE(coins, 0),
    fair_coins = COALESCE(fair_coins, 0),
    daily_coin_earnings = COALESCE(daily_coin_earnings, 0),
    login_streak = COALESCE(login_streak, 0),
    referral_code = COALESCE(referral_code, upper(substring(md5(random()::text) from 1 for 6)))
WHERE id = '${USER_ID}';
      `);
      
      // Step 3: Try to initialize via function (if deployed)
      console.log('\n3️⃣ Trying to initialize via function...');
      try {
        const initResponse = await fetch(`${SUPABASE_URL}/functions/v1/initialize-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
          },
          body: JSON.stringify({ user_id: USER_ID })
        });
        
        if (initResponse.ok) {
          const initData = await initResponse.json();
          console.log('✅ User initialized via function:', initData);
        } else {
          console.log('❌ Initialize function not available or failed');
        }
      } catch (error) {
        console.log('❌ Initialize function error:', error.message);
      }
      
    } else if (data.coins !== undefined) {
      console.log('✅ User is already properly initialized!');
      console.log('User data:', data);
    }
    
    // Step 4: Test again after potential fix
    console.log('\n4️⃣ Testing again...');
    const testResponse = await fetch(`${SUPABASE_URL}/functions/v1/get-reward-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
      },
      body: JSON.stringify({ user_id: USER_ID })
    });
    
    const testData = await testResponse.json();
    console.log('Final test result:', testData);
    
    if (testData.coins !== undefined) {
      console.log('🎉 SUCCESS! User is now working properly!');
    } else {
      console.log('❌ Still having issues. Check the SQL above.');
    }
    
  } catch (error) {
    console.error('❌ Error during fix process:', error);
  }
}

// Export for browser console
if (typeof window !== 'undefined') {
  window.fixUserIssue = fixUserIssue;
  console.log('💡 Run fixUserIssue() to fix the user');
}

// Auto-run if in Node.js
if (typeof module !== 'undefined' && module.exports) {
  fixUserIssue();
} 