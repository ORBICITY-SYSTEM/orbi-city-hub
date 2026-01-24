-- ===================================================
-- FIX ALL GEORGIAN ENCODING - COMPREHENSIVE
-- Run this in Supabase SQL Editor
-- ===================================================

-- ============================================
-- STEP 1: DELETE ALL CORRUPTED RECORDS AND RE-INSERT
-- ============================================

-- First, let's see what's corrupted
-- SELECT * FROM housekeeping_schedules WHERE notes !~ '^[a-zA-Z0-9\s\.,\-\_]*$' AND notes !~ '^[\u10A0-\u10FF\s\.,\-\_0-9]*$';

-- ============================================
-- HOUSEKEEPING - Delete corrupted and update
-- ============================================

-- Update December 2025 entries - all should be "ნანა"
UPDATE housekeeping_schedules
SET notes = 'ნანა'
WHERE scheduled_date >= '2025-12-01'
  AND scheduled_date <= '2025-12-31';

-- Update January 2025 specific entries
UPDATE housekeeping_schedules SET notes = 'ყოველდღიური დასუფთავება' WHERE scheduled_date = '2025-01-20';
UPDATE housekeeping_schedules SET notes = 'დასუფთავება' WHERE scheduled_date = '2025-01-21';
UPDATE housekeeping_schedules SET notes = 'C კორპუსი' WHERE scheduled_date = '2025-01-22';
UPDATE housekeeping_schedules SET notes = '29-ე სართული' WHERE scheduled_date = '2025-01-23';
UPDATE housekeeping_schedules SET notes = '34-ე სართული' WHERE scheduled_date = '2025-01-26';
UPDATE housekeeping_schedules SET notes = 'D კორპუსი' WHERE scheduled_date = '2025-01-27';

-- If there are other January entries with "ნანა"
UPDATE housekeeping_schedules
SET notes = 'ნანა'
WHERE scheduled_date >= '2025-01-01'
  AND scheduled_date <= '2025-01-31'
  AND notes IS NOT NULL
  AND notes NOT IN ('ყოველდღიური დასუფთავება', 'დასუფთავება', 'C კორპუსი', '29-ე სართული', '34-ე სართული', 'D კორპუსი', 'ნანა');

-- ============================================
-- MAINTENANCE - Fix all problems
-- ============================================

-- January 2025
UPDATE maintenance_schedules SET problem = 'ელემენტის შეცვლა' WHERE room_number = 'A 1806' AND scheduled_date = '2025-01-18';
UPDATE maintenance_schedules SET problem = 'კარი დაზიანდა' WHERE room_number = 'C 3421' AND scheduled_date = '2025-01-19';
UPDATE maintenance_schedules SET problem = 'წყალი გაჟონა' WHERE room_number = 'D1 3414' AND scheduled_date = '2025-01-20';
UPDATE maintenance_schedules SET problem = 'წყლის გაჟონვა' WHERE room_number = 'A 2441' AND scheduled_date = '2025-01-21';
UPDATE maintenance_schedules SET problem = 'კონდიციონერი არ მუშაობს' WHERE room_number = 'C 2861' AND scheduled_date = '2025-01-22';
UPDATE maintenance_schedules SET problem = 'შუქი არ ინთება' WHERE room_number = 'C 4706' AND scheduled_date = '2025-01-23';
UPDATE maintenance_schedules SET problem = 'საბარათე დაზიანდა' WHERE room_number = 'A 4023' AND scheduled_date = '2025-01-26';
UPDATE maintenance_schedules SET problem = 'კარი არ იკეტება' WHERE room_number = 'D2 3727' AND scheduled_date = '2025-01-27';

-- December 2025
UPDATE maintenance_schedules SET problem = 'საბარათე დაზიანდა' WHERE room_number = 'C 3611' AND scheduled_date = '2025-12-16';
UPDATE maintenance_schedules SET problem = 'გატყდა დუშის ყურმილი' WHERE room_number = 'C 2947' AND scheduled_date = '2025-12-13';
UPDATE maintenance_schedules SET problem = 'C837 საბარათე' WHERE room_number = 'C 1256' AND scheduled_date = '2025-12-12';
UPDATE maintenance_schedules SET problem = 'შუქი არ ინთებოდა' WHERE room_number = 'C 1256' AND scheduled_date = '2025-12-10';
UPDATE maintenance_schedules SET problem = 'კარის ელემენტი დაჯდა' WHERE room_number = 'A 1301' AND scheduled_date = '2025-12-04';
UPDATE maintenance_schedules SET problem = 'აივნის კარი არ იკეტება' WHERE room_number = 'A 1033' AND scheduled_date = '2025-12-03';

-- November 2025
UPDATE maintenance_schedules SET problem = 'დაიკარგა ბარათი' WHERE room_number = 'C 4704' AND scheduled_date = '2025-11-29';
UPDATE maintenance_schedules SET problem = 'უნიტაზში წყალი ჩადის' WHERE room_number = 'A 3035' AND scheduled_date = '2025-11-22';
UPDATE maintenance_schedules SET problem = 'უნიტაზში წყალი ჩადის' WHERE room_number = 'A 3035' AND scheduled_date = '2025-11-21';
UPDATE maintenance_schedules SET problem = 'პულტის ელემენტი' WHERE room_number = 'A 2035' AND scheduled_date = '2025-11-20';
UPDATE maintenance_schedules SET problem = 'დუშის შლანგი გაფუჭდა' WHERE room_number = 'A 3035' AND scheduled_date = '2025-11-19';

