-- Create storage bucket for planting verification photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'planting-verifications',
  'planting-verifications',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

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