-- BATCAVE RECURRING TASKS — Migration 007

-- Add recurrence to existing tasks table
ALTER TABLE batcave_tasks ADD COLUMN IF NOT EXISTS recurrence TEXT DEFAULT NULL; -- null, daily, weekly
ALTER TABLE batcave_tasks ADD COLUMN IF NOT EXISTS recurrence_group UUID DEFAULT NULL; -- links recurring instances
