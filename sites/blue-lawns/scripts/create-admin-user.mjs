#!/usr/bin/env node
/**
 * Create admin user in Supabase Auth
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✓' : '✗');
  console.error('\nPlease set SUPABASE_SERVICE_ROLE_KEY in your .env file.');
  console.error('You can find it in Supabase Dashboard > Settings > API > service_role key');
  process.exit(1);
}

// Create Supabase admin client (uses service role key for admin operations)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const email = 'ben@virgo.com';
const password = 'testadmin123';

console.log('🔄 Creating admin user...');
console.log(`   Email: ${email}`);

try {
  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find(u => u.email === email);

  if (existingUser) {
    console.log('⚠️  User already exists!');
    console.log(`   User ID: ${existingUser.id}`);
    console.log(`   Email: ${existingUser.email}`);
    console.log(`   Created: ${existingUser.created_at}`);
    
    // Try to update password
    console.log('\n🔄 Updating password...');
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      { password }
    );

    if (updateError) {
      console.error('❌ Failed to update password:', updateError.message);
      process.exit(1);
    }

    console.log('✅ Password updated successfully!');
    console.log('\n📝 User credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    process.exit(0);
  }

  // Create new user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email so user can login immediately
  });

  if (error) {
    console.error('❌ Failed to create user:', error.message);
    process.exit(1);
  }

  console.log('✅ User created successfully!');
  console.log(`   User ID: ${data.user.id}`);
  console.log(`   Email: ${data.user.email}`);
  console.log(`   Created: ${data.user.created_at}`);
  console.log('\n📝 Login credentials:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log('\n🔗 Test login at: http://localhost:4321/admin/login');
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}

