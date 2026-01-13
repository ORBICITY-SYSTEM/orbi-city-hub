-- Instagram Analytics Database Tables
-- Run this in Supabase SQL Editor

-- Daily Metrics
CREATE TABLE IF NOT EXISTS instagram_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  reach INTEGER DEFAULT 0,
  accounts_engaged INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  follows INTEGER DEFAULT 0,
  profile_links_taps INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  total_interactions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts
CREATE TABLE IF NOT EXISTS instagram_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_url TEXT UNIQUE NOT NULL,
  post_date DATE,
  created_time TIME,
  caption TEXT,
  likes INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  saved INTEGER DEFAULT 0,
  follows INTEGER DEFAULT 0,
  media_type TEXT,
  watch_time_ms INTEGER DEFAULT 0,
  theme TEXT,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Summary
CREATE TABLE IF NOT EXISTS instagram_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_frame TEXT,
  posts_count INTEGER DEFAULT 0,
  total_reach INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_saved INTEGER DEFAULT 0,
  total_follows INTEGER DEFAULT 0,
  avg_reach_per_post NUMERIC(10, 2) DEFAULT 0,
  engagement_rate NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weekly Stats
CREATE TABLE IF NOT EXISTS instagram_weekly_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_starting DATE UNIQUE NOT NULL,
  posts_count INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  saved INTEGER DEFAULT 0,
  follows INTEGER DEFAULT 0,
  avg_reach_per_post NUMERIC(10, 2) DEFAULT 0,
  engagement_rate NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_instagram_daily_metrics_date ON instagram_daily_metrics(date);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_post_date ON instagram_posts(post_date);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_post_url ON instagram_posts(post_url);
CREATE INDEX IF NOT EXISTS idx_instagram_weekly_stats_week_starting ON instagram_weekly_stats(week_starting);

-- Enable Row Level Security (RLS)
ALTER TABLE instagram_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_weekly_stats ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access (for now)
CREATE POLICY "Allow public read access" ON instagram_daily_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON instagram_posts FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON instagram_summary FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON instagram_weekly_stats FOR SELECT USING (true);

-- Allow service role to insert/update
CREATE POLICY "Allow service role insert" ON instagram_daily_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role update" ON instagram_daily_metrics FOR UPDATE USING (true);
CREATE POLICY "Allow service role insert" ON instagram_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role update" ON instagram_posts FOR UPDATE USING (true);
CREATE POLICY "Allow service role insert" ON instagram_summary FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role insert" ON instagram_weekly_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role update" ON instagram_weekly_stats FOR UPDATE USING (true);
