-- Create the coupons table
CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value INTEGER NOT NULL,
    description TEXT,
    valid_for TEXT[], -- Array of package IDs (null means valid for all)
    show_on_dashboard BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active coupons
CREATE POLICY "Allow public read access to active coupons" ON coupons
    FOR SELECT
    TO public
    USING (is_active = true);

-- Allow authenticated users to insert/update coupons (if you have an admin role later, you can restrict this)
-- For now, we'll restrict inserts/updates to service role only for security, 
-- meaning you will manage them via the Supabase dashboard directly.
CREATE POLICY "Allow service role full access to coupons" ON coupons
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Insert initial coupons
INSERT INTO coupons (code, discount_type, discount_value, description, show_on_dashboard)
VALUES 
    ('WELCOME20', 'percentage', 20, '20% off your first top-up', true),
    ('PRO50', 'fixed', 1000, '$10 off the Pro Bulk package', false);

-- Set valid_for specifically for the PRO50 coupon
UPDATE coupons SET valid_for = ARRAY['pro'] WHERE code = 'PRO50';
