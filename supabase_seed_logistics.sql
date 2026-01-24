-- ORBI City Hub - Logistics Data Seed for Supabase
-- Run this in Supabase SQL Editor

-- 1. Create rooms table if not exists
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_number TEXT NOT NULL UNIQUE,
  building TEXT,
  floor INTEGER,
  room_type TEXT DEFAULT 'studio',
  status TEXT DEFAULT 'available',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create standard_inventory_items table if not exists
CREATE TABLE IF NOT EXISTS public.standard_inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL UNIQUE,
  category TEXT,
  default_quantity INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create room_inventory_items table if not exists
CREATE TABLE IF NOT EXISTS public.room_inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.standard_inventory_items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'ok',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, item_id)
);

-- 4. Create housekeeping_schedules table if not exists
CREATE TABLE IF NOT EXISTS public.housekeeping_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  assigned_to TEXT,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create maintenance_schedules table if not exists
CREATE TABLE IF NOT EXISTS public.maintenance_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  assigned_to TEXT,
  scheduled_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create logistics_activity_log table if not exists
CREATE TABLE IF NOT EXISTS public.logistics_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  description TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standard_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housekeeping_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_activity_log ENABLE ROW LEVEL SECURITY;

-- 8. Create policies for public read access
CREATE POLICY IF NOT EXISTS "Allow public read rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read standard_inventory_items" ON public.standard_inventory_items FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read room_inventory_items" ON public.room_inventory_items FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read housekeeping_schedules" ON public.housekeeping_schedules FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read maintenance_schedules" ON public.maintenance_schedules FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read logistics_activity_log" ON public.logistics_activity_log FOR SELECT USING (true);

