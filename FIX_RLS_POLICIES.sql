-- ═══════════════════════════════════════════════════════════════════
-- ORBI CITY HUB - FIX RLS POLICIES FOR LOGISTICS
-- Run this SQL in Supabase SQL Editor AFTER running FIX_LOGISTICS_DATA.sql
-- ═══════════════════════════════════════════════════════════════════

-- Step 1: Enable RLS on all tables (if not already enabled)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standard_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housekeeping_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_activity_log ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Allow all read rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow all insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow all update rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow all delete rooms" ON public.rooms;

DROP POLICY IF EXISTS "Allow all read standard_inventory_items" ON public.standard_inventory_items;
DROP POLICY IF EXISTS "Allow all insert standard_inventory_items" ON public.standard_inventory_items;
DROP POLICY IF EXISTS "Allow all update standard_inventory_items" ON public.standard_inventory_items;

DROP POLICY IF EXISTS "Allow all read room_inventory_items" ON public.room_inventory_items;
DROP POLICY IF EXISTS "Allow all insert room_inventory_items" ON public.room_inventory_items;
DROP POLICY IF EXISTS "Allow all update room_inventory_items" ON public.room_inventory_items;
DROP POLICY IF EXISTS "Allow all delete room_inventory_items" ON public.room_inventory_items;

DROP POLICY IF EXISTS "Allow all read housekeeping_schedules" ON public.housekeeping_schedules;
DROP POLICY IF EXISTS "Allow all insert housekeeping_schedules" ON public.housekeeping_schedules;
DROP POLICY IF EXISTS "Allow all update housekeeping_schedules" ON public.housekeeping_schedules;
DROP POLICY IF EXISTS "Allow all delete housekeeping_schedules" ON public.housekeeping_schedules;

DROP POLICY IF EXISTS "Allow all read maintenance_schedules" ON public.maintenance_schedules;
DROP POLICY IF EXISTS "Allow all insert maintenance_schedules" ON public.maintenance_schedules;
DROP POLICY IF EXISTS "Allow all update maintenance_schedules" ON public.maintenance_schedules;
DROP POLICY IF EXISTS "Allow all delete maintenance_schedules" ON public.maintenance_schedules;

DROP POLICY IF EXISTS "Allow all read logistics_activity_log" ON public.logistics_activity_log;
DROP POLICY IF EXISTS "Allow all insert logistics_activity_log" ON public.logistics_activity_log;

-- Step 3: Create permissive policies for all operations
-- ROOMS
CREATE POLICY "Allow all read rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow all insert rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update rooms" ON public.rooms FOR UPDATE USING (true);
CREATE POLICY "Allow all delete rooms" ON public.rooms FOR DELETE USING (true);

-- STANDARD INVENTORY ITEMS
CREATE POLICY "Allow all read standard_inventory_items" ON public.standard_inventory_items FOR SELECT USING (true);
CREATE POLICY "Allow all insert standard_inventory_items" ON public.standard_inventory_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update standard_inventory_items" ON public.standard_inventory_items FOR UPDATE USING (true);

-- ROOM INVENTORY ITEMS
CREATE POLICY "Allow all read room_inventory_items" ON public.room_inventory_items FOR SELECT USING (true);
CREATE POLICY "Allow all insert room_inventory_items" ON public.room_inventory_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update room_inventory_items" ON public.room_inventory_items FOR UPDATE USING (true);
CREATE POLICY "Allow all delete room_inventory_items" ON public.room_inventory_items FOR DELETE USING (true);

-- HOUSEKEEPING SCHEDULES
CREATE POLICY "Allow all read housekeeping_schedules" ON public.housekeeping_schedules FOR SELECT USING (true);
CREATE POLICY "Allow all insert housekeeping_schedules" ON public.housekeeping_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update housekeeping_schedules" ON public.housekeeping_schedules FOR UPDATE USING (true);
CREATE POLICY "Allow all delete housekeeping_schedules" ON public.housekeeping_schedules FOR DELETE USING (true);

-- MAINTENANCE SCHEDULES
CREATE POLICY "Allow all read maintenance_schedules" ON public.maintenance_schedules FOR SELECT USING (true);
CREATE POLICY "Allow all insert maintenance_schedules" ON public.maintenance_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update maintenance_schedules" ON public.maintenance_schedules FOR UPDATE USING (true);
CREATE POLICY "Allow all delete maintenance_schedules" ON public.maintenance_schedules FOR DELETE USING (true);

-- LOGISTICS ACTIVITY LOG
CREATE POLICY "Allow all read logistics_activity_log" ON public.logistics_activity_log FOR SELECT USING (true);
CREATE POLICY "Allow all insert logistics_activity_log" ON public.logistics_activity_log FOR INSERT WITH CHECK (true);

-- Step 4: Ensure room_inventory_items has the unique constraint for upserts
-- First check if it exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'room_inventory_items_room_id_standard_item_id_key'
    ) THEN
        ALTER TABLE public.room_inventory_items
        ADD CONSTRAINT room_inventory_items_room_id_standard_item_id_key
        UNIQUE (room_id, standard_item_id);
    END IF;
EXCEPTION WHEN duplicate_object THEN
    -- Constraint already exists, do nothing
    NULL;
END $$;

-- Step 5: Verify policies are working
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('rooms', 'standard_inventory_items', 'room_inventory_items', 'housekeeping_schedules', 'maintenance_schedules')
ORDER BY tablename, cmd;

-- Success message
SELECT '✅ RLS policies updated successfully!' as message;
