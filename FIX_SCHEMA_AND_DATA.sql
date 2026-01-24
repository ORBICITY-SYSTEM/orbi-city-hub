-- ═══════════════════════════════════════════════════════════════════
-- ORBI CITY HUB - FIX SCHEMA AND DATA
-- ═══════════════════════════════════════════════════════════════════
-- ეს SQL აფიქსირებს სქემას და მონაცემებს!
-- გახსენი: https://supabase.com/dashboard/project/lusagtvxjtfxgfadulgv/sql/new
-- ═══════════════════════════════════════════════════════════════════

-- STEP 1: Fix housekeeping_schedules table schema
-- ═══════════════════════════════════════════════════════════════════
-- Add 'rooms' column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'housekeeping_schedules'
        AND column_name = 'rooms'
    ) THEN
        ALTER TABLE public.housekeeping_schedules ADD COLUMN rooms TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add 'total_rooms' column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'housekeeping_schedules'
        AND column_name = 'total_rooms'
    ) THEN
        ALTER TABLE public.housekeeping_schedules ADD COLUMN total_rooms INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add 'media_urls' column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'housekeeping_schedules'
        AND column_name = 'media_urls'
    ) THEN
        ALTER TABLE public.housekeeping_schedules ADD COLUMN media_urls TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add 'additional_notes' column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'housekeeping_schedules'
        AND column_name = 'additional_notes'
    ) THEN
        ALTER TABLE public.housekeeping_schedules ADD COLUMN additional_notes TEXT;
    END IF;
END $$;

-- STEP 2: Fix maintenance_schedules table schema
-- ═══════════════════════════════════════════════════════════════════
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'maintenance_schedules'
        AND column_name = 'room_number'
    ) THEN
        ALTER TABLE public.maintenance_schedules ADD COLUMN room_number TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'maintenance_schedules'
        AND column_name = 'problem'
    ) THEN
        ALTER TABLE public.maintenance_schedules ADD COLUMN problem TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'maintenance_schedules'
        AND column_name = 'solving_date'
    ) THEN
        ALTER TABLE public.maintenance_schedules ADD COLUMN solving_date DATE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'maintenance_schedules'
        AND column_name = 'cost'
    ) THEN
        ALTER TABLE public.maintenance_schedules ADD COLUMN cost DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'maintenance_schedules'
        AND column_name = 'media_urls'
    ) THEN
        ALTER TABLE public.maintenance_schedules ADD COLUMN media_urls TEXT[] DEFAULT '{}';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'maintenance_schedules'
        AND column_name = 'additional_notes'
    ) THEN
        ALTER TABLE public.maintenance_schedules ADD COLUMN additional_notes TEXT;
    END IF;
END $$;

-- STEP 3: Fix RLS Policies
-- ═══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Allow all read housekeeping_schedules" ON public.housekeeping_schedules;
DROP POLICY IF EXISTS "Allow all insert housekeeping_schedules" ON public.housekeeping_schedules;
DROP POLICY IF EXISTS "Allow all update housekeeping_schedules" ON public.housekeeping_schedules;
DROP POLICY IF EXISTS "Allow all delete housekeeping_schedules" ON public.housekeeping_schedules;

CREATE POLICY "Allow all read housekeeping_schedules" ON public.housekeeping_schedules FOR SELECT USING (true);
CREATE POLICY "Allow all insert housekeeping_schedules" ON public.housekeeping_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update housekeeping_schedules" ON public.housekeeping_schedules FOR UPDATE USING (true);
CREATE POLICY "Allow all delete housekeeping_schedules" ON public.housekeeping_schedules FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow all read maintenance_schedules" ON public.maintenance_schedules;
DROP POLICY IF EXISTS "Allow all insert maintenance_schedules" ON public.maintenance_schedules;
DROP POLICY IF EXISTS "Allow all update maintenance_schedules" ON public.maintenance_schedules;
DROP POLICY IF EXISTS "Allow all delete maintenance_schedules" ON public.maintenance_schedules;

CREATE POLICY "Allow all read maintenance_schedules" ON public.maintenance_schedules FOR SELECT USING (true);
CREATE POLICY "Allow all insert maintenance_schedules" ON public.maintenance_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update maintenance_schedules" ON public.maintenance_schedules FOR UPDATE USING (true);
CREATE POLICY "Allow all delete maintenance_schedules" ON public.maintenance_schedules FOR DELETE USING (true);

-- STEP 4: Insert Housekeeping Data
-- ═══════════════════════════════════════════════════════════════════
DELETE FROM public.housekeeping_schedules;

