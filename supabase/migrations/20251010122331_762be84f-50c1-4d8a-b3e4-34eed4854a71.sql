-- Phase 1: Admin Roles & Kenya-Specific Data Structure (Fixed)

-- 1. Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table with proper security
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  county TEXT, -- County they moderate (for moderators)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Add Kenya-specific fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS county TEXT,
  ADD COLUMN IF NOT EXISTS constituency TEXT,
  ADD COLUMN IF NOT EXISTS agro_zone TEXT,
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'sw')),
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- 6. Add Kenya-specific fields to planting_verifications (skip rejection_reason as it exists)
ALTER TABLE public.planting_verifications
  ADD COLUMN IF NOT EXISTS county TEXT,
  ADD COLUMN IF NOT EXISTS constituency TEXT,
  ADD COLUMN IF NOT EXISTS mpesa_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS reward_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reward_paid BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reward_paid_at TIMESTAMP WITH TIME ZONE;

-- 7. Create verification queue view for admins
CREATE OR REPLACE VIEW public.verification_queue AS
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
ORDER BY pv.created_at DESC;

-- 8. RLS policies for verification queue (admins and moderators can view)
CREATE POLICY "Admins can view all verifications"
  ON public.planting_verifications
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'moderator')
  );

CREATE POLICY "Admins and moderators can update verifications"
  ON public.planting_verifications
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'moderator')
  );

-- 9. Create admin stats function
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE(
  total_pending BIGINT,
  total_approved BIGINT,
  total_rejected BIGINT,
  pending_by_county JSONB,
  approval_rate NUMERIC
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COUNT(*) FILTER (WHERE status = 'pending') as total_pending,
    COUNT(*) FILTER (WHERE status = 'verified') as total_approved,
    COUNT(*) FILTER (WHERE status = 'rejected') as total_rejected,
    jsonb_object_agg(
      county, 
      count
    ) FILTER (WHERE county IS NOT NULL AND status = 'pending') as pending_by_county,
    CASE 
      WHEN COUNT(*) FILTER (WHERE status IN ('verified', 'rejected')) > 0 
      THEN ROUND(
        COUNT(*) FILTER (WHERE status = 'verified')::NUMERIC / 
        COUNT(*) FILTER (WHERE status IN ('verified', 'rejected'))::NUMERIC * 100,
        2
      )
      ELSE 0
    END as approval_rate
  FROM (
    SELECT 
      status,
      county,
      COUNT(*) as count
    FROM public.planting_verifications
    GROUP BY status, county
  ) subquery;
$$;