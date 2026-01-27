-- ============================================
-- CLAWDBOT UNIFIED AI SYSTEM
-- Supabase Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. ClawdBot Conversations (Memory)
-- One table for ALL conversations across all modules
CREATE TABLE IF NOT EXISTS clawdbot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- Optional: for multi-user support
    session_id TEXT NOT NULL, -- Browser session ID
    module TEXT NOT NULL CHECK (module IN ('general', 'marketing', 'reservations', 'finance', 'logistics')),
    messages JSONB DEFAULT '[]'::jsonb,
    -- Format: [{role: 'user'|'assistant'|'system', content: '...', timestamp: '...', action_id: 'uuid'}]
    context JSONB DEFAULT '{}'::jsonb,
    -- Current page, selected items, etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_clawdbot_conversations_session ON clawdbot_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_clawdbot_conversations_module ON clawdbot_conversations(module);
CREATE INDEX IF NOT EXISTS idx_clawdbot_conversations_active ON clawdbot_conversations(is_active) WHERE is_active = true;

-- 2. ClawdBot Actions (Queue + Log)
-- Every action ClawdBot wants to take goes here
CREATE TABLE IF NOT EXISTS clawdbot_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES clawdbot_conversations(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    -- Types: 'respond_review', 'update_price', 'send_message', 'generate_report', etc.
    action_data JSONB NOT NULL,
    -- Parameters for the action
    module TEXT NOT NULL CHECK (module IN ('marketing', 'reservations', 'finance', 'logistics')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'executing', 'completed', 'failed', 'cancelled')),
    risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    executed_at TIMESTAMPTZ,
    result JSONB,
    -- What happened after execution
    error TEXT,
    -- Error message if failed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for action management
CREATE INDEX IF NOT EXISTS idx_clawdbot_actions_conversation ON clawdbot_actions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_clawdbot_actions_status ON clawdbot_actions(status);
CREATE INDEX IF NOT EXISTS idx_clawdbot_actions_module ON clawdbot_actions(module);
CREATE INDEX IF NOT EXISTS idx_clawdbot_actions_pending ON clawdbot_actions(status) WHERE status = 'pending';

-- 3. ClawdBot Configuration
-- Per-module settings
CREATE TABLE IF NOT EXISTS clawdbot_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module TEXT UNIQUE NOT NULL CHECK (module IN ('general', 'marketing', 'reservations', 'finance', 'logistics')),
    enabled BOOLEAN DEFAULT true,
    auto_approve_risk_levels TEXT[] DEFAULT ARRAY['low'],
    -- Which risk levels can be auto-approved
    capabilities JSONB DEFAULT '[]'::jsonb,
    -- What actions this module can do
    system_prompt TEXT,
    -- Module-specific AI instructions
    personality JSONB DEFAULT '{}'::jsonb,
    -- Name, avatar, style for UI
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INSERT DEFAULT CONFIGURATION
-- ============================================

