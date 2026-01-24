-- FIX GEORGIAN ENCODING ISSUES
-- Run this in Supabase SQL Editor

-- ============================================
-- FIX HOUSEKEEPING NOTES
-- ============================================

-- December entries should all be "ნანა"
UPDATE housekeeping_schedules
SET notes = 'ნანა'
WHERE scheduled_date >= '2025-12-01'
  AND scheduled_date <= '2025-12-31'
  AND notes LIKE '%?%';

-- January entries - fix specific ones
UPDATE housekeeping_schedules SET notes = 'ყოველდღიური დასუფთავება' WHERE scheduled_date = '2025-01-20' AND notes LIKE '%?%';
UPDATE housekeeping_schedules SET notes = 'დასუფთავება' WHERE scheduled_date = '2025-01-21' AND notes LIKE '%?%';
UPDATE housekeeping_schedules SET notes = 'C კორპუსი' WHERE scheduled_date = '2025-01-22' AND notes LIKE '%?%';
UPDATE housekeeping_schedules SET notes = '29-ე სართული' WHERE scheduled_date = '2025-01-23' AND notes LIKE '%?%';
UPDATE housekeeping_schedules SET notes = '34-ე სართული' WHERE scheduled_date = '2025-01-26' AND notes LIKE '%?%';
UPDATE housekeeping_schedules SET notes = 'D კორპუსი' WHERE scheduled_date = '2025-01-27' AND notes LIKE '%?%';

-- ============================================
-- FIX MAINTENANCE PROBLEMS
-- ============================================

-- Fix by room_number and scheduled_date
UPDATE maintenance_schedules SET problem = 'ელემენტის შეცვლა' WHERE room_number = 'A 1806' AND scheduled_date = '2025-01-18' AND problem LIKE '%?%';
UPDATE maintenance_schedules SET problem = 'კარი დაზიანდა' WHERE room_number = 'C 3421' AND scheduled_date = '2025-01-19' AND problem LIKE '%?%';
UPDATE maintenance_schedules SET problem = 'წყალი გაჟონა' WHERE room_number = 'D1 3414' AND scheduled_date = '2025-01-20' AND problem LIKE '%?%';
UPDATE maintenance_schedules SET problem = 'წყლის გაჟონვა' WHERE room_number = 'A 2441' AND scheduled_date = '2025-01-21' AND problem LIKE '%?%';
UPDATE maintenance_schedules SET problem = 'კონდიციონერი არ მუშაობს' WHERE room_number = 'C 2861' AND scheduled_date = '2025-01-22' AND problem LIKE '%?%';
UPDATE maintenance_schedules SET problem = 'შუქი არ ინთება' WHERE room_number = 'C 4706' AND scheduled_date = '2025-01-23' AND problem LIKE '%?%';
UPDATE maintenance_schedules SET problem = 'საბარათე დაზიანდა' WHERE room_number = 'A 4023' AND scheduled_date = '2025-01-26' AND problem LIKE '%?%';
UPDATE maintenance_schedules SET problem = 'კარი არ იკეტება' WHERE room_number = 'D2 3727' AND scheduled_date = '2025-01-27' AND problem LIKE '%?%';

-- December entries from original data
UPDATE maintenance_schedules SET problem = 'საბარათე დაზიანდა' WHERE room_number = 'C 3611' AND scheduled_date = '2025-12-16' AND problem LIKE '%?%';
UPDATE maintenance_schedules SET problem = 'გატყდა დუშის ყურმილი' WHERE room_number = 'C 2947' AND scheduled_date = '2025-12-13' AND problem LIKE '%?%';
UPDATE maintenance_schedules SET problem = 'C837 საბარათე' WHERE room_number = 'C 1256' AND scheduled_date = '2025-12-12' AND problem LIKE '%?%';
UPDATE maintenance_schedules SET problem = 'შუქი არ ინთებოდა' WHERE room_number = 'C 1256' AND scheduled_date = '2025-12-10' AND problem LIKE '%?%';
UPDATE maintenance_schedules SET problem = 'კარის ელემენტი დაჯდა' WHERE room_number = 'A 1301' AND scheduled_date = '2025-12-04' AND problem LIKE '%?%';
UPDATE maintenance_schedules SET problem = 'აივნის კარი არ იკეტება' WHERE room_number = 'A 1033' AND scheduled_date = '2025-12-03' AND problem LIKE '%?%';
UPDATE maintenance_schedules SET problem = 'დაიკარგა ბარათი' WHERE room_number = 'C 4704' AND scheduled_date = '2025-11-29' AND problem LIKE '%?%';
UPDATE maintenance_schedules SET problem = 'უნიტაზში წყალი ჩადის' WHERE room_number = 'A 3035' AND scheduled_date = '2025-11-22' AND problem LIKE '%?%';
UPDATE maintenance_schedules SET problem = 'უნიტაზში წყალი ჩადის' WHERE room_number = 'A 3035' AND scheduled_date = '2025-11-21' AND problem LIKE '%?%';
UPDATE maintenance_schedules SET problem = 'პულტის ელემენტი' WHERE room_number = 'A 2035' AND scheduled_date = '2025-11-20' AND problem LIKE '%?%';
UPDATE maintenance_schedules SET problem = 'დუშის შლანგი გაფუჭდა' WHERE room_number = 'A 3035' AND scheduled_date = '2025-11-19' AND problem LIKE '%?%';

-- ============================================
-- VERIFY RESULTS
-- ============================================
SELECT 'Housekeeping with broken encoding:' as check_type, COUNT(*) as count FROM housekeeping_schedules WHERE notes LIKE '%?%';
SELECT 'Maintenance with broken encoding:' as check_type, COUNT(*) as count FROM maintenance_schedules WHERE problem LIKE '%?%';
