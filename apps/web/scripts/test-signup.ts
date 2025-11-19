/**
 * Test script for sign-up functionality
 * Tests the sign-up process with email and password
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function testSignUp() {
  console.log('🧪 Testing Sign-Up Functionality\n');
  console.log('Configuration:');
  console.log(`- Supabase URL: ${supabaseUrl}`);
  console.log(`- Test Email: test@example.com`);
  console.log(`- Test Password: Leo2025!\n`);

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test sign-up
    console.log('📝 Attempting to sign up...');
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'Leo2025!',
      options: {
        emailRedirectTo: 'http://localhost:3001/auth/callback',
      },
    });

    if (error) {
      console.error('❌ Sign-up failed:', error.message);
      console.error('Error details:', error);
      return;
    }

    console.log('✅ Sign-up successful!');
    console.log('\nUser Details:');
    console.log(`- User ID: ${data.user?.id}`);
    console.log(`- Email: ${data.user?.email}`);
    console.log(
      `- Email Confirmed: ${data.user?.email_confirmed_at ? 'Yes' : 'No'}`,
    );
    console.log(`- Created At: ${data.user?.created_at}`);

    if (data.session) {
      console.log('\n✅ Session created automatically');
      console.log(
        `- Access Token: ${data.session.access_token.substring(0, 20)}...`,
      );
    } else {
      console.log(
        '\n⚠️  No session created - email confirmation may be required',
      );
      console.log(
        'Check your email inbox (or Mailpit at http://localhost:54324)',
      );
    }

    // Check if user exists in database
    console.log('\n🔍 Checking user in database...');
    const { data: userData, error: userError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', data.user?.id)
      .single();

    if (userError) {
      console.log(
        '⚠️  User not found in accounts table (may be created on first sign-in)',
      );
    } else {
      console.log('✅ User account found in database');
      console.log(`- Account ID: ${userData.id}`);
      console.log(`- Name: ${userData.name || 'Not set'}`);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Run the test
testSignUp()
  .then(() => {
    console.log('\n✨ Test completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
