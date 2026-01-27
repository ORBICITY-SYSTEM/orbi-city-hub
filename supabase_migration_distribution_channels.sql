-- =====================================================
-- Distribution Channels Table for ORBICITY
-- All 15 active channels + 4 coming soon
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create distribution_channels table
CREATE TABLE IF NOT EXISTS distribution_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Channel info
    channel_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_ka TEXT,
    category TEXT NOT NULL CHECK (category IN ('ota', 'social', 'website', 'pms')),
    logo_code TEXT, -- Short code for logo (B, A, AG, etc.)
    brand_color TEXT, -- Hex color for UI

    -- URLs
    listing_url TEXT, -- Our listing on this platform
    extranet_url TEXT, -- Admin/extranet URL

    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'coming_soon', 'paused', 'disconnected')),
    api_status TEXT DEFAULT 'unknown' CHECK (api_status IN ('healthy', 'degraded', 'down', 'unknown')),

    -- Sync info
    last_sync_at TIMESTAMPTZ,
    sync_interval_minutes INTEGER DEFAULT 10,

    -- Stats (updated by scrapers)
    bookings_today INTEGER DEFAULT 0,
    bookings_month INTEGER DEFAULT 0,
    revenue_today DECIMAL(10,2) DEFAULT 0,
    revenue_month DECIMAL(10,2) DEFAULT 0,

    -- Credentials reference (stored in CLAUDE.md, not here)
    has_credentials BOOLEAN DEFAULT false,
    credentials_note TEXT,

    -- Metadata
    display_order INTEGER DEFAULT 100,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_distribution_channels_category ON distribution_channels(category);
CREATE INDEX IF NOT EXISTS idx_distribution_channels_status ON distribution_channels(status);
CREATE INDEX IF NOT EXISTS idx_distribution_channels_order ON distribution_channels(display_order);

-- Enable RLS
ALTER TABLE distribution_channels ENABLE ROW LEVEL SECURITY;

-- Allow all operations
CREATE POLICY "Allow all for distribution_channels" ON distribution_channels
    FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_distribution_channels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_distribution_channels_updated_at ON distribution_channels;
CREATE TRIGGER trigger_distribution_channels_updated_at
    BEFORE UPDATE ON distribution_channels
    FOR EACH ROW
    EXECUTE FUNCTION update_distribution_channels_updated_at();

-- =====================================================
-- INSERT ALL 15 ACTIVE CHANNELS + 4 COMING SOON
-- =====================================================

INSERT INTO distribution_channels (channel_id, name, name_ka, category, logo_code, brand_color, listing_url, extranet_url, status, has_credentials, credentials_note, display_order) VALUES

-- OTA CHANNELS (Active)
('booking', 'Booking.com', 'ბუქინგი', 'ota', 'B', '#003580',
 'https://www.booking.com/hotel/ge/orbi-city-luxury-sea-view-apartm',
 'https://admin.booking.com', 'active', true, 'Property ID: 10172179', 1),

('airbnb', 'Airbnb', 'ეარბიენბი', 'ota', 'A', '#FF5A5F',
 'https://www.airbnb.com/rooms/1455314718960040955',
 'https://www.airbnb.com/hosting', 'active', true, 'Check CLAUDE.md', 2),

('agoda', 'Agoda', 'აგოდა', 'ota', 'AG', '#5392F9',
 'https://www.agoda.com/batumi-orbi-sitiy-twin-tower-sea-wiev/hotel',
 'https://ycs.agoda.com', 'active', true, 'Property ID: 75604844', 3),

('expedia', 'Expedia', 'ექსპედია', 'ota', 'E', '#FFCC00',
 'https://www.expedia.com/Batumi-Hotels-ORBI-CITY-Luxury-Sea-View-A',
 'https://www.expediapartnercentral.com', 'active', true, 'Username: TamunaMakharadze', 4),

('tripadvisor', 'TripAdvisor', 'ტრიპადვაიზორი', 'ota', 'TA', '#34E0A1',
 'https://www.tripadvisor.com/Hotel_Review-g297576-d27797353-Review',
 'https://www.tripadvisor.com/Owners', 'active', true, 'Check CLAUDE.md', 5),

