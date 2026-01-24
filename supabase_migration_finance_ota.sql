-- ============================================================================
-- ORBICITY - SUPABASE MIGRATION
-- Finance Module + OTA Channels Tables
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================================

-- =========================
-- FINANCE MODULE TABLES
-- =========================

-- Revenue Table (from OtelMS)
CREATE TABLE IF NOT EXISTS otelms_revenue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year TEXT NOT NULL,
    month TEXT NOT NULL,
    category TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    extracted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(year, month, category)
);

-- Booking Sources Table
CREATE TABLE IF NOT EXISTS otelms_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    source TEXT NOT NULL,
    revenue DECIMAL(12,2),
    bookings INTEGER,
    extracted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(start_date, end_date, source)
);

-- Occupancy Table
CREATE TABLE IF NOT EXISTS otelms_occupancy (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year TEXT NOT NULL,
    month INTEGER NOT NULL,
    month_name TEXT,
    day INTEGER NOT NULL,
    occupancy_pct DECIMAL(5,2),
    extracted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(year, month, day)
);

-- ADR (Average Daily Rate) Table
CREATE TABLE IF NOT EXISTS otelms_adr (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year TEXT NOT NULL,
    month INTEGER NOT NULL,
    month_name TEXT,
    day INTEGER NOT NULL,
    adr DECIMAL(10,2),
    yoy_change_pct DECIMAL(6,2),
    extracted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(year, month, day)
);

-- RevPAR Table
CREATE TABLE IF NOT EXISTS otelms_revpar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year TEXT NOT NULL,
    month INTEGER NOT NULL,
    month_name TEXT,
    day INTEGER NOT NULL,
    revpar DECIMAL(10,2),
    yoy_change_pct DECIMAL(6,2),
    extracted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(year, month, day)
);

-- Finance Change History
CREATE TABLE IF NOT EXISTS otelms_change_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_key TEXT NOT NULL,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_type TEXT NOT NULL, -- 'added', 'modified', 'deleted'
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- OTA CHANNELS TABLES
-- =========================

-- OTA Reviews (from Booking.com, Expedia, Agoda, etc.)
CREATE TABLE IF NOT EXISTS ota_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform TEXT NOT NULL, -- booking, expedia, agoda, tripadvisor, etc.
    review_id TEXT, -- platform-specific ID
    guest_name TEXT,
    guest_country TEXT,
    rating DECIMAL(3,1),
    title TEXT,
    positive_text TEXT,
    negative_text TEXT,
    review_date DATE,
    stay_date DATE,
    room_type TEXT,
    traveler_type TEXT, -- solo, couple, family, business
    language TEXT,
    response_text TEXT,
    response_date DATE,
    raw_data JSONB,
    extracted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(platform, review_id)
);

-- OTA Reservations
CREATE TABLE IF NOT EXISTS ota_reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform TEXT NOT NULL,
    reservation_id TEXT NOT NULL,
    guest_name TEXT,
    guest_email TEXT,
    guest_phone TEXT,
    check_in DATE,
    check_out DATE,
    room_type TEXT,
    room_count INTEGER DEFAULT 1,
    guest_count INTEGER,
    total_amount DECIMAL(12,2),
    currency TEXT DEFAULT 'GEL',
    commission_amount DECIMAL(12,2),
    status TEXT, -- confirmed, cancelled, completed, no_show
    payment_status TEXT,
    special_requests TEXT,
    raw_data JSONB,
    extracted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(platform, reservation_id)
);

-- OTA Performance Metrics
CREATE TABLE IF NOT EXISTS ota_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform TEXT NOT NULL,
    metric_date DATE NOT NULL,
    views INTEGER,
    clicks INTEGER,
    bookings INTEGER,
    revenue DECIMAL(12,2),
    avg_rate DECIMAL(10,2),
    occupancy_pct DECIMAL(5,2),
    conversion_rate DECIMAL(5,2),
    ranking INTEGER,
    review_score DECIMAL(3,1),
    raw_data JSONB,
    extracted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(platform, metric_date)
);

-- =========================
-- INDEXES FOR PERFORMANCE
-- =========================

