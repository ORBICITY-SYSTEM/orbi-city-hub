-- ═══════════════════════════════════════════════════════════════════
-- ORBI CITY HUB - COMPLETE LOGISTICS DATA FIX
-- Run this SQL in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- Step 1: Clear existing data to start fresh
DELETE FROM public.room_inventory_items;
DELETE FROM public.housekeeping_schedules;
DELETE FROM public.maintenance_schedules;
DELETE FROM public.standard_inventory_items;
DELETE FROM public.rooms;

-- Step 2: Insert 56 rooms
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
('D1 3414'), ('D1 3416'), ('D1 3418'), ('D2 3727')
ON CONFLICT (room_number) DO NOTHING;

-- Step 3: Insert standard inventory items
INSERT INTO public.standard_inventory_items (item_name, category, standard_quantity) VALUES
-- აბაზანის აქსესუარები
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
-- ავეჯი და ტექსტილი
('აივნის მაგიდა', 'ავეჯი და ტექსტილი', 1),
('აივნის სკამი', 'ავეჯი და ტექსტილი', 4),
('ბალიში', 'ავეჯი და ტექსტილი', 3),
('ბალიშის ჩიხოლი', 'ავეჯი და ტექსტილი', 3),
('დივანი გასაშლელი', 'ავეჯი და ტექსტილი', 1),
('ზეწარი', 'ავეჯი და ტექსტილი', 2),
-- სამზარეულოს აღჭურვილობა
('ელექტროქურა', 'სამზარეულოს აღჭურვილობა', 1),
('მაცივარი', 'სამზარეულოს აღჭურვილობა', 1),
('მიკროტალღური ღუმელი', 'სამზარეულოს აღჭურვილობა', 1),
('ელექტროჩაიდანი', 'სამზარეულოს აღჭურვილობა', 1),
('ჭურჭლის ნაკრები', 'სამზარეულოს აღჭურვილობა', 1),
('დანა-ჩანგლის ნაკრები', 'სამზარეულოს აღჭურვილობა', 1),
('ქვაბი', 'სამზარეულოს აღჭურვილობა', 2),
('ტაფა', 'სამზარეულოს აღჭურვილობა', 1)
ON CONFLICT (item_name) DO NOTHING;

-- Step 4: Populate room_inventory_items for ALL rooms with ALL standard items
INSERT INTO public.room_inventory_items (room_id, standard_item_id, actual_quantity, condition, last_checked)
SELECT
    r.id AS room_id,
    si.id AS standard_item_id,
    si.standard_quantity AS actual_quantity,
    'OK' AS condition,
    NOW() AS last_checked
FROM public.rooms r
CROSS JOIN public.standard_inventory_items si
ON CONFLICT (room_id, standard_item_id) DO NOTHING;

-- Step 5: Insert housekeeping schedules with proper schema (rooms as array of strings)
INSERT INTO public.housekeeping_schedules (scheduled_date, rooms, total_rooms, notes, status) VALUES
('2025-01-20', ARRAY['A 1033', 'A 1258', 'A 1301', 'A 1806'], 4, 'რეგულარული დასუფთავება', 'completed'),
('2025-01-21', ARRAY['A 1821', 'A 1833', 'A 2035', 'A 2441', 'A 3035'], 5, 'რეგულარული დასუფთავება', 'completed'),
('2025-01-22', ARRAY['A 3041', 'A 4022', 'A 4023', 'A 4024', 'A 4025'], 5, 'რეგულარული დასუფთავება', 'completed'),
('2025-01-23', ARRAY['C 1256', 'C 2107', 'C 2520', 'C 2522', 'C 2524'], 5, 'რეგულარული დასუფთავება', 'completed'),
('2025-01-24', ARRAY['C 2529', 'C 2547', 'C 2558', 'C 2609', 'C 2637'], 5, 'რეგულარული დასუფთავება', 'pending'),
('2025-01-25', ARRAY['C 2641', 'C 2847', 'C 2861', 'C 2921', 'C 2923'], 5, 'შაბათი - ღრმა დასუფთავება', 'pending'),
('2025-01-26', ARRAY['C 2936', 'C 2947', 'C 2961', 'C 3421', 'C 3423'], 5, 'კვირა - ღრმა დასუფთავება', 'pending'),
('2025-01-27', ARRAY['C 3425', 'C 3428', 'C 3431', 'C 3437', 'C 3439'], 5, 'რეგულარული დასუფთავება', 'pending'),
('2025-01-28', ARRAY['C 3441', 'C 3611', 'C 3834', 'C 3928', 'C 3937'], 5, 'რეგულარული დასუფთავება', 'pending'),
('2025-01-29', ARRAY['C 4011', 'C 4638', 'C 4704', 'C 4706'], 4, 'რეგულარული დასუფთავება', 'pending'),
('2025-01-30', ARRAY['D1 3414', 'D1 3416', 'D1 3418', 'D2 3727'], 4, 'D კორპუსი', 'pending'),
('2025-01-31', ARRAY['A 4026', 'A 4027', 'A 4029', 'A 4035'], 4, '40-ე სართული სრული', 'pending');

