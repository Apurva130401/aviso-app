-- Add usage limits to coupons
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_uses_per_user INTEGER DEFAULT 1;

-- Create coupon usage tracker table
CREATE TABLE IF NOT EXISTS coupon_uses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    coupon_code TEXT NOT NULL REFERENCES coupons(code) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_coupon_uses_user_id ON coupon_uses(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_uses_coupon_code ON coupon_uses(coupon_code);

-- RLS setup
ALTER TABLE coupon_uses ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Allow service role full access to coupon_uses" ON coupon_uses
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Users can read their own usage logs (optional but good practice)
CREATE POLICY "Users can view own coupon uses" ON coupon_uses
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
