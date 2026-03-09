-- ═══════════════════════════════════════════════════════════════
-- BATCAVE FITNESS — Migration 006
-- Tables: goals, activity_log
-- ═══════════════════════════════════════════════════════════════

-- Fitness goals (e.g. "Run 5x per week", "30 min cardio daily")
CREATE TABLE IF NOT EXISTS batcave_fitness_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'cardio', -- cardio, strength, flexibility, nutrition, recovery
  target_type TEXT NOT NULL DEFAULT 'frequency', -- frequency, duration, distance
  target_value NUMERIC NOT NULL DEFAULT 1, -- e.g. 5 (times), 30 (minutes), 3 (miles)
  target_unit TEXT NOT NULL DEFAULT 'sessions', -- sessions, minutes, miles, km
  target_period TEXT NOT NULL DEFAULT 'week', -- day, week, month
  status TEXT NOT NULL DEFAULT 'active', -- active, paused, completed, retired
  streak_current INTEGER DEFAULT 0,
  streak_best INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE batcave_fitness_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fitness_goals_user" ON batcave_fitness_goals
  FOR ALL USING (auth.uid() = user_id);

-- Activity log (each logged workout/session)
CREATE TABLE IF NOT EXISTS batcave_fitness_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_id UUID REFERENCES batcave_fitness_goals(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL DEFAULT 'run', -- run, walk, cycle, swim, strength, yoga, other
  title TEXT, -- e.g. "Morning 5K", "Treadmill intervals"
  duration_minutes INTEGER, -- how long
  distance_miles NUMERIC, -- distance if applicable
  calories INTEGER,
  source TEXT DEFAULT 'manual', -- manual, strava, garmin
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE batcave_fitness_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fitness_log_user" ON batcave_fitness_log
  FOR ALL USING (auth.uid() = user_id);