INSERT INTO public.housekeeping_schedules (scheduled_date, rooms, total_rooms, notes, status) VALUES
('2025-01-20', ARRAY['A 1033', 'A 1258', 'A 1301', 'A 1806'], 4, 'რეგულარული დასუფთავება', 'completed'),
('2025-01-21', ARRAY['A 1821', 'A 1833', 'A 2035', 'A 2441', 'A 3035'], 5, 'რეგულარული დასუფთავება', 'completed'),
('2025-01-22', ARRAY['A 3041', 'A 4022', 'A 4023', 'A 4024', 'A 4025'], 5, 'რეგულარული დასუფთავება', 'completed'),
('2025-01-23', ARRAY['C 1256', 'C 2107', 'C 2520', 'C 2522', 'C 2524'], 5, 'რეგულარული დასუფთავება', 'completed'),
('2025-01-24', ARRAY['C 2529', 'C 2547', 'C 2558', 'C 2609', 'C 2637'], 5, 'რეგულარული დასუფთავება', 'pending'),
('2025-01-25', ARRAY['C 2641', 'C 2847', 'C 2861', 'C 2921', 'C 2923'], 5, 'შაბათი - ღრმა დასუფთავება', 'pending'),
('2025-01-26', ARRAY['C 2936', 'C 2947', 'C 2961', 'C 3421', 'C 3423'], 5, 'კვირა', 'pending'),
('2025-01-27', ARRAY['C 3425', 'C 3428', 'C 3431', 'C 3437', 'C 3439'], 5, 'რეგულარული', 'pending'),
('2025-01-28', ARRAY['C 3441', 'C 3611', 'C 3834', 'C 3928', 'C 3937'], 5, 'რეგულარული', 'pending'),
('2025-01-29', ARRAY['C 4011', 'C 4638', 'C 4704', 'C 4706'], 4, 'რეგულარული', 'pending'),
('2025-01-30', ARRAY['D1 3414', 'D1 3416', 'D1 3418', 'D2 3727'], 4, 'D კორპუსი', 'pending'),
('2025-01-31', ARRAY['A 4026', 'A 4027', 'A 4029', 'A 4035'], 4, '40-ე სართული', 'pending');

-- STEP 5: Insert Maintenance Data
-- ═══════════════════════════════════════════════════════════════════
DELETE FROM public.maintenance_schedules;

INSERT INTO public.maintenance_schedules (scheduled_date, room_number, problem, notes, status, cost) VALUES
('2025-01-18', 'A 1033', 'კონდიციონერი არ მუშაობს', 'ტექნიკოსი გამოძახებულია', 'completed', 150),
('2025-01-19', 'C 2520', 'ონკანი წვეთავს', 'აბაზანის ონკანი შეცვლილია', 'completed', 80),
('2025-01-20', 'A 1806', 'ტელევიზორის პულტი არ მუშაობს', 'ახალი პულტი დაყენდა', 'completed', 25),
('2025-01-21', 'C 3421', 'შუშა გაბზარულია', 'მინა შეცვლილია', 'completed', 200),
('2025-01-22', 'D1 3414', 'წყლის გამაცხელებელი გაფუჭდა', 'ახალი დაყენდა', 'completed', 450),
('2025-01-23', 'A 2441', 'კარის საკეტი გაფუჭდა', 'შეკეთება მიმდინარეობს', 'in_progress', 60),
('2025-01-24', 'C 2861', 'ელექტროქურა არ ირთვება', 'დიაგნოსტიკა საჭიროა', 'pending', 0),
('2025-01-25', 'C 4706', 'დუშის შლანგი გატყდა', 'ახალი შეკვეთილია', 'pending', 35),
('2025-01-26', 'A 4023', 'მაცივარი ხმაურიანია', 'შემოწმება საჭიროა', 'pending', 0),
('2025-01-27', 'C 3937', 'აივნის კარი ჭრიალებს', 'საპოხი მასალა საჭიროა', 'pending', 15),
('2025-01-28', 'D2 3727', 'ვენტილაცია არ მუშაობს', 'ტექნიკოსი გამოიძახება', 'pending', 0);

-- STEP 6: Verify Results
-- ═══════════════════════════════════════════════════════════════════
SELECT '═══════════════════════════════════════' as "═══════════════════════════════════════";
SELECT '✅ SCHEMA AND DATA FIXED!' as result;
SELECT '═══════════════════════════════════════' as "═══════════════════════════════════════";

SELECT
    'ROOMS' as table_name, (SELECT COUNT(*) FROM public.rooms) as count
UNION ALL SELECT
    'STANDARD_ITEMS', (SELECT COUNT(*) FROM public.standard_inventory_items)
UNION ALL SELECT
    'ROOM_INVENTORY', (SELECT COUNT(*) FROM public.room_inventory_items)
UNION ALL SELECT
    'HOUSEKEEPING', (SELECT COUNT(*) FROM public.housekeeping_schedules)
UNION ALL SELECT
    'MAINTENANCE', (SELECT COUNT(*) FROM public.maintenance_schedules);

SELECT 'გაახალე გვერდი: http://localhost:3004/logistics' as next_step;
