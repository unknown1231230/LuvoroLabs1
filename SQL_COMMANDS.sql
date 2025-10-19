-- Add this to your Supabase SQL Editor to create the site_metrics table
    CREATE TABLE site_metrics (
      metric_name TEXT PRIMARY KEY,
      value INT DEFAULT 0,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Insert an initial value for 'students_helped'
    INSERT INTO site_metrics (metric_name, value) VALUES ('students_helped', 1234) ON CONFLICT (metric_name) DO NOTHING;

    -- Example 'streaks' table schema (if not already created):
    -- CREATE TABLE streaks (
    --   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    --   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    --   current_streak INT DEFAULT 0,
    --   last_active_date DATE,
    --   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    -- );
    --
    -- Example 'achievements' table schema (if not already created):
    -- CREATE TABLE achievements (
    --   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    --   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    --   achievement_name TEXT NOT NULL,
    --   description TEXT,
    --   unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    -- );