-- =====================================================
-- Google Reviews Table for ORBICITY
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create google_reviews table
CREATE TABLE IF NOT EXISTS google_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id TEXT UNIQUE NOT NULL,
    platform TEXT DEFAULT 'google',

    -- Author info
    author_name TEXT NOT NULL,
    author_url TEXT,
    profile_photo_url TEXT,

    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_time TIMESTAMPTZ,
    relative_time TEXT,
    language TEXT,

    -- AI Response
    ai_response TEXT,
    ai_response_generated_at TIMESTAMPTZ,

    -- Approval workflow
    response_status TEXT DEFAULT 'pending' CHECK (response_status IN ('pending', 'approved', 'rejected', 'posted')),
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    posted_at TIMESTAMPTZ,

    -- Manual response (if edited)
    final_response TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_google_reviews_status ON google_reviews(response_status);
CREATE INDEX IF NOT EXISTS idx_google_reviews_rating ON google_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_google_reviews_time ON google_reviews(review_time DESC);

-- Enable RLS
ALTER TABLE google_reviews ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust as needed)
CREATE POLICY "Allow all for google_reviews" ON google_reviews
    FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_google_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_google_reviews_updated_at ON google_reviews;
CREATE TRIGGER trigger_google_reviews_updated_at
    BEFORE UPDATE ON google_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_google_reviews_updated_at();

-- =====================================================
-- Sample data (optional - for testing)
-- =====================================================
-- INSERT INTO google_reviews (review_id, author_name, rating, review_text, review_time, relative_time)
-- VALUES
--     ('google_test_1', 'Test User', 5, 'Amazing place!', NOW(), 'a week ago'),
--     ('google_test_2', 'Another User', 4, 'Very nice hotel', NOW() - INTERVAL '2 days', '2 days ago');

SELECT 'Google Reviews table created successfully!' as status;
