-- ═══════════════════════════════════════════════════════════════════
-- ORBI CITY HUB - COMPLETE LOGISTICS FIX (ALL-IN-ONE)
-- ═══════════════════════════════════════════════════════════════════
-- Run this SINGLE script in Supabase SQL Editor to fix everything!
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- PART 1: FIX RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════

-- Enable RLS
ALTER TABLE IF EXISTS public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.standard_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.room_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.housekeeping_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.maintenance_schedules ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for ROOMS
DROP POLICY IF EXISTS "Allow all read rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow all insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow all update rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow all delete rooms" ON public.rooms;
CREATE POLICY "Allow all read rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow all insert rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update rooms" ON public.rooms FOR UPDATE USING (true);
CREATE POLICY "Allow all delete rooms" ON public.rooms FOR DELETE USING (true);

-- Drop and recreate policies for STANDARD_INVENTORY_ITEMS
DROP POLICY IF EXISTS "Allow all read standard_inventory_items" ON public.standard_inventory_items;
DROP POLICY IF EXISTS "Allow all insert standard_inventory_items" ON public.standard_inventory_items;
DROP POLICY IF EXISTS "Allow all update standard_inventory_items" ON public.standard_inventory_items;
CREATE POLICY "Allow all read standard_inventory_items" ON public.standard_inventory_items FOR SELECT USING (true);
CREATE POLICY "Allow all insert standard_inventory_items" ON public.standard_inventory_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update standard_inventory_items" ON public.standard_inventory_items FOR UPDATE USING (true);

-- Drop and recreate policies for ROOM_INVENTORY_ITEMS
DROP POLICY IF EXISTS "Allow all read room_inventory_items" ON public.room_inventory_items;
DROP POLICY IF EXISTS "Allow all insert room_inventory_items" ON public.room_inventory_items;
DROP POLICY IF EXISTS "Allow all update room_inventory_items" ON public.room_inventory_items;
DROP POLICY IF EXISTS "Allow all delete room_inventory_items" ON public.room_inventory_items;
CREATE POLICY "Allow all read room_inventory_items" ON public.room_inventory_items FOR SELECT USING (true);
CREATE POLICY "Allow all insert room_inventory_items" ON public.room_inventory_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update room_inventory_items" ON public.room_inventory_items FOR UPDATE USING (true);
CREATE POLICY "Allow all delete room_inventory_items" ON public.room_inventory_items FOR DELETE USING (true);

-- Drop and recreate policies for HOUSEKEEPING_SCHEDULES
DROP POLICY IF EXISTS "Allow all read housekeeping_schedules" ON public.housekeeping_schedules;
DROP POLICY IF EXISTS "Allow all insert housekeeping_schedules" ON public.housekeeping_schedules;
DROP POLICY IF EXISTS "Allow all update housekeeping_schedules" ON public.housekeeping_schedules;
DROP POLICY IF EXISTS "Allow all delete housekeeping_schedules" ON public.housekeeping_schedules;
CREATE POLICY "Allow all read housekeeping_schedules" ON public.housekeeping_schedules FOR SELECT USING (true);
CREATE POLICY "Allow all insert housekeeping_schedules" ON public.housekeeping_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update housekeeping_schedules" ON public.housekeeping_schedules FOR UPDATE USING (true);
CREATE POLICY "Allow all delete housekeeping_schedules" ON public.housekeeping_schedules FOR DELETE USING (true);

-- Drop and recreate policies for MAINTENANCE_SCHEDULES
DROP POLICY IF EXISTS "Allow all read maintenance_schedules" ON public.maintenance_schedules;
DROP POLICY IF EXISTS "Allow all insert maintenance_schedules" ON public.maintenance_schedules;
DROP POLICY IF EXISTS "Allow all update maintenance_schedules" ON public.maintenance_schedules;
DROP POLICY IF EXISTS "Allow all delete maintenance_schedules" ON public.maintenance_schedules;
CREATE POLICY "Allow all read maintenance_schedules" ON public.maintenance_schedules FOR SELECT USING (true);
CREATE POLICY "Allow all insert maintenance_schedules" ON public.maintenance_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update maintenance_schedules" ON public.maintenance_schedules FOR UPDATE USING (true);
CREATE POLICY "Allow all delete maintenance_schedules" ON public.maintenance_schedules FOR DELETE USING (true);

-- ═══════════════════════════════════════════════════════════════════
-- PART 2: CLEAR AND REPOPULATE DATA
-- ═══════════════════════════════════════════════════════════════════

-- Clear existing data
DELETE FROM public.room_inventory_items;
DELETE FROM public.housekeeping_schedules;
DELETE FROM public.maintenance_schedules;
DELETE FROM public.standard_inventory_items;
DELETE FROM public.rooms;

-- Insert 56 rooms
INSERT INTO public.rooms (room_number) VALUES
('A 1033'), ('A 1258'), ('A 1301'), ('A 1806'), ('A 1821'), ('A 1833'),
('A 2035'), ('A 2441'), ('A 3035'), ('A 3041'), ('A 4022'), ('A 4023'),
('A 4024'), ('A 4025'), ('A 4026'), ('A 4027'), ('A 4029'), ('A 4035'),
('C 1256'), ('C 2107'), ('C 2520'), ('C 2522'), ('C 2524'), ('C 2529'),
('C 2547'), ('C 2558'), ('C 2609'), ('C 2637'), ('C 2641'), ('C 2847'),
('C 2861'), ('C 2921'), ('C 2923'), ('C 2936'), ('C 2947'), ('C 2961'),
('C 3421'), ('C 3423'), ('C 3425'), ('C 3428'), ('C 3431'), ('C 3437'),
('C 3439'), ('C 3441'), ('C 3611'), ('C 3834'), ('C 3928'), ('C 3937'),
('C 4011'), ('C 4638'), ('C 4704'), ('C 4706'),
('D1 3414'), ('D1 3416'), ('D1 3418'), ('D2 3727');

