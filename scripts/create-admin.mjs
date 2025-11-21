#!/usr/bin/env node

/**
 * Create Admin User Script
 * Run: node scripts/create-admin.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
const envPath = join(__dirname, '..', '.env.local');
let SUPABASE_URL, SUPABASE_KEY;

try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      SUPABASE_URL = line.split('=')[1].trim();
    }
    if (line.startsWith('VITE_SUPABASE_PUBLISHABLE_KEY=')) {
      SUPABASE_KEY = line.split('=')[1].trim();
    }
  });
} catch (error) {
  console.error('❌ Error reading .env.local:', error.message);
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables in .env.local');
  process.exit(1);
}

const ADMIN_EMAIL = 'tawalitest2@gmail.com';

console.log('\n📋 SQL to create admin user:');
console.log('═'.repeat(70));
console.log(`
-- Copy and paste this into Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pftgmulitbjrlzdiwmxo/sql/new

INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
  id,
  'admin',
  now()
FROM auth.users
WHERE email = '${ADMIN_EMAIL}'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify it worked:
SELECT 
  u.email,
  ur.role,
  ur.created_at
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role = 'admin';
`);
console.log('═'.repeat(70));
console.log('\n🔗 Open SQL Editor:');
console.log('   https://supabase.com/dashboard/project/pftgmulitbjrlzdiwmxo/sql/new\n');
console.log('✨ Steps:');
console.log('   1. Click the link above');
console.log('   2. Copy the SQL from above');
console.log('   3. Paste and click "Run"');
console.log('   4. Check the results - you should see your email with role "admin"\n');

