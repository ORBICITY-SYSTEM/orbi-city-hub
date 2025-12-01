-- Booking.com Butler AI Agent - Supabase Schema
-- Created: 2025-01-12

-- ============================================
-- Table 1: butler_tasks
-- Stores all AI-generated tasks awaiting approval
-- ============================================
CREATE TABLE IF NOT EXISTS butler_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Task metadata
  task_type VARCHAR(50) NOT NULL, -- 'review_response', 'pricing_update', 'campaign_create', 'facility_update'
  priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'completed'
  
  -- Task content
  title TEXT NOT NULL,
  description TEXT,
  ai_suggestion JSONB NOT NULL, -- AI-generated content (e.g., review response text, pricing changes)
  context JSONB, -- Additional context (e.g., review details, current metrics)
  
  -- Approval workflow
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Indexes for performance
  INDEX idx_butler_tasks_user_id (user_id),
  INDEX idx_butler_tasks_status (status),
  INDEX idx_butler_tasks_priority (priority),
  INDEX idx_butler_tasks_type (task_type),
  INDEX idx_butler_tasks_created_at (created_at DESC)
);

-- ============================================
-- Table 2: booking_reviews
-- Stores Booking.com reviews for tracking
-- ============================================
CREATE TABLE IF NOT EXISTS booking_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Review metadata
  booking_reservation_id VARCHAR(100), -- Booking.com reservation ID
  guest_name VARCHAR(255) NOT NULL,
  guest_country VARCHAR(100),
  
  -- Review content
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 10),
  comment TEXT,
  positive_comment TEXT,
  negative_comment TEXT,
  
  -- Review categories
  staff_rating DECIMAL(2,1),
  facilities_rating DECIMAL(2,1),
  cleanliness_rating DECIMAL(2,1),
  comfort_rating DECIMAL(2,1),
  value_rating DECIMAL(2,1),
  location_rating DECIMAL(2,1),
  
  -- Response tracking
  has_response BOOLEAN DEFAULT FALSE,
  response_text TEXT,
  response_sent_at TIMESTAMP WITH TIME ZONE,
  ai_generated_response TEXT,
  
  -- Timestamps
  review_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_booking_reviews_user_id (user_id),
  INDEX idx_booking_reviews_rating (rating),
  INDEX idx_booking_reviews_has_response (has_response),
  INDEX idx_booking_reviews_date (review_date DESC)
);

-- ============================================
-- Table 3: booking_metrics
-- Stores daily performance metrics from Booking.com
-- ============================================
CREATE TABLE IF NOT EXISTS booking_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Date tracking
  metric_date DATE NOT NULL,
  
  -- Performance metrics
  occupancy_rate DECIMAL(5,2), -- Percentage (0-100)
  total_bookings INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  average_daily_rate DECIMAL(10,2), -- ADR
  revenue_per_available_room DECIMAL(10,2), -- RevPAR
  
  -- Visibility metrics
  page_views INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2), -- Percentage
  search_ranking INTEGER,
  
  -- Review metrics
  review_score DECIMAL(2,1),
  total_reviews INTEGER DEFAULT 0,
  new_reviews_today INTEGER DEFAULT 0,
  
  -- Competitor comparison
  area_avg_occupancy DECIMAL(5,2),
  area_avg_review_score DECIMAL(2,1),
  page_views_vs_competitors DECIMAL(6,2), -- Percentage difference
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one record per user per date
  UNIQUE(user_id, metric_date),
  
  -- Indexes
  INDEX idx_booking_metrics_user_id (user_id),
  INDEX idx_booking_metrics_date (metric_date DESC)
);