INSERT INTO clawdbot_config (module, enabled, auto_approve_risk_levels, capabilities, system_prompt, personality)
VALUES
(
    'general',
    true,
    ARRAY['low'],
    '["analyze_data", "generate_report", "answer_question", "coordinate_modules"]'::jsonb,
    'You are ClawdBot, the CEO AI for ORBICITY hotel management system. You coordinate all operations across Marketing, Reservations, Finance, and Logistics. You have full context of the business and can delegate tasks to module-specific operations. Be concise, professional, and action-oriented. When user asks for an action, format it as: [ACTION:action_type:{"param":"value"}]',
    '{"name": "ClawdBot CEO", "nameKa": "ClawdBot CEO", "avatar": "https://images.unsplash.com/photo-1676277791608-ac54525aa94d?w=200&h=200&fit=crop&crop=face", "color": "purple", "style": "Ex Machina"}'::jsonb
),
(
    'marketing',
    true,
    ARRAY['low'],
    '["analyze_reviews", "draft_review_response", "post_review_response", "generate_social_post", "publish_social_post", "create_ad_campaign", "analyze_competitors", "optimize_listing"]'::jsonb,
    'You are ClawdBot in Marketing mode. Focus on: OTA review responses, social media content, advertising campaigns, and competitor analysis. Available actions: analyze_reviews, draft_review_response, post_review_response, generate_social_post, publish_social_post, create_ad_campaign. Format actions as: [ACTION:action_type:{"param":"value"}]',
    '{"name": "Marketing AI", "nameKa": "მარკეტინგი AI", "avatar": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&h=200&fit=crop", "color": "cyan", "style": "Detroit"}'::jsonb
),
(
    'reservations',
    true,
    ARRAY['low'],
    '["check_availability", "suggest_price", "update_price", "block_dates", "unblock_dates", "send_guest_message", "analyze_bookings", "sync_calendars"]'::jsonb,
    'You are ClawdBot in Reservations mode. Focus on: booking management, pricing optimization, calendar sync, and guest communication. Available actions: check_availability, suggest_price, update_price, block_dates, send_guest_message. Format actions as: [ACTION:action_type:{"param":"value"}]',
    '{"name": "Reservations AI", "nameKa": "რეზერვაციები AI", "avatar": "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=200&h=200&fit=crop", "color": "green", "style": "Westworld"}'::jsonb
),
(
    'finance',
    true,
    ARRAY['low'],
    '["generate_report", "analyze_expenses", "analyze_revenue", "create_invoice", "forecast_revenue", "compare_periods"]'::jsonb,
    'You are ClawdBot in Finance mode. Focus on: revenue analysis, expense tracking, financial reports, and forecasting. Available actions: generate_report, analyze_expenses, analyze_revenue, create_invoice, forecast_revenue. Format actions as: [ACTION:action_type:{"param":"value"}]',
    '{"name": "Finance AI", "nameKa": "ფინანსები AI", "avatar": "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=200&h=200&fit=crop", "color": "amber", "style": "Cyberpunk"}'::jsonb
),
(
    'logistics',
    true,
    ARRAY['low'],
    '["check_inventory", "schedule_cleaning", "assign_task", "order_supplies", "check_maintenance", "update_room_status"]'::jsonb,
    'You are ClawdBot in Logistics mode. Focus on: housekeeping schedules, inventory management, maintenance tracking, and task assignment. Available actions: check_inventory, schedule_cleaning, assign_task, order_supplies, check_maintenance. Format actions as: [ACTION:action_type:{"param":"value"}]',
    '{"name": "Logistics AI", "nameKa": "ლოჯისტიკა AI", "avatar": "https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=200&h=200&fit=crop", "color": "indigo", "style": "I, Robot"}'::jsonb
)
ON CONFLICT (module) DO UPDATE SET
    capabilities = EXCLUDED.capabilities,
    system_prompt = EXCLUDED.system_prompt,
    personality = EXCLUDED.personality,
    updated_at = NOW();

-- ============================================
-- TRIGGER FOR AUTO-UPDATE updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_clawdbot_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS clawdbot_conversations_updated_at ON clawdbot_conversations;
CREATE TRIGGER clawdbot_conversations_updated_at
    BEFORE UPDATE ON clawdbot_conversations
    FOR EACH ROW EXECUTE FUNCTION update_clawdbot_updated_at();

DROP TRIGGER IF EXISTS clawdbot_config_updated_at ON clawdbot_config;
CREATE TRIGGER clawdbot_config_updated_at
    BEFORE UPDATE ON clawdbot_config
    FOR EACH ROW EXECUTE FUNCTION update_clawdbot_updated_at();

-- ============================================
-- RLS POLICIES (Enable Row Level Security)
-- ============================================

ALTER TABLE clawdbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clawdbot_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clawdbot_config ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (single-user system)
-- In production, restrict by user_id

CREATE POLICY "Allow all for clawdbot_conversations"
ON clawdbot_conversations FOR ALL
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for clawdbot_actions"
ON clawdbot_actions FOR ALL
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for clawdbot_config"
ON clawdbot_config FOR ALL
USING (true) WITH CHECK (true);

-- ============================================
-- DONE!
-- Tables created:
-- - clawdbot_conversations (memory)
-- - clawdbot_actions (queue + log)
-- - clawdbot_config (settings per module)
-- ============================================

SELECT 'ClawdBot tables created successfully!' as status;
