-- Migration 006: Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type public.category_type NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System-level default categories (workspace_id IS NULL)
-- These are seeded via seed.sql and copied per workspace in handle_new_user

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
