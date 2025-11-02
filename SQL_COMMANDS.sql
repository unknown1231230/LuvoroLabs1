-- Create the site_metrics table
    CREATE TABLE site_metrics (
      metric_name TEXT PRIMARY KEY,
      value INT DEFAULT 0,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Insert an initial value for 'students_helped'
    INSERT INTO site_metrics (metric_name, value) VALUES ('students_helped', 1234) ON CONFLICT (metric_name) DO NOTHING;