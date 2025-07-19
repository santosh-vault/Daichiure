#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎮 Rewards System Deployment Script');
console.log('=====================================\n');

// Check if Supabase CLI is installed
try {
  execSync('supabase --version', { stdio: 'pipe' });
  console.log('✅ Supabase CLI is installed');
} catch (error) {
  console.log('❌ Supabase CLI is not installed');
  console.log('Please install it with: npm install -g supabase');
  process.exit(1);
}

// Check if project is linked
try {
  execSync('supabase status', { stdio: 'pipe' });
  console.log('✅ Supabase project is linked');
} catch (error) {
  console.log('❌ Supabase project is not linked');
  console.log('Please link your project with: supabase link --project-ref YOUR_PROJECT_REF');
  process.exit(1);
}

// Deploy database migration
console.log('\n📊 Deploying database migration...');
try {
  execSync('supabase db push', { stdio: 'inherit' });
  console.log('✅ Database migration deployed successfully');
} catch (error) {
  console.log('❌ Failed to deploy database migration');
  process.exit(1);
}

// Deploy edge functions
const functions = ['award-coins', 'get-reward-data', 'process-referral'];

console.log('\n🚀 Deploying edge functions...');
for (const func of functions) {
  try {
    console.log(`Deploying ${func}...`);
    execSync(`supabase functions deploy ${func}`, { stdio: 'inherit' });
    console.log(`✅ ${func} deployed successfully`);
  } catch (error) {
    console.log(`❌ Failed to deploy ${func}`);
    process.exit(1);
  }
}

console.log('\n🎉 Rewards system deployment completed!');
console.log('\nNext steps:');
console.log('1. Test login with a regular user (should award 100 coins)');
console.log('2. Play a game and complete it (should award 20 coins)');
console.log('3. Visit /rewards to see your rewards dashboard');
console.log('4. Test referral system with a friend');

console.log('\n📝 Don\'t forget to:');
console.log('- Add useGameCoins hook to all your games');
console.log('- Test the system thoroughly');
console.log('- Check Supabase dashboard for any errors'); 