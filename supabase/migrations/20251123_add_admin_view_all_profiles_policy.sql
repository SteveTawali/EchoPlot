-- Add RLS policy to allow admins and moderators to view all profiles
-- This is simpler than using a database function

-- Create policy for admins/moderators to view all profiles
CREATE POLICY "Admins and moderators can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'moderator')
  )
);

-- Add comment
COMMENT ON POLICY "Admins and moderators can view all profiles" ON profiles IS 
'Allows users with admin or moderator role to view all user profiles';
