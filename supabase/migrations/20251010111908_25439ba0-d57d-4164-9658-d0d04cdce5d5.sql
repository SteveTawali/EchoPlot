-- Create a function to get leaderboard data
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  verified_count bigint,
  total_matches bigint,
  carbon_sequestered numeric,
  rank bigint
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.full_name,
    COUNT(DISTINCT pv.id) FILTER (WHERE pv.status = 'verified') as verified_count,
    COUNT(DISTINCT tm.id) as total_matches,
    COUNT(DISTINCT pv.id) FILTER (WHERE pv.status = 'verified') * 22 as carbon_sequestered,
    DENSE_RANK() OVER (ORDER BY COUNT(DISTINCT pv.id) FILTER (WHERE pv.status = 'verified') DESC) as rank
  FROM profiles p
  LEFT JOIN planting_verifications pv ON p.user_id = pv.user_id
  LEFT JOIN tree_matches tm ON p.user_id = tm.user_id
  WHERE p.onboarding_completed = true
  GROUP BY p.user_id, p.full_name
  HAVING COUNT(DISTINCT pv.id) FILTER (WHERE pv.status = 'verified') > 0
  ORDER BY verified_count DESC, total_matches DESC
  LIMIT 100;
$$;

-- Create a function to get community statistics
CREATE OR REPLACE FUNCTION public.get_community_stats()
RETURNS TABLE (
  total_users bigint,
  total_verified_plantings bigint,
  total_carbon_sequestered numeric,
  total_matches bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COUNT(DISTINCT p.user_id) as total_users,
    COUNT(DISTINCT pv.id) FILTER (WHERE pv.status = 'verified') as total_verified_plantings,
    COUNT(DISTINCT pv.id) FILTER (WHERE pv.status = 'verified') * 22 as total_carbon_sequestered,
    COUNT(DISTINCT tm.id) as total_matches
  FROM profiles p
  LEFT JOIN planting_verifications pv ON p.user_id = pv.user_id
  LEFT JOIN tree_matches tm ON p.user_id = tm.user_id
  WHERE p.onboarding_completed = true;
$$;