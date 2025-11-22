-- ============================================
-- LeafSwipe Complete Database Setup
-- Run this file in Supabase SQL Editor
-- ============================================
-- Note: SonarLint warnings about duplicated literals are expected
-- for SQL migration files and can be safely ignored.

-- Migration 1: Create enum types and profiles table
-- Create enum types for structured data
CREATE TYPE public.soil_type AS ENUM (
  'clay',
  'sandy',
  'loamy',
  'silty',
  'peaty',
  'chalky'
);

CREATE TYPE public.climate_zone AS ENUM (
  'tropical',
  'subtropical',
  'temperate',
  'cold',
  'arid',
  'mediterranean'
);

CREATE TYPE public.conservation_goal AS ENUM (
  'carbon_sequestration',
  'biodiversity',
  'erosion_control',
  'water_management',
  'wildlife_habitat',
  'food_production',
  'aesthetic_beauty'
);

-- Create profiles table with onboarding data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  soil_type soil_type,
  climate_zone climate_zone,
  land_size_hectares NUMERIC(10, 2),
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  conservation_goals conservation_goal[],
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only read/write their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Migration 2: Create tree_matches table
CREATE TABLE public.tree_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tree_id INTEGER NOT NULL,
  tree_name TEXT NOT NULL,
  compatibility_score INTEGER NOT NULL,
  matched_at TIMESTAMPTZ DEFAULT now(),
  favorited BOOLEAN DEFAULT false,
  notes TEXT,
  UNIQUE(user_id, tree_id)
);

-- Enable RLS
ALTER TABLE public.tree_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own matches"
  ON public.tree_matches
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own matches"
  ON public.tree_matches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches"
  ON public.tree_matches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own matches"
  ON public.tree_matches
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_tree_matches_user_id ON public.tree_matches(user_id);
CREATE INDEX idx_tree_matches_favorited ON public.tree_matches(user_id, favorited) WHERE favorited = true;

-- Migration 3: Create storage bucket and verifications table
-- Create storage bucket for planting verification photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'planting-verifications',
  'planting-verifications',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for planting verification bucket
CREATE POLICY "Users can view their own verification photos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'planting-verifications' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can upload their own verification photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'planting-verifications' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own verification photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'planting-verifications' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create verification status enum
CREATE TYPE public.verification_status AS ENUM (
  'pending',
  'verified',
  'rejected'
);

-- Create planting verifications table
CREATE TABLE public.planting_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tree_match_id UUID REFERENCES public.tree_matches(id) ON DELETE SET NULL,
  tree_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  planting_date DATE DEFAULT CURRENT_DATE,
  status verification_status DEFAULT 'pending',
  notes TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.planting_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own verifications"
  ON public.planting_verifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verifications"
  ON public.planting_verifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending verifications"
  ON public.planting_verifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Create indexes
CREATE INDEX idx_planting_verifications_user_id ON public.planting_verifications(user_id);
CREATE INDEX idx_planting_verifications_status ON public.planting_verifications(status);
CREATE INDEX idx_planting_verifications_tree_match ON public.planting_verifications(tree_match_id);

-- Trigger for updated_at
CREATE TRIGGER planting_verifications_updated_at
  BEFORE UPDATE ON public.planting_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Migration 4: Create community functions
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

-- Migration 5: Admin Roles & Kenya-Specific Data Structure
-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table with proper security
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

-- Security definer function to check roles (prevents RLS recursion)
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

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Add Kenya-specific fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS county TEXT,
  ADD COLUMN IF NOT EXISTS constituency TEXT,
  ADD COLUMN IF NOT EXISTS agro_zone TEXT,
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'sw')),
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add Kenya-specific fields to planting_verifications
ALTER TABLE public.planting_verifications
  ADD COLUMN IF NOT EXISTS county TEXT,
  ADD COLUMN IF NOT EXISTS constituency TEXT,
  ADD COLUMN IF NOT EXISTS mpesa_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS reward_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reward_paid BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reward_paid_at TIMESTAMP WITH TIME ZONE;

-- RLS policies for verification queue (admins and moderators can view)
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

-- Create admin stats function
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

-- Create verification queue function (replaces view)
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

-- ============================================
-- Setup Complete!
-- ============================================

