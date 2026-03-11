-- BATCAVE WEIGHT TRACKING — Migration 008
CREATE TABLE IF NOT EXISTS batcave_weight_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  weight_lbs NUMERIC NOT NULL,
  notes TEXT,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE batcave_weight_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "weight_log_user" ON batcave_weight_log FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_weight_date ON batcave_weight_log(logged_date);