-- Insert standard inventory items (25 items)
INSERT INTO public.standard_inventory_items (item_name, category, standard_quantity) VALUES
('აბაზანის სარკე', 'აბაზანის აქსესუარები', 1),
('ნაგვის ურნა', 'აბაზანის აქსესუარები', 1),
('ნიჟარა შემრევით', 'აბაზანის აქსესუარები', 1),
('საშხაპე დუშითა და შემრევით', 'აბაზანის აქსესუარები', 1),
('საშხაპის აქსესუარი', 'აბაზანის აქსესუარები', 1),
('ტუალეტის ქაღალდის საკიდი', 'აბაზანის აქსესუარები', 1),
('უნიტაზი', 'აბაზანის აქსესუარები', 1),
('უნიტაზის ჯაგრისი', 'აბაზანის აქსესუარები', 1),
('ფენი', 'აბაზანის აქსესუარები', 1),
('წყლის გამაცხელებელი', 'აბაზანის აქსესუარები', 1),
('ხის კალათა', 'აბაზანის აქსესუარები', 1),
('აივნის მაგიდა', 'ავეჯი და ტექსტილი', 1),
('აივნის სკამი', 'ავეჯი და ტექსტილი', 4),
('ბალიში', 'ავეჯი და ტექსტილი', 3),
('ბალიშის ჩიხოლი', 'ავეჯი და ტექსტილი', 3),
('დივანი გასაშლელი', 'ავეჯი და ტექსტილი', 1),
('ზეწარი', 'ავეჯი და ტექსტილი', 2),
('ელექტროქურა', 'სამზარეულოს აღჭურვილობა', 1),
('მაცივარი', 'სამზარეულოს აღჭურვილობა', 1),
('მიკროტალღური ღუმელი', 'სამზარეულოს აღჭურვილობა', 1),
('ელექტროჩაიდანი', 'სამზარეულოს აღჭურვილობა', 1),
('ჭურჭლის ნაკრები', 'სამზარეულოს აღჭურვილობა', 1),
('დანა-ჩანგლის ნაკრები', 'სამზარეულოს აღჭურვილობა', 1),
('ქვაბი', 'სამზარეულოს აღჭურვილობა', 2),
('ტაფა', 'სამზარეულოს აღჭურვილობა', 1);

-- Populate room_inventory_items for ALL rooms with ALL items
INSERT INTO public.room_inventory_items (room_id, standard_item_id, actual_quantity, condition, last_checked)
SELECT r.id, si.id, si.standard_quantity, 'OK', NOW()
FROM public.rooms r
CROSS JOIN public.standard_inventory_items si;

-- Insert housekeeping schedules (rooms as array of strings)
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

-- Insert maintenance schedules
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

-- Create some inventory issues for demonstration
UPDATE public.room_inventory_items
SET actual_quantity = 0, condition = 'Missing', notes = 'დაკარგულია'
WHERE room_id = (SELECT id FROM public.rooms WHERE room_number = 'A 1033' LIMIT 1)
AND standard_item_id = (SELECT id FROM public.standard_inventory_items WHERE item_name = 'ფენი' LIMIT 1);

UPDATE public.room_inventory_items
SET actual_quantity = 2, condition = 'OK', notes = '1 ბალიში დაკარგულია'
WHERE room_id = (SELECT id FROM public.rooms WHERE room_number = 'C 2520' LIMIT 1)
AND standard_item_id = (SELECT id FROM public.standard_inventory_items WHERE item_name = 'ბალიში' LIMIT 1);

UPDATE public.room_inventory_items
SET actual_quantity = 0, condition = 'To Replace', notes = 'შესაცვლელია'
WHERE room_id = (SELECT id FROM public.rooms WHERE room_number = 'C 3421' LIMIT 1)
AND standard_item_id = (SELECT id FROM public.standard_inventory_items WHERE item_name = 'ელექტროჩაიდანი' LIMIT 1);

-- ═══════════════════════════════════════════════════════════════════
-- PART 3: VERIFY RESULTS
-- ═══════════════════════════════════════════════════════════════════

SELECT '═══════════════════════════════════════' as "═══════════════════════════════════════";
SELECT '✅ LOGISTICS DATA FIXED SUCCESSFULLY!' as result;
SELECT '═══════════════════════════════════════' as "═══════════════════════════════════════";

SELECT
    'ROOMS' as table_name,
    (SELECT COUNT(*) FROM public.rooms) as count
UNION ALL
SELECT
    'STANDARD_ITEMS',
    (SELECT COUNT(*) FROM public.standard_inventory_items)
UNION ALL
SELECT
    'ROOM_INVENTORY',
    (SELECT COUNT(*) FROM public.room_inventory_items)
UNION ALL
SELECT
    'HOUSEKEEPING',
    (SELECT COUNT(*) FROM public.housekeeping_schedules)
UNION ALL
SELECT
    'MAINTENANCE',
    (SELECT COUNT(*) FROM public.maintenance_schedules);

SELECT '═══════════════════════════════════════' as "═══════════════════════════════════════";
SELECT 'გაახალეთ გვერდი ბრაუზერში!' as message_ka, 'Refresh the page in browser!' as message_en;
SELECT '═══════════════════════════════════════' as "═══════════════════════════════════════";
