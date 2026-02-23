-- Add preferences JSONB to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{
  "publicProfile": true,
  "twoFactor": false,
  "marketingEmails": false,
  "productUpdates": true,
  "securityAlerts": true,
  "slack": false,
  "notion": false,
  "drive": false
}'::jsonb;

-- Create API Keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    key_hint TEXT NOT NULL, -- e.g. "sk_live_...8f92"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Turn on RLS for api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- API Keys Policies
CREATE POLICY "Users can view their own API keys"
    ON public.api_keys FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys"
    ON public.api_keys FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys"
    ON public.api_keys FOR DELETE
    USING (auth.uid() = user_id);
