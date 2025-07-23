// Simple test to check Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aepxsvgcoraegvbnhplu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcHhzdmdjb3JhZWd2Ym5ocGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwOTcxMzksImV4cCI6MjA2NjY3MzEzOX0.5YWvwlN4wErOZef1E86iupvJ66HNgIWR3X2Kp4G53tE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test with a simple email
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    console.log('Signup test result:', { data, error });
    
    if (error) {
      console.error('Signup error:', error.message);
    } else {
      console.log('Signup successful!');
    }
    
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testSignup();