-- Step 6: Insert maintenance schedules with proper schema
INSERT INTO public.maintenance_schedules (scheduled_date, room_number, problem, notes, status, cost) VALUES
('2025-01-18', 'A 1033', 'კონდიციონერი არ მუშაობს', 'ტექნიკოსი გამოძახებულია', 'completed', 150.00),
('2025-01-19', 'C 2520', 'ონკანი წვეთავს', 'აბაზანის ონკანი შეცვლილია', 'completed', 80.00),
('2025-01-20', 'A 1806', 'ტელევიზორის პულტი არ მუშაობს', 'ახალი პულტი დაყენდა', 'completed', 25.00),
('2025-01-21', 'C 3421', 'შუშა გაბზარულია', 'მინა შეცვლილია', 'completed', 200.00),
('2025-01-22', 'D1 3414', 'წყლის გამაცხელებელი გაფუჭდა', 'ახალი დაყენდა', 'completed', 450.00),
('2025-01-23', 'A 2441', 'კარის საკეტი გაფუჭდა', 'შეკეთება მიმდინარეობს', 'in_progress', 60.00),
('2025-01-24', 'C 2861', 'ელექტროქურა არ ირთვება', 'დიაგნოსტიკა საჭიროა', 'pending', 0),
('2025-01-25', 'C 4706', 'დუშის შლანგი გატყდა', 'ახალი შეკვეთილია', 'pending', 35.00),
('2025-01-26', 'A 4023', 'მაცივარი ხმაურიანია', 'შემოწმება საჭიროა', 'pending', 0),
('2025-01-27', 'C 3937', 'აივნის კარი ჭრიალებს', 'საპოხი მასალა საჭიროა', 'pending', 15.00),
('2025-01-28', 'D2 3727', 'ვენტილაცია არ მუშაობს', 'ტექნიკოსი გამოიძახება', 'pending', 0);

-- Step 7: Create some inventory issues for demonstration
-- Mark some items as missing in specific rooms
UPDATE public.room_inventory_items
SET actual_quantity = 0, condition = 'Missing', notes = 'დაკარგულია'
WHERE room_id = (SELECT id FROM public.rooms WHERE room_number = 'A 1033')
AND standard_item_id = (SELECT id FROM public.standard_inventory_items WHERE item_name = 'ფენი');

UPDATE public.room_inventory_items
SET actual_quantity = 2, condition = 'OK', notes = '1 ბალიში დაკარგულია'
WHERE room_id = (SELECT id FROM public.rooms WHERE room_number = 'C 2520')
AND standard_item_id = (SELECT id FROM public.standard_inventory_items WHERE item_name = 'ბალიში');

UPDATE public.room_inventory_items
SET actual_quantity = 0, condition = 'To Replace', notes = 'შესაცვლელია'
WHERE room_id = (SELECT id FROM public.rooms WHERE room_number = 'C 3421')
AND standard_item_id = (SELECT id FROM public.standard_inventory_items WHERE item_name = 'ელექტროჩაიდანი');

UPDATE public.room_inventory_items
SET actual_quantity = 1, condition = 'OK', notes = '1 ზეწარი გასარეცხია'
WHERE room_id = (SELECT id FROM public.rooms WHERE room_number = 'A 1806')
AND standard_item_id = (SELECT id FROM public.standard_inventory_items WHERE item_name = 'ზეწარი');

UPDATE public.room_inventory_items
SET actual_quantity = 3, condition = 'OK', notes = '1 სკამი დამტვრეული'
WHERE room_id = (SELECT id FROM public.rooms WHERE room_number = 'D1 3414')
AND standard_item_id = (SELECT id FROM public.standard_inventory_items WHERE item_name = 'აივნის სკამი');

-- Step 8: Verify the data
SELECT 'ROOMS' as table_name, COUNT(*) as count FROM public.rooms
UNION ALL
SELECT 'STANDARD_ITEMS', COUNT(*) FROM public.standard_inventory_items
UNION ALL
SELECT 'ROOM_INVENTORY', COUNT(*) FROM public.room_inventory_items
UNION ALL
SELECT 'HOUSEKEEPING', COUNT(*) FROM public.housekeeping_schedules
UNION ALL
SELECT 'MAINTENANCE', COUNT(*) FROM public.maintenance_schedules;

-- Success message
SELECT '✅ Logistics data successfully populated!' as message,
       (SELECT COUNT(*) FROM public.rooms) as rooms,
       (SELECT COUNT(*) FROM public.standard_inventory_items) as standard_items,
       (SELECT COUNT(*) FROM public.room_inventory_items) as room_inventory_items,
       (SELECT COUNT(*) FROM public.housekeeping_schedules) as housekeeping_schedules,
       (SELECT COUNT(*) FROM public.maintenance_schedules) as maintenance_schedules;
