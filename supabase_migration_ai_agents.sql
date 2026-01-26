-- ============================================================================
-- ORBICITY - SUPABASE MIGRATION
-- AI Agents System Tables
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================================

-- =========================
-- AI AGENTS TABLES
-- =========================

-- Main AI Agents Table
CREATE TABLE IF NOT EXISTS ai_agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    name_ka TEXT, -- Georgian translation
    role TEXT NOT NULL, -- marketing_director, clawdbot, cowork, etc.
    description TEXT,
    description_ka TEXT,
    module TEXT NOT NULL, -- marketing, reservations, finance, logistics
    capabilities JSONB DEFAULT '[]'::jsonb,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role, module)
);

-- AI Agent Tasks Table (Weekly/Daily Tasks)
CREATE TABLE IF NOT EXISTS ai_agent_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_ka TEXT,
    description TEXT,
    description_ka TEXT,
    task_type TEXT NOT NULL, -- weekly, daily, one_time, recurring
    priority TEXT DEFAULT 'medium', -- low, medium, high, critical
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed, failed, cancelled
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    result JSONB,
    requires_approval BOOLEAN DEFAULT false,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Agent Plans Table (Monthly Marketing Plans)
CREATE TABLE IF NOT EXISTS ai_agent_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_ka TEXT,
    description TEXT,
    description_ka TEXT,
    plan_type TEXT NOT NULL, -- monthly, quarterly, yearly
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    content JSONB NOT NULL, -- Full plan content
    goals JSONB DEFAULT '[]'::jsonb, -- Plan goals
    budget DECIMAL(12,2),
    currency TEXT DEFAULT 'GEL',
    status TEXT DEFAULT 'draft', -- draft, pending_approval, approved, in_progress, completed
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Agent Execution Log
CREATE TABLE IF NOT EXISTS ai_agent_execution_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
    task_id UUID REFERENCES ai_agent_tasks(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- task_executed, plan_created, decision_made, etc.
    action_description TEXT,
    action_description_ka TEXT,
    input_data JSONB,
    output_data JSONB,
    status TEXT DEFAULT 'success', -- success, failed, partial
    error_message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Agent Permissions
CREATE TABLE IF NOT EXISTS ai_agent_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
    permission_type TEXT NOT NULL, -- create_content, send_message, modify_data, etc.
    resource TEXT, -- specific resource this applies to
    is_allowed BOOLEAN DEFAULT true,
    requires_confirmation BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_id, permission_type, resource)
);

-- AI Agent Conversations
CREATE TABLE IF NOT EXISTS ai_agent_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
    user_id TEXT,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {role, content, timestamp}
    status TEXT DEFAULT 'active', -- active, completed, archived
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- INDEXES FOR PERFORMANCE
-- =========================