-- ============================================
-- STANDARD INVENTORY ITEMS - Fix categories and names
-- ============================================

-- Update categories
UPDATE standard_inventory_items SET category = 'აბაზანის აქსესუარები' WHERE category LIKE '%?%' OR category LIKE '%�%';
UPDATE standard_inventory_items SET category = 'ავეჯი და ტექსტილი' WHERE category LIKE '%?%' OR category LIKE '%�%';
UPDATE standard_inventory_items SET category = 'სამზარეულო' WHERE category LIKE '%?%' OR category LIKE '%�%';
UPDATE standard_inventory_items SET category = 'ელექტრონიკა' WHERE category LIKE '%?%' OR category LIKE '%�%';

-- Fix specific standard inventory items by ID pattern
-- აბაზანის აქსესუარები
UPDATE standard_inventory_items SET
  category = 'აბაზანის აქსესუარები',
  item_name = 'აბაზანის სარკე'
WHERE item_name LIKE '%სარკე%' OR item_name LIKE '%mirror%';

UPDATE standard_inventory_items SET
  category = 'აბაზანის აქსესუარები',
  item_name = 'ნაგვის ურნა'
WHERE item_name LIKE '%ურნა%' OR item_name LIKE '%trash%';

UPDATE standard_inventory_items SET
  category = 'აბაზანის აქსესუარები',
  item_name = 'ნიჟარა შემრევით'
WHERE item_name LIKE '%ნიჟარ%' OR item_name LIKE '%sink%';

UPDATE standard_inventory_items SET
  category = 'აბაზანის აქსესუარები',
  item_name = 'საშხაპე დუშითა და შემრევით'
WHERE item_name LIKE '%საშხაპე%' OR item_name LIKE '%shower%';

UPDATE standard_inventory_items SET
  category = 'აბაზანის აქსესუარები',
  item_name = 'უნიტაზი'
WHERE item_name LIKE '%უნიტაზ%' OR item_name LIKE '%toilet%';

UPDATE standard_inventory_items SET
  category = 'აბაზანის აქსესუარები',
  item_name = 'ფენი'
WHERE item_name LIKE '%ფენ%' OR item_name LIKE '%dryer%';

UPDATE standard_inventory_items SET
  category = 'აბაზანის აქსესუარები',
  item_name = 'წყლის გამაცხელებელი'
WHERE item_name LIKE '%გამაცხელებელ%' OR item_name LIKE '%heater%';

-- ავეჯი და ტექსტილი
UPDATE standard_inventory_items SET
  category = 'ავეჯი და ტექსტილი',
  item_name = 'საწოლი მატრასით'
WHERE item_name LIKE '%საწოლ%' AND item_name LIKE '%მატრას%';

UPDATE standard_inventory_items SET
  category = 'ავეჯი და ტექსტილი',
  item_name = 'დივანი გასაშლელი'
WHERE item_name LIKE '%დივან%';

UPDATE standard_inventory_items SET
  category = 'ავეჯი და ტექსტილი',
  item_name = 'ბალიში'
WHERE item_name LIKE '%ბალიშ%' OR item_name LIKE '%pillow%';

UPDATE standard_inventory_items SET
  category = 'ავეჯი და ტექსტილი',
  item_name = 'ზეწარი'
WHERE item_name LIKE '%ზეწარ%' OR item_name LIKE '%sheet%';

UPDATE standard_inventory_items SET
  category = 'ავეჯი და ტექსტილი',
  item_name = 'საბანი'
WHERE item_name LIKE '%საბან%' OR item_name LIKE '%blanket%';

UPDATE standard_inventory_items SET
  category = 'ავეჯი და ტექსტილი',
  item_name = 'ფარდა'
WHERE item_name LIKE '%ფარდ%' OR item_name LIKE '%curtain%';

UPDATE standard_inventory_items SET
  category = 'ავეჯი და ტექსტილი',
  item_name = 'კარადა სარკით'
WHERE item_name LIKE '%კარადა%' OR item_name LIKE '%wardrobe%';

UPDATE standard_inventory_items SET
  category = 'ავეჯი და ტექსტილი',
  item_name = 'აივნის მაგიდა'
WHERE item_name LIKE '%აივნის%' AND item_name LIKE '%მაგიდა%';

UPDATE standard_inventory_items SET
  category = 'ავეჯი და ტექსტილი',
  item_name = 'აივნის სკამი'
WHERE item_name LIKE '%აივნის%' AND item_name LIKE '%სკამ%';

-- ============================================
-- VERIFY RESULTS
-- ============================================

-- Check for any remaining broken encoding
SELECT 'Housekeeping still broken:' as check_type, COUNT(*) as count
FROM housekeeping_schedules
WHERE notes LIKE '%?%' OR notes LIKE '%�%' OR notes ~ '[^\x00-\x7F\u10A0-\u10FF\s]';

SELECT 'Maintenance still broken:' as check_type, COUNT(*) as count
FROM maintenance_schedules
WHERE problem LIKE '%?%' OR problem LIKE '%�%';

SELECT 'Standard items still broken:' as check_type, COUNT(*) as count
FROM standard_inventory_items
WHERE category LIKE '%?%' OR item_name LIKE '%?%' OR category LIKE '%�%' OR item_name LIKE '%�%';

-- Show all housekeeping notes
SELECT DISTINCT notes, COUNT(*) as count FROM housekeeping_schedules GROUP BY notes;

-- Show all maintenance problems
SELECT DISTINCT problem, COUNT(*) as count FROM maintenance_schedules GROUP BY problem;
