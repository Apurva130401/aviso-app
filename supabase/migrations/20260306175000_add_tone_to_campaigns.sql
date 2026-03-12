-- Add tone column to campaigns table
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS tone TEXT;
