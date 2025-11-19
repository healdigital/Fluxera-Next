/**
 * Test script for RLS helper functions
 * Verifies that the helper functions were created successfully
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

async function testHelperFunctions() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔍 Testing RLS Helper Functions...\n');

  try {
    // Test 1: Check if functions exist
    console.log('1. Checking if functions exist...');
    const { error: functionsError } = await supabase.rpc('pg_get_functiondef', {
      funcid: 'supamode.has_permission_by_name',
    });

    if (functionsError) {
      console.log(
        '   ❌ Functions not found or error:',
        functionsError.message,
      );
    } else {
      console.log('   ✅ Functions exist');
    }

    // Test 2: Query function definitions from information_schema
    console.log('\n2. Querying function definitions...');
    const { data: routines, error: routinesError } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_schema')
      .in('routine_name', [
        'has_permission_by_name',
        'current_user_has_permission',
      ])
      .eq('routine_schema', 'supamode');

    if (routinesError) {
      console.log('   ❌ Error querying routines:', routinesError.message);
    } else if (routines && routines.length > 0) {
      console.log('   ✅ Found functions:');
      routines.forEach((r) =>
        console.log(`      - ${r.routine_schema}.${r.routine_name}`),
      );
    } else {
      console.log('   ⚠️  No functions found');
    }

    // Test 3: Check indexes
    console.log('\n3. Checking indexes...');
    const { data: indexes, error: indexesError } = await supabase
      .from('pg_indexes')
      .select('indexname, tablename')
      .in('indexname', ['idx_permissions_name', 'idx_account_roles_account_id'])
      .eq('schemaname', 'supamode');

    if (indexesError) {
      console.log('   ❌ Error querying indexes:', indexesError.message);
    } else if (indexes && indexes.length > 0) {
      console.log('   ✅ Found indexes:');
      indexes.forEach((i) =>
        console.log(`      - ${i.indexname} on ${i.tablename}`),
      );
    } else {
      console.log('   ⚠️  No indexes found');
    }

    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testHelperFunctions();
