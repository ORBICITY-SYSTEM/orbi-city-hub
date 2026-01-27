-- =====================================================
-- GA4 Analytics Table for ORBICITY
-- Run this in Supabase SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS ga4_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ga4_analytics_property ON ga4_analytics(property_id);
CREATE INDEX IF NOT EXISTS idx_ga4_analytics_created ON ga4_analytics(created_at DESC);

-- Enable RLS
ALTER TABLE ga4_analytics ENABLE ROW LEVEL SECURITY;

-- Allow all operations
CREATE POLICY "Allow all for ga4_analytics" ON ga4_analytics
    FOR ALL USING (true) WITH CHECK (true);

SELECT 'GA4 Analytics table created!' as status;
