#!/usr/bin/env node

/**
 * Create Admin User Script
 * 
 * This script creates an admin user in your Supabase database.
 * Run: node scripts/create-admin.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');

try {
  const envFile = readFileSync(envPath, 'utf-8');
  const envVars = {};
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      envVars[key] = value;
    }
  });
  
  // Set environment variables
  Object.assign(process.env, envVars);
} catch (error) {
  console.error('Error loading .env.local file:', error.message);
  process.exit(1);
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const ADMIN_EMAIL = 'tawalitest2@gmail.com';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - VITE_SUPABASE_PUBLISHABLE_KEY');
  console.error('\nPlease check your .env.local file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createAdmin() {
  console.log('🔍 Looking for user:', ADMIN_EMAIL);
  
  // First, we need to get the user ID from auth.users
  // Since we can't directly query auth.users with the anon key,
  // we'll use a service role key or create a function
  
  console.log('\n⚠️  Note: This script needs to be run with service role key for direct database access.');
  console.log('   Alternatively, you can run the SQL directly in Supabase Dashboard.\n');
  
  console.log('📋 SQL to run in Supabase SQL Editor:');
  console.log('─'.repeat(60));
  console.log(`
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
  id,
  'admin',
  now()
FROM auth.users
WHERE email = '${ADMIN_EMAIL}'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify:
SELECT 
  u.email,
  ur.role,
  ur.created_at
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role = 'admin';
  `);
  console.log('─'.repeat(60));
  
  console.log('\n🔗 Direct link to SQL Editor:');
  console.log(`   https://supabase.com/dashboard/project/${SUPABASE_URL.split('//')[1].split('.')[0]}/sql/new`);
  console.log('\n✨ Copy the SQL above, paste it, and click Run!');
}

createAdmin().catch(console.error);