-- ============================================
-- Table 4: butler_approvals
-- Audit log for all Butler actions
-- ============================================
CREATE TABLE IF NOT EXISTS butler_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES butler_tasks(id) ON DELETE CASCADE,
  
  -- Action details
  action VARCHAR(50) NOT NULL, -- 'approved', 'rejected', 'modified', 'completed'
  action_by INTEGER NOT NULL REFERENCES users(id),
  
  -- Changes tracking
  original_content JSONB,
  modified_content JSONB,
  notes TEXT,
  
  -- Impact tracking
  estimated_impact JSONB, -- e.g., {"revenue": "+3000-5000 GEL", "time_saved": "2 hours"}
  actual_impact JSONB, -- Measured after completion
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_butler_approvals_user_id (user_id),
  INDEX idx_butler_approvals_task_id (task_id),
  INDEX idx_butler_approvals_action (action),
  INDEX idx_butler_approvals_created_at (created_at DESC)
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE butler_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE butler_approvals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can view own butler_tasks"
  ON butler_tasks FOR SELECT
  USING (user_id = auth.uid()::integer);

CREATE POLICY "Users can view own booking_reviews"
  ON booking_reviews FOR SELECT
  USING (user_id = auth.uid()::integer);

CREATE POLICY "Users can view own booking_metrics"
  ON booking_metrics FOR SELECT
  USING (user_id = auth.uid()::integer);

CREATE POLICY "Users can view own butler_approvals"
  ON butler_approvals FOR SELECT
  USING (user_id = auth.uid()::integer);

-- Policy: Users can insert their own data
CREATE POLICY "Users can insert own butler_tasks"
  ON butler_tasks FOR INSERT
  WITH CHECK (user_id = auth.uid()::integer);

CREATE POLICY "Users can insert own booking_reviews"
  ON booking_reviews FOR INSERT
  WITH CHECK (user_id = auth.uid()::integer);

CREATE POLICY "Users can insert own booking_metrics"
  ON booking_metrics FOR INSERT
  WITH CHECK (user_id = auth.uid()::integer);

CREATE POLICY "Users can insert own butler_approvals"
  ON butler_approvals FOR INSERT
  WITH CHECK (user_id = auth.uid()::integer);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own butler_tasks"
  ON butler_tasks FOR UPDATE
  USING (user_id = auth.uid()::integer);

CREATE POLICY "Users can update own booking_reviews"
  ON booking_reviews FOR UPDATE
  USING (user_id = auth.uid()::integer);

CREATE POLICY "Users can update own booking_metrics"
  ON booking_metrics FOR UPDATE
  USING (user_id = auth.uid()::integer);

-- ============================================
-- Functions & Triggers
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_butler_tasks_updated_at
  BEFORE UPDATE ON butler_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_reviews_updated_at
  BEFORE UPDATE ON booking_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_metrics_updated_at
  BEFORE UPDATE ON booking_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sample Data (for testing)
-- ============================================

-- Insert sample metrics (user_id = 1, adjust as needed)
INSERT INTO booking_metrics (user_id, metric_date, occupancy_rate, total_bookings, total_revenue, review_score, total_reviews, page_views, area_avg_occupancy, area_avg_review_score, page_views_vs_competitors)
VALUES 
  (1, CURRENT_DATE, 32.5, 808, 333039, 8.4, 155, 1200, 45.0, 9.1, -72.0),
  (1, CURRENT_DATE - INTERVAL '1 day', 31.8, 805, 332000, 8.4, 153, 1150, 44.5, 9.1, -71.5);

-- Insert sample review (user_id = 1)
INSERT INTO booking_reviews (user_id, booking_reservation_id, guest_name, guest_country, rating, comment, negative_comment, staff_rating, facilities_rating, cleanliness_rating, comfort_rating, value_rating, location_rating, review_date, has_response)
VALUES 
  (1, '6112770363', 'Anna', 'Russia', 3.0, NULL, 'Very disgusting and dirty. Hair in bathroom. Bed linen turned over. Smells of dampness. Payment method questionable.', 2.5, 2.5, 2.5, 2.5, 5.0, 5.0, '2024-11-14', FALSE);

COMMENT ON TABLE butler_tasks IS 'AI-generated tasks awaiting approval (review responses, pricing updates, campaigns)';
COMMENT ON TABLE booking_reviews IS 'Booking.com guest reviews with AI response tracking';
COMMENT ON TABLE booking_metrics IS 'Daily performance metrics from Booking.com (occupancy, revenue, reviews)';
COMMENT ON TABLE butler_approvals IS 'Audit log for all Butler AI actions and approvals';