-- 9. Create policies for authenticated users to write
CREATE POLICY IF NOT EXISTS "Allow authenticated insert rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated update rooms" ON public.rooms FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated insert standard_inventory_items" ON public.standard_inventory_items FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated update standard_inventory_items" ON public.standard_inventory_items FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated insert room_inventory_items" ON public.room_inventory_items FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated update room_inventory_items" ON public.room_inventory_items FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated insert housekeeping_schedules" ON public.housekeeping_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated update housekeeping_schedules" ON public.housekeeping_schedules FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated insert maintenance_schedules" ON public.maintenance_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated update maintenance_schedules" ON public.maintenance_schedules FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated insert logistics_activity_log" ON public.logistics_activity_log FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════
-- SEED DATA - 56 ROOMS
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO public.rooms (room_number, building, floor, room_type, status) VALUES
('A 1033', 'A', 10, 'studio', 'available'),
('A 1258', 'A', 12, 'studio', 'available'),
('A 1301', 'A', 13, 'studio', 'available'),
('A 1806', 'A', 18, 'studio', 'available'),
('A 1821', 'A', 18, 'studio', 'available'),
('A 1833', 'A', 18, 'studio', 'available'),
('A 2035', 'A', 20, 'studio', 'available'),
('A 2441', 'A', 24, 'studio', 'available'),
('A 3035', 'A', 30, 'studio', 'available'),
('A 3041', 'A', 30, 'studio', 'available'),
('A 4022', 'A', 40, 'studio', 'available'),
('A 4023', 'A', 40, 'studio', 'available'),
('A 4024', 'A', 40, 'studio', 'available'),
('A 4025', 'A', 40, 'studio', 'available'),
('A 4026', 'A', 40, 'studio', 'available'),
('A 4027', 'A', 40, 'studio', 'available'),
('A 4029', 'A', 40, 'studio', 'available'),
('A 4035', 'A', 40, 'studio', 'available'),
('C 1256', 'C', 12, 'studio', 'available'),
('C 2107', 'C', 21, 'studio', 'available'),
('C 2520', 'C', 25, 'studio', 'available'),
('C 2522', 'C', 25, 'studio', 'available'),
('C 2524', 'C', 25, 'studio', 'available'),
('C 2529', 'C', 25, 'studio', 'available'),
('C 2547', 'C', 25, 'studio', 'available'),
('C 2558', 'C', 25, 'studio', 'available'),
('C 2609', 'C', 26, 'studio', 'available'),
('C 2637', 'C', 26, 'studio', 'available'),
('C 2641', 'C', 26, 'studio', 'available'),
('C 2847', 'C', 28, 'studio', 'available'),
('C 2861', 'C', 28, 'studio', 'available'),
('C 2921', 'C', 29, 'studio', 'available'),
('C 2923', 'C', 29, 'studio', 'available'),
('C 2936', 'C', 29, 'studio', 'available'),
('C 2947', 'C', 29, 'studio', 'available'),
('C 2961', 'C', 29, 'studio', 'available'),
('C 3421', 'C', 34, 'studio', 'available'),
('C 3423', 'C', 34, 'studio', 'available'),
('C 3425', 'C', 34, 'studio', 'available'),
('C 3428', 'C', 34, 'studio', 'available'),
('C 3431', 'C', 34, 'studio', 'available'),
('C 3437', 'C', 34, 'studio', 'available'),
('C 3439', 'C', 34, 'studio', 'available'),
('C 3441', 'C', 34, 'studio', 'available'),
('C 3611', 'C', 36, 'studio', 'available'),
('C 3834', 'C', 38, 'studio', 'available'),
('C 3928', 'C', 39, 'studio', 'available'),
('C 3937', 'C', 39, 'studio', 'available'),
('C 4011', 'C', 40, 'studio', 'available'),
('C 4638', 'C', 46, 'studio', 'available'),
('C 4704', 'C', 47, 'studio', 'available'),
('C 4706', 'C', 47, 'studio', 'available'),
('D1 3414', 'D1', 34, 'studio', 'available'),
('D1 3416', 'D1', 34, 'studio', 'available'),
('D1 3418', 'D1', 34, 'studio', 'available'),
('D2 3727', 'D2', 37, 'studio', 'available')
ON CONFLICT (room_number) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- SEED DATA - STANDARD INVENTORY ITEMS
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO public.standard_inventory_items (item_name, category, default_quantity, is_required) VALUES
('აბაზანის სარკე', 'აბაზანის აქსესუარები', 1, true),
('ნაგვის ურნა', 'აბაზანის აქსესუარები', 1, true),
('ნიჟარა შემრევით', 'აბაზანის აქსესუარები', 1, true),
('საშხაპე დუშითა და შემრევით', 'აბაზანის აქსესუარები', 1, true),
('საშხაპის აქსესუარი', 'აბაზანის აქსესუარები', 1, true),
('ტუალეტის ქაღალდის საკიდი', 'აბაზანის აქსესუარები', 1, true),
('უნიტაზი', 'აბაზანის აქსესუარები', 1, true),
('უნიტაზის ჯაგრისი', 'აბაზანის აქსესუარები', 1, true),
('ფენი', 'აბაზანის აქსესუარები', 1, true),
('წყლის გამაცხელებელი', 'აბაზანის აქსესუარები', 1, true),
('ხის კალათა', 'აბაზანის აქსესუარები', 1, true),
('აივნის მაგიდა', 'ავეჯი და ტექსტილი', 1, true),
('აივნის სკამი', 'ავეჯი და ტექსტილი', 4, true),
('ბალიში (საწოლისთვის და დივნისთვის)', 'ავეჯი და ტექსტილი', 3, true),
('ბალიშის ჩიხოლი (საწოლისთვის და დივნისთვის)', 'ავეჯი და ტექსტილი', 3, true),
('დივანი გასაშლელი', 'ავეჯი და ტექსტილი', 1, true),
('ზეწარი (საწოლისთვის და დივნისთვის)', 'ავეჯი და ტექსტილი', 2, true)
ON CONFLICT (item_name) DO NOTHING;

-- Success message
SELECT 'Logistics data seeded successfully! 56 rooms and 17 inventory items created.' as message;
