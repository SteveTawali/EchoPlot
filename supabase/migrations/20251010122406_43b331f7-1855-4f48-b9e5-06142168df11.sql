-- Fix security definer view issue - Replace with function

-- Drop the view
DROP VIEW IF EXISTS public.verification_queue;

-- Create a function instead
CREATE OR REPLACE FUNCTION public.get_verification_queue()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  full_name TEXT,
  user_phone TEXT,
  submission_phone TEXT,
  tree_name TEXT,
  county TEXT,
  constituency TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  image_url TEXT,
  notes TEXT,
  planting_date DATE,
  status verification_status,
  created_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  rejection_reason TEXT,
  mpesa_transaction_id TEXT,
  reward_amount NUMERIC,
  reward_paid BOOLEAN,
  verifier_name TEXT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pv.id,
    pv.user_id,
    p.full_name,
    p.phone AS user_phone,
    pv.phone AS submission_phone,
    pv.tree_name,
    pv.county,
    pv.constituency,
    pv.latitude,
    pv.longitude,
    pv.image_url,
    pv.notes,
    pv.planting_date,
    pv.status,
    pv.created_at,
    pv.verified_at,
    pv.verified_by,
    pv.rejection_reason,
    pv.mpesa_transaction_id,
    pv.reward_amount,
    pv.reward_paid,
    verifier.full_name as verifier_name
  FROM public.planting_verifications pv
  LEFT JOIN public.profiles p ON pv.user_id = p.user_id
  LEFT JOIN public.profiles verifier ON pv.verified_by = verifier.user_id
  WHERE 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'moderator')
  ORDER BY pv.created_at DESC;
$$;