CREATE INDEX IF NOT EXISTS idx_ai_agents_module ON ai_agents(module);
CREATE INDEX IF NOT EXISTS idx_ai_agents_role ON ai_agents(role);
CREATE INDEX IF NOT EXISTS idx_ai_agent_tasks_agent ON ai_agent_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_tasks_status ON ai_agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_ai_agent_tasks_due ON ai_agent_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_ai_agent_plans_agent ON ai_agent_plans(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_plans_period ON ai_agent_plans(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_ai_agent_log_agent ON ai_agent_execution_log(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_log_created ON ai_agent_execution_log(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_agent_permissions_agent ON ai_agent_permissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_conversations_agent ON ai_agent_conversations(agent_id);

-- =========================
-- ROW LEVEL SECURITY (RLS)
-- =========================

ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_execution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_conversations ENABLE ROW LEVEL SECURITY;

-- Allow public read for all
CREATE POLICY "Allow public read" ON ai_agents FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON ai_agent_tasks FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON ai_agent_plans FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON ai_agent_execution_log FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON ai_agent_permissions FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON ai_agent_conversations FOR SELECT USING (true);

-- Allow insert/update/delete
CREATE POLICY "Allow insert" ON ai_agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON ai_agent_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON ai_agent_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON ai_agent_execution_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON ai_agent_permissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON ai_agent_conversations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update" ON ai_agents FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON ai_agent_tasks FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON ai_agent_plans FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON ai_agent_permissions FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON ai_agent_conversations FOR UPDATE USING (true);

CREATE POLICY "Allow delete" ON ai_agents FOR DELETE USING (true);
CREATE POLICY "Allow delete" ON ai_agent_tasks FOR DELETE USING (true);
CREATE POLICY "Allow delete" ON ai_agent_plans FOR DELETE USING (true);
CREATE POLICY "Allow delete" ON ai_agent_permissions FOR DELETE USING (true);
CREATE POLICY "Allow delete" ON ai_agent_conversations FOR DELETE USING (true);

-- =========================
-- SEED DEFAULT AI AGENTS
-- =========================

INSERT INTO ai_agents (name, name_ka, role, description, description_ka, module, capabilities, is_active) VALUES
-- Marketing AI Director
(
    'Marketing AI Director',
    'მარკეტინგის AI დირექტორი',
    'marketing_director',
    'AI-powered marketing strategist that creates monthly plans, manages social media, and optimizes campaigns.',
    'AI მარკეტინგის სტრატეგი, რომელიც ქმნის თვიურ გეგმებს, მართავს სოციალურ მედიას და ოპტიმიზაციას უკეთებს კამპანიებს.',
    'marketing',
    '["create_monthly_plan", "analyze_metrics", "suggest_content", "optimize_campaigns", "manage_social_media", "generate_reports"]'::jsonb,
    true
),
-- ClawdBot - AI Assistant
(
    'ClawdBot',
    'კლაუდბოტი',
    'clawdbot',
    'Intelligent assistant powered by Claude AI for answering questions and providing insights across all modules.',
    'ინტელექტუალური ასისტენტი Claude AI-ის ბაზაზე, რომელიც პასუხობს კითხვებს და გვთავაზობს ინსაითებს ყველა მოდულში.',
    'marketing',
    '["answer_questions", "provide_insights", "analyze_data", "generate_content", "translate"]'::jsonb,
    true
),
-- Cowork AI Agent
(
    'Cowork',
    'კოვორკი',
    'cowork',
    'Collaborative AI agent that helps coordinate tasks between team members and modules.',
    'თანამშრომლობის AI აგენტი, რომელიც ეხმარება დავალებების კოორდინაციას გუნდის წევრებსა და მოდულებს შორის.',
    'marketing',
    '["coordinate_tasks", "schedule_meetings", "assign_work", "track_progress", "send_notifications"]'::jsonb,
    true
)
ON CONFLICT (role, module) DO UPDATE SET
    name = EXCLUDED.name,
    name_ka = EXCLUDED.name_ka,
    description = EXCLUDED.description,
    description_ka = EXCLUDED.description_ka,
    capabilities = EXCLUDED.capabilities,
    updated_at = NOW();

-- =========================
-- SEED DEFAULT PERMISSIONS
-- =========================

-- Get agent IDs and create permissions
DO $$
DECLARE
    marketing_director_id UUID;
    clawdbot_id UUID;
    cowork_id UUID;
BEGIN
    SELECT id INTO marketing_director_id FROM ai_agents WHERE role = 'marketing_director' AND module = 'marketing';
    SELECT id INTO clawdbot_id FROM ai_agents WHERE role = 'clawdbot' AND module = 'marketing';
    SELECT id INTO cowork_id FROM ai_agents WHERE role = 'cowork' AND module = 'marketing';

    -- Marketing Director permissions
    INSERT INTO ai_agent_permissions (agent_id, permission_type, resource, is_allowed, requires_confirmation) VALUES
    (marketing_director_id, 'create_content', 'social_media', true, true),
    (marketing_director_id, 'create_content', 'marketing_plan', true, true),
    (marketing_director_id, 'send_message', 'email', true, true),
    (marketing_director_id, 'modify_data', 'campaigns', true, true),
    (marketing_director_id, 'analyze_data', 'all', true, false)
    ON CONFLICT (agent_id, permission_type, resource) DO NOTHING;

    -- ClawdBot permissions
    INSERT INTO ai_agent_permissions (agent_id, permission_type, resource, is_allowed, requires_confirmation) VALUES
    (clawdbot_id, 'answer_questions', 'all', true, false),
    (clawdbot_id, 'analyze_data', 'all', true, false),
    (clawdbot_id, 'generate_content', 'suggestions', true, false)
    ON CONFLICT (agent_id, permission_type, resource) DO NOTHING;

    -- Cowork permissions
    INSERT INTO ai_agent_permissions (agent_id, permission_type, resource, is_allowed, requires_confirmation) VALUES
    (cowork_id, 'coordinate_tasks', 'all', true, false),
    (cowork_id, 'send_notifications', 'team', true, true),
    (cowork_id, 'assign_work', 'tasks', true, true)
    ON CONFLICT (agent_id, permission_type, resource) DO NOTHING;
END $$;

-- =========================
-- SAMPLE WEEKLY TASKS
-- =========================

DO $$
DECLARE
    marketing_director_id UUID;
BEGIN
    SELECT id INTO marketing_director_id FROM ai_agents WHERE role = 'marketing_director' AND module = 'marketing';

    INSERT INTO ai_agent_tasks (agent_id, title, title_ka, description, description_ka, task_type, priority, status, due_date, requires_approval) VALUES
    (marketing_director_id, 'Weekly Social Media Report', 'ყოველკვირეული სოციალური მედიის ანგარიში', 'Generate comprehensive report on social media performance for the week', 'შექმენით სოციალური მედიის ყოველკვირეული ანგარიში', 'weekly', 'high', 'pending', NOW() + INTERVAL '7 days', true),
    (marketing_director_id, 'Content Calendar Update', 'კონტენტის კალენდრის განახლება', 'Update content calendar for next week', 'განაახლეთ კონტენტის კალენდარი მომავალი კვირისთვის', 'weekly', 'medium', 'pending', NOW() + INTERVAL '5 days', true),
    (marketing_director_id, 'OTA Listing Optimization', 'OTA ჩამონათვლის ოპტიმიზაცია', 'Review and optimize OTA platform listings', 'გადახედეთ და ოპტიმიზაცია გაუკეთეთ OTA პლატფორმის ჩამონათვალს', 'weekly', 'high', 'pending', NOW() + INTERVAL '4 days', false)
    ON CONFLICT DO NOTHING;
END $$;

-- =========================
-- DONE!
-- =========================
-- Tables created:
-- - ai_agents
-- - ai_agent_tasks
-- - ai_agent_plans
-- - ai_agent_execution_log
-- - ai_agent_permissions
-- - ai_agent_conversations
--
-- Default agents seeded:
-- - Marketing AI Director
-- - ClawdBot
-- - Cowork
