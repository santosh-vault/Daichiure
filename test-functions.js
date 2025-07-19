// Test script to debug Supabase Edge Functions
// Run this in your browser console or as a Node.js script

const SUPABASE_URL = 'https://aepxsvgcoraegvbnhplu.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here'; // Replace with your actual anon key

// Test function URLs
const functionUrls = {
  'get-reward-data': `${SUPABASE_URL}/functions/v1/get-reward-data`,
  'award-coins': `${SUPABASE_URL}/functions/v1/award-coins`,
  'process-referral': `${SUPABASE_URL}/functions/v1/process-referral`
};

// Test 1: Check if functions are accessible (without auth)
async function testFunctionAccess() {
  console.log('🔍 Testing function access...');
  
  for (const [name, url] of Object.entries(functionUrls)) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true })
      });
      
      console.log(`${name}: Status ${response.status} - ${response.statusText}`);
      
      if (response.status === 401) {
        console.log(`✅ ${name}: Function exists but requires authentication`);
      } else if (response.status === 404) {
        console.log(`❌ ${name}: Function not found - not deployed`);
      } else {
        console.log(`⚠️ ${name}: Unexpected status - ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${name}: Network error - ${error.message}`);
    }
  }
}

// Test 2: Check environment variables
function testEnvironmentVariables() {
  console.log('\n🔍 Testing environment variables...');
  
  const envVars = {
    'VITE_SUPABASE_URL': import.meta.env?.VITE_SUPABASE_URL || 'Not found',
    'VITE_SUPABASE_ANON_KEY': import.meta.env?.VITE_SUPABASE_ANON_KEY ? 'Found' : 'Not found'
  };
  
  for (const [key, value] of Object.entries(envVars)) {
    console.log(`${key}: ${value}`);
  }
}

// Test 3: Check database connection
async function testDatabaseConnection() {
  console.log('\n🔍 Testing database connection...');
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Try to query the users table
    const { data, error } = await supabase
      .from('users')
      .select('id, email')
      .limit(1);
    
    if (error) {
      console.log(`❌ Database error: ${error.message}`);
    } else {
      console.log(`✅ Database connection successful`);
      console.log(`📊 Users table accessible: ${data?.length || 0} users found`);
    }
  } catch (error) {
    console.log(`❌ Database connection failed: ${error.message}`);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Supabase Functions Debug Tests...\n');
  
  await testFunctionAccess();
  testEnvironmentVariables();
  await testDatabaseConnection();
  
  console.log('\n✅ Debug tests completed!');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testSupabaseFunctions = runAllTests;
  console.log('💡 Run testSupabaseFunctions() in console to debug');
}

// Run if this is a Node.js script
if (typeof module !== 'undefined' && module.exports) {
  runAllTests();
} 