('ostrovok', 'Ostrovok', 'ოსტროვოკი', 'ota', 'OS', '#FF6B00',
 'https://ostrovok.ru/hotel/georgia/batumi/mid13345479/hotel_orbi_c',
 'https://extranet.emergingtravel.com/v3/hotels/393043548/hotel/info', 'active', true, 'Property ID: 393043548', 6),

('sutochno', 'Sutochno.com', 'სუტოჩნო', 'ota', 'S', '#FF4444',
 'https://sutochno.com/front/searchapp/search',
 'https://extranet.sutochno.ru/cabinet/objects', 'active', true, 'Password: 66327', 7),

('bronevik', 'Bronevik.com', 'ბრონევიკი', 'ota', 'BR', '#2E7D32',
 'https://bronevik.com/en/hotel/start?hotel_id=757157',
 'https://bronevik.com/en/info/hotels', 'active', true, 'Check CLAUDE.md', 8),

('tvil', 'Tvil.ru', 'ტვილი', 'ota', 'TV', '#6A1B9A',
 'https://tvil.ru/city/batumi/hotels/2062593',
 'https://tvil.ru', 'active', true, 'Check CLAUDE.md', 9),

('hostelworld', 'Hostelworld', 'ჰოსტელვორლდი', 'ota', 'HW', '#F15B2A',
 'https://www.hostelworld.com/pwa/hosteldetails.php/Orbi-City-Sea-v',
 'https://inbox.hostelworld.com', 'active', true, 'Username: manager_tamar', 10),

-- PMS
('otelms', 'OtelMS', 'ოტელმს', 'pms', 'O', '#00BCD4',
 NULL,
 'https://116758.otelms.com/reservation_c2/calendar', 'active', true, 'Property ID: 116758', 11),

-- SOCIAL MEDIA
('facebook', 'Facebook', 'ფეისბუქი', 'social', 'FB', '#1877F2',
 'https://www.facebook.com/share/1D9xvSc6Dh/?mibextid=wwXIfr',
 'https://business.facebook.com', 'active', true, 'Page ID: 106554850701828', 20),

('instagram', 'Instagram', 'ინსტაგრამი', 'social', 'IG', '#E4405F',
 'https://www.instagram.com/orbi_city_sea_view_apartment',
 'https://www.instagram.com', 'active', true, 'Profile: orbicity', 21),

('tiktok', 'TikTok', 'ტიკტოკი', 'social', 'TT', '#000000',
 'https://www.tiktok.com/@orbi.apartments.batumi',
 'https://www.tiktok.com', 'active', false, NULL, 22),

('youtube', 'YouTube', 'იუთუბი', 'social', 'YT', '#FF0000',
 'https://www.youtube.com/@ORBIAPARTMENTS',
 'https://studio.youtube.com', 'active', true, 'Check CLAUDE.md', 23),

-- WEBSITE
('website', 'orbicitybatumi.com', 'ვებსაიტი', 'website', 'W', '#10B981',
 'https://www.orbicitybatumi.com',
 NULL, 'active', true, 'GA4 Property IDs: 502525731, 518261169', 30),

-- COMING SOON
('yandex', 'Yandex Travel', 'იანდექს თრეველი', 'ota', 'Y', '#FC3F1D',
 NULL, NULL, 'coming_soon', false, 'In Progress', 40),

('hrs', 'HRS', 'აშარეს', 'ota', 'HRS', '#C4161C',
 NULL, NULL, 'coming_soon', false, 'In Progress', 41),

('trip', 'Trip.com', 'ტრიპ.კომ', 'ota', 'TR', '#2577E3',
 NULL, NULL, 'coming_soon', true, 'Check CLAUDE.md', 42),

('cbooking', 'Cbooking.ru', 'სიბუქინგი', 'ota', 'CB', '#00897B',
 NULL, NULL, 'coming_soon', false, 'In Progress', 43)

ON CONFLICT (channel_id) DO UPDATE SET
    name = EXCLUDED.name,
    listing_url = EXCLUDED.listing_url,
    extranet_url = EXCLUDED.extranet_url,
    status = EXCLUDED.status,
    updated_at = NOW();

SELECT 'Distribution channels table created with ' || COUNT(*) || ' channels!' as status FROM distribution_channels;