CREATE INDEX IF NOT EXISTS idx_otelms_revenue_year_month ON otelms_revenue(year, month);
CREATE INDEX IF NOT EXISTS idx_otelms_occupancy_year ON otelms_occupancy(year);
CREATE INDEX IF NOT EXISTS idx_otelms_adr_year ON otelms_adr(year);
CREATE INDEX IF NOT EXISTS idx_otelms_revpar_year ON otelms_revpar(year);
CREATE INDEX IF NOT EXISTS idx_otelms_change_history_table ON otelms_change_history(table_name);
CREATE INDEX IF NOT EXISTS idx_ota_reviews_platform ON ota_reviews(platform);
CREATE INDEX IF NOT EXISTS idx_ota_reviews_date ON ota_reviews(review_date);
CREATE INDEX IF NOT EXISTS idx_ota_reservations_platform ON ota_reservations(platform);
CREATE INDEX IF NOT EXISTS idx_ota_reservations_checkin ON ota_reservations(check_in);
CREATE INDEX IF NOT EXISTS idx_ota_performance_platform_date ON ota_performance(platform, metric_date);

-- =========================
-- ROW LEVEL SECURITY (RLS)
-- =========================

-- Enable RLS
ALTER TABLE otelms_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE otelms_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE otelms_occupancy ENABLE ROW LEVEL SECURITY;
ALTER TABLE otelms_adr ENABLE ROW LEVEL SECURITY;
ALTER TABLE otelms_revpar ENABLE ROW LEVEL SECURITY;
ALTER TABLE otelms_change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ota_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ota_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ota_performance ENABLE ROW LEVEL SECURITY;

-- Allow public read for all (you can make this more restrictive)
CREATE POLICY "Allow public read" ON otelms_revenue FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON otelms_sources FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON otelms_occupancy FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON otelms_adr FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON otelms_revpar FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON otelms_change_history FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON ota_reviews FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON ota_reservations FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON ota_performance FOR SELECT USING (true);

-- Allow service role to insert/update/delete
CREATE POLICY "Allow service insert" ON otelms_revenue FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service insert" ON otelms_sources FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service insert" ON otelms_occupancy FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service insert" ON otelms_adr FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service insert" ON otelms_revpar FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service insert" ON otelms_change_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service insert" ON ota_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service insert" ON ota_reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service insert" ON ota_performance FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service update" ON otelms_revenue FOR UPDATE USING (true);
CREATE POLICY "Allow service update" ON otelms_sources FOR UPDATE USING (true);
CREATE POLICY "Allow service update" ON otelms_occupancy FOR UPDATE USING (true);
CREATE POLICY "Allow service update" ON otelms_adr FOR UPDATE USING (true);
CREATE POLICY "Allow service update" ON otelms_revpar FOR UPDATE USING (true);
CREATE POLICY "Allow service update" ON ota_reviews FOR UPDATE USING (true);
CREATE POLICY "Allow service update" ON ota_reservations FOR UPDATE USING (true);
CREATE POLICY "Allow service update" ON ota_performance FOR UPDATE USING (true);

-- =========================
-- SOCIAL MEDIA TABLE
-- =========================

-- Social Media Metrics
CREATE TABLE IF NOT EXISTS social_media_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform TEXT NOT NULL, -- instagram, facebook, youtube, tiktok
    profile_name TEXT,
    followers TEXT,
    following TEXT,
    posts_count TEXT,
    likes TEXT,
    subscribers TEXT,
    video_count TEXT,
    raw_data JSONB,
    extracted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(platform)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_social_media_platform ON social_media_metrics(platform);

-- RLS
ALTER TABLE social_media_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON social_media_metrics FOR SELECT USING (true);
CREATE POLICY "Allow service insert" ON social_media_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service update" ON social_media_metrics FOR UPDATE USING (true);

-- =========================
-- DONE!
-- =========================
-- Tables created:
-- - otelms_revenue
-- - otelms_sources
-- - otelms_occupancy
-- - otelms_adr
-- - otelms_revpar
-- - otelms_change_history
-- - ota_reviews
-- - ota_reservations
-- - ota_performance
-- - social_media_metrics
