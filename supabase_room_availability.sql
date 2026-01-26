-- ============================================================================
-- ROOM AVAILABILITY TABLES FOR OTELMS CALENDAR
-- Run this SQL in Supabase Dashboard: https://supabase.com/dashboard/project/lusagtvxjtfxgfadulgv/sql/new
-- ============================================================================

-- 1. Room Types Table
-- Stores the different room categories (Suite, Deluxe, Superior, Family, etc.)
CREATE TABLE IF NOT EXISTS room_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type_id VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    name_ka VARCHAR(255),
    description TEXT,
    description_ka TEXT,
    total_rooms INTEGER NOT NULL DEFAULT 10,
    base_price DECIMAL(10, 2),
    max_occupancy INTEGER DEFAULT 2,
    amenities JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Room Availability Table
-- Stores daily availability per room type (populated by OtelMS Python scraper)
CREATE TABLE IF NOT EXISTS room_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_type_id VARCHAR(64) NOT NULL REFERENCES room_types(type_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    available INTEGER NOT NULL DEFAULT 0,
    booked INTEGER DEFAULT 0,
    blocked INTEGER DEFAULT 0,
    total INTEGER NOT NULL,
    min_stay INTEGER DEFAULT 1,
    rate DECIMAL(10, 2),
    rate_source VARCHAR(64),
    notes TEXT,
    scraped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(room_type_id, date)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_room_availability_date ON room_availability(date);
CREATE INDEX IF NOT EXISTS idx_room_availability_room_type ON room_availability(room_type_id);
CREATE INDEX IF NOT EXISTS idx_room_availability_date_range ON room_availability(room_type_id, date);

-- Enable Row Level Security
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_availability ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (read-only)
CREATE POLICY "Allow anonymous read access to room_types" ON room_types
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous read access to room_availability" ON room_availability
    FOR SELECT TO anon USING (true);

-- Create policies for authenticated users (full access)
CREATE POLICY "Allow authenticated full access to room_types" ON room_types
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to room_availability" ON room_availability
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- INSERT DEFAULT ROOM TYPES (matching OtelMS)
-- ============================================================================

INSERT INTO room_types (type_id, name, name_ka, total_rooms, sort_order) VALUES
    ('suite-sea', 'Suite with Sea view', 'სუიტა ზღვის ხედით', 15, 1),
    ('deluxe-sea', 'Delux suite with sea view', 'დელუქს სუიტა ზღვის ხედით', 28, 2),
    ('superior-sea', 'Superior Suite with Sea View', 'სუპერიორ სუიტა ზღვის ხედით', 5, 3),
    ('family', 'Interconnected Family Room', 'ოჯახის ინტერკონექტ ოთახი', 3, 4),
    ('overbooking', 'Overbooking', 'ზედმეტი ჯავშანი', 3, 5)
ON CONFLICT (type_id) DO UPDATE SET
    name = EXCLUDED.name,
    name_ka = EXCLUDED.name_ka,
    total_rooms = EXCLUDED.total_rooms,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- ============================================================================
-- INSERT SAMPLE AVAILABILITY DATA (for demonstration)
-- This will be replaced by OtelMS scraper data
-- ============================================================================

-- Generate availability for next 30 days
DO $$
DECLARE
    room_type RECORD;
    current_date DATE := CURRENT_DATE;
    end_date DATE := CURRENT_DATE + INTERVAL '30 days';
    avail INTEGER;
    day_of_week INTEGER;
    is_weekend BOOLEAN;
BEGIN
    FOR room_type IN SELECT type_id, total_rooms FROM room_types LOOP
        FOR i IN 0..30 LOOP
            current_date := CURRENT_DATE + (i || ' days')::INTERVAL;
            day_of_week := EXTRACT(DOW FROM current_date);
            is_weekend := day_of_week IN (0, 6);

            -- Generate realistic availability
            IF is_weekend THEN
                avail := GREATEST(0, room_type.total_rooms - FLOOR(RANDOM() * room_type.total_rooms * 0.7)::INTEGER);
            ELSE
                avail := GREATEST(0, room_type.total_rooms - FLOOR(RANDOM() * room_type.total_rooms * 0.4)::INTEGER);
            END IF;

            INSERT INTO room_availability (room_type_id, date, available, booked, total, scraped_at)
            VALUES (
                room_type.type_id,
                current_date,
                avail,
                room_type.total_rooms - avail,
                room_type.total_rooms,
                NOW()
            )
            ON CONFLICT (room_type_id, date) DO UPDATE SET
                available = EXCLUDED.available,
                booked = EXCLUDED.booked,
                total = EXCLUDED.total,
                scraped_at = NOW(),
                updated_at = NOW();
        END LOOP;
    END LOOP;
END $$;

-- ============================================================================
-- HELPER FUNCTION: Update room availability
-- Call this from the Python scraper
-- ============================================================================

CREATE OR REPLACE FUNCTION update_room_availability(
    p_room_type_id VARCHAR(64),
    p_date DATE,
    p_available INTEGER,
    p_rate DECIMAL DEFAULT NULL
)
RETURNS void AS $$
DECLARE
    v_total INTEGER;
BEGIN
    -- Get total rooms for this type
    SELECT total_rooms INTO v_total FROM room_types WHERE type_id = p_room_type_id;

    IF v_total IS NULL THEN
        RAISE EXCEPTION 'Room type % not found', p_room_type_id;
    END IF;

    INSERT INTO room_availability (room_type_id, date, available, booked, total, rate, scraped_at)
    VALUES (
        p_room_type_id,
        p_date,
        p_available,
        v_total - p_available,
        v_total,
        p_rate,
        NOW()
    )
    ON CONFLICT (room_type_id, date) DO UPDATE SET
        available = p_available,
        booked = room_availability.total - p_available,
        rate = COALESCE(p_rate, room_availability.rate),
        scraped_at = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFY INSTALLATION
-- ============================================================================

SELECT 'room_types' as table_name, COUNT(*) as row_count FROM room_types
UNION ALL
SELECT 'room_availability' as table_name, COUNT(*) as row_count FROM room_availability;
