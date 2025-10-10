-- Create tree_matches table to track user matches
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

-- Create index for faster queries
CREATE INDEX idx_tree_matches_user_id ON public.tree_matches(user_id);
CREATE INDEX idx_tree_matches_favorited ON public.tree_matches(user_id, favorited) WHERE favorited = true;