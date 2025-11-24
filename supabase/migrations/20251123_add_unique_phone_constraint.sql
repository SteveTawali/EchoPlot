-- Add unique constraint to phone column in profiles table
-- This prevents duplicate phone numbers at the database level

-- First, update any existing duplicate phone numbers to NULL (except the first occurrence)
WITH duplicates AS (
  SELECT id, phone,
    ROW_NUMBER() OVER (PARTITION BY phone ORDER BY created_at) as rn
  FROM profiles
  WHERE phone IS NOT NULL
)
UPDATE profiles
SET phone = NULL
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Now add the unique constraint
ALTER TABLE profiles
ADD CONSTRAINT profiles_phone_unique UNIQUE (phone);

-- Add a comment explaining the constraint
COMMENT ON CONSTRAINT profiles_phone_unique ON profiles IS 
'Ensures each phone number can only be used by one user account';
