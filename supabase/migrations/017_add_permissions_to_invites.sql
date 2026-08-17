-- Add optional permissions overrides to invite records
-- Used to carry guest permission overrides from invite creation to accept-invite

ALTER TABLE workspace_invites
  ADD COLUMN IF NOT EXISTS permissions jsonb;
