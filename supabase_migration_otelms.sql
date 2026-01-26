-- =============================================================================
-- OTELMS DATA TABLES FOR SUPABASE
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/lusagtvxjtfxgfadulgv/sql/new
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- OTELMS REVENUE TABLE
-- Monthly revenue breakdown by category
-- =============================================================================
CREATE TABLE IF NOT EXISTS otelms_revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period VARCHAR(50) NOT NULL, -- e.g., "January 2025"
    category VARCHAR(100) NOT NULL, -- e.g., "Suite with Sea view"
    room_nights INTEGER DEFAULT 0,
    revenue DECIMAL(12, 2) DEFAULT 0,
    adr DECIMAL(10, 2) DEFAULT 0, -- Average Daily Rate
    currency VARCHAR(10) DEFAULT 'GEL',
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(period, category)
);

-- =============================================================================
-- OTELMS SOURCES TABLE
-- Revenue breakdown by booking source (Booking.com, Airbnb, Direct, etc.)
-- =============================================================================
CREATE TABLE IF NOT EXISTS otelms_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period VARCHAR(50) NOT NULL,
    source VARCHAR(100) NOT NULL, -- e.g., "Booking.com", "Airbnb", "Direct"
    bookings INTEGER DEFAULT 0,
    room_nights INTEGER DEFAULT 0,
    revenue DECIMAL(12, 2) DEFAULT 0,
    percentage DECIMAL(5, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'GEL',
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(period, source)
);

-- =============================================================================
-- OTELMS OCCUPANCY TABLE
-- Daily occupancy percentages
-- =============================================================================
CREATE TABLE IF NOT EXISTS otelms_occupancy (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    occupancy_rate DECIMAL(5, 2) DEFAULT 0, -- percentage
    rooms_occupied INTEGER DEFAULT 0,
    rooms_total INTEGER DEFAULT 60,
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);

-- =============================================================================
-- OTELMS ADR TABLE
-- Average Daily Rate comparison over time
-- =============================================================================
CREATE TABLE IF NOT EXISTS otelms_adr (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period VARCHAR(50) NOT NULL,
    adr DECIMAL(10, 2) DEFAULT 0,
    previous_adr DECIMAL(10, 2) DEFAULT 0,
    change_percentage DECIMAL(5, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'GEL',
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(period)
);

-- =============================================================================
-- OTELMS REVPAR TABLE
-- Revenue Per Available Room comparison
-- =============================================================================
CREATE TABLE IF NOT EXISTS otelms_revpar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period VARCHAR(50) NOT NULL,
    revpar DECIMAL(10, 2) DEFAULT 0,
    previous_revpar DECIMAL(10, 2) DEFAULT 0,
    change_percentage DECIMAL(5, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'GEL',
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(period)
);

-- =============================================================================
-- OTELMS CHANGE HISTORY TABLE
-- Tracks changes in data for audit/monitoring
-- =============================================================================
CREATE TABLE IF NOT EXISTS otelms_change_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    change_type VARCHAR(20) NOT NULL, -- 'insert', 'update', 'delete'
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    changed_fields TEXT[],
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- OTA RESERVATIONS TABLE (enhanced)
-- Store all bookings from OtelMS calendar
-- =============================================================================
CREATE TABLE IF NOT EXISTS ota_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id VARCHAR(100) UNIQUE,
    platform VARCHAR(50) NOT NULL, -- "Booking.com", "Airbnb", "Direct", etc.
    guest_name VARCHAR(200),
    guest_email VARCHAR(200),
    guest_phone VARCHAR(50),
    room_type VARCHAR(100),
    room_number VARCHAR(20),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    nights INTEGER DEFAULT 1,
    guests_count INTEGER DEFAULT 1,
    total_amount DECIMAL(12, 2) DEFAULT 0,
    commission_amount DECIMAL(12, 2) DEFAULT 0,
    net_amount DECIMAL(12, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'GEL',
    status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, cancelled, checked_in, checked_out
    payment_status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    raw_data JSONB,
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- SOCIAL MEDIA METRICS TABLE
-- Store Instagram, Facebook, TikTok, etc. metrics
-- =============================================================================
CREATE TABLE IF NOT EXISTS social_media_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL, -- 'instagram', 'facebook', 'tiktok', 'google_analytics'
    followers VARCHAR(50),
    following VARCHAR(50),
    likes VARCHAR(50),
    posts_count VARCHAR(50),
    engagement_rate DECIMAL(5, 2),
    raw_data JSONB,
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(platform)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_otelms_revenue_period ON otelms_revenue(period);
CREATE INDEX IF NOT EXISTS idx_otelms_sources_period ON otelms_sources(period);
CREATE INDEX IF NOT EXISTS idx_otelms_occupancy_date ON otelms_occupancy(date);
CREATE INDEX IF NOT EXISTS idx_ota_reservations_checkin ON ota_reservations(check_in);
CREATE INDEX IF NOT EXISTS idx_ota_reservations_platform ON ota_reservations(platform);
CREATE INDEX IF NOT EXISTS idx_ota_reservations_status ON ota_reservations(status);
CREATE INDEX IF NOT EXISTS idx_social_media_platform ON social_media_metrics(platform);

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY (optional, for production)
-- =============================================================================
-- ALTER TABLE otelms_revenue ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE otelms_sources ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE otelms_occupancy ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ota_reservations ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================
GRANT ALL ON otelms_revenue TO authenticated;
GRANT ALL ON otelms_sources TO authenticated;
GRANT ALL ON otelms_occupancy TO authenticated;
GRANT ALL ON otelms_adr TO authenticated;
GRANT ALL ON otelms_revpar TO authenticated;
GRANT ALL ON otelms_change_history TO authenticated;
GRANT ALL ON ota_reservations TO authenticated;
GRANT ALL ON social_media_metrics TO authenticated;

GRANT ALL ON otelms_revenue TO anon;
GRANT ALL ON otelms_sources TO anon;
GRANT ALL ON otelms_occupancy TO anon;
GRANT ALL ON otelms_adr TO anon;
GRANT ALL ON otelms_revpar TO anon;
GRANT ALL ON otelms_change_history TO anon;
GRANT ALL ON ota_reservations TO anon;
GRANT ALL ON social_media_metrics TO anon;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ OTELMS tables created successfully!';
    RAISE NOTICE 'Tables: otelms_revenue, otelms_sources, otelms_occupancy, otelms_adr, otelms_revpar, otelms_change_history, ota_reservations, social_media_metrics';
END $$;
