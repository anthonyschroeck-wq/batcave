-- ═══════════════════════════════════════════════════════════════
-- BATCAVE AGENTS SYSTEM — Migration 005
-- Tables: catalog, deployments, runs, goals, approvals
-- ═══════════════════════════════════════════════════════════════

-- Agent catalog — the template library
CREATE TABLE IF NOT EXISTS batcave_agent_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1, -- 1=observer, 2=advisor, 3=executor, 4=autonomous
  level_label TEXT NOT NULL DEFAULT 'observer',
  category TEXT NOT NULL DEFAULT 'general',
  integrations TEXT[] NOT NULL DEFAULT '{}', -- required integrations
  schedule_default TEXT, -- cron expression or null for on-demand only
  estimated_cost_cents INTEGER DEFAULT 0, -- per run
  config_schema JSONB DEFAULT '{}', -- what the user can configure
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Deployed agents — user's active agents
CREATE TABLE IF NOT EXISTS batcave_agent_deployments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  catalog_id TEXT NOT NULL REFERENCES batcave_agent_catalog(id),
  status TEXT NOT NULL DEFAULT 'active', -- active, paused, retired
  config JSONB DEFAULT '{}', -- user's config overrides
  schedule TEXT, -- cron expression or null
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  total_runs INTEGER DEFAULT 0,
  total_cost_cents NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE batcave_agent_deployments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_deployments_user" ON batcave_agent_deployments
  FOR ALL USING (auth.uid() = user_id);

-- Agent runs — execution history
CREATE TABLE IF NOT EXISTS batcave_agent_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deployment_id UUID NOT NULL REFERENCES batcave_agent_deployments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'running', -- running, completed, failed, pending_approval
  trigger_type TEXT NOT NULL DEFAULT 'manual', -- manual, cron, event
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  result JSONB, -- structured output
  summary TEXT, -- human-readable summary
  tokens_used INTEGER DEFAULT 0,
  cost_cents NUMERIC DEFAULT 0,
  error TEXT
);

ALTER TABLE batcave_agent_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_runs_user" ON batcave_agent_runs
  FOR ALL USING (auth.uid() = user_id);

-- Agent goals — trackable outcomes
CREATE TABLE IF NOT EXISTS batcave_agent_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deployment_id UUID NOT NULL REFERENCES batcave_agent_deployments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  target_value TEXT, -- "zero deploy errors", "< 5 min avg response", etc.
  current_value TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, met, missed, retired
  last_evaluated TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE batcave_agent_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_goals_user" ON batcave_agent_goals
  FOR ALL USING (auth.uid() = user_id);

-- Agent approvals — pending actions queue
CREATE TABLE IF NOT EXISTS batcave_agent_approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES batcave_agent_runs(id) ON DELETE CASCADE,
  deployment_id UUID NOT NULL REFERENCES batcave_agent_deployments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'create_task', 'send_email', 'merge_pr', etc.
  action_payload JSONB NOT NULL,
  description TEXT NOT NULL, -- human-readable "what this will do"
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, expired
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE batcave_agent_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_approvals_user" ON batcave_agent_approvals
  FOR ALL USING (auth.uid() = user_id);

-- Seed the agent catalog
INSERT INTO batcave_agent_catalog (id, name, description, level, level_label, category, integrations, schedule_default, estimated_cost_cents, config_schema) VALUES

-- Level 1: Observers
('deploy-health', 'Deploy Health Monitor', 
 'Watches all Vercel deployments across your projects. Reports build failures, error rates, and deploy frequency. Zero risk — just visibility.',
 1, 'observer', 'devops', '{"vercel"}', '0 9 * * *', 0,
 '{"notify_on_error": {"type": "boolean", "default": true, "label": "Alert on deploy errors"}}'),

('task-velocity', 'Task Velocity Tracker',
 'Tracks how fast tasks move from created to completed. Identifies bottlenecks, stale items, and your personal throughput patterns over time.',
 1, 'observer', 'productivity', '{"anthropic"}', '0 8 * * 1', 2,
 '{"lookback_days": {"type": "number", "default": 14, "label": "Days to analyze"}}'),

('repo-pulse', 'Repo Pulse',
 'Monitors commit frequency, branch health, and PR status across your GitHub repos. Surfaces repos that are going stale or have unmerged work.',
 1, 'observer', 'devops', '{"github"}', '0 9 * * *', 0,
 '{"repos": {"type": "array", "default": [], "label": "Repos to watch (empty = all)"}}'),

-- Level 2: Advisors
('weekly-review', 'Weekly Review Generator',
 'Every Monday, synthesizes your past week: tasks completed, events attended, deploys shipped, patterns noticed. Proposes focus areas for the week ahead.',
 2, 'advisor', 'productivity', '{"anthropic"}', '0 8 * * 1', 5,
 '{"include_projects": {"type": "boolean", "default": true, "label": "Include project status"}}'),

('meeting-prep', 'Meeting Prep Briefer',
 'Before each calendar event, assembles context: who you are meeting, relevant recent activity, talking points, and open items related to them.',
 2, 'advisor', 'productivity', '{"anthropic","gcal"}', NULL, 3,
 '{"prep_minutes_before": {"type": "number", "default": 30, "label": "Minutes before meeting to prepare"}}'),

('priority-rebalancer', 'Priority Rebalancer',
 'Analyzes your task queue against your calendar and deadlines. Suggests reprioritization when things shift — travel days, overloaded weeks, conflicts.',
 2, 'advisor', 'productivity', '{"anthropic"}', '0 7 * * *', 3,
 '{"auto_flag_overdue": {"type": "boolean", "default": true, "label": "Flag overdue tasks automatically"}}'),

-- Level 3: Executors
('inbox-triage', 'Inbox Triage',
 'Scans your inbox, categorizes by urgency, drafts replies for routine messages. You approve each draft before it sends. Learns your voice over time.',
 3, 'executor', 'communication', '{"anthropic","gmail"}', '0 8,13,17 * * *', 8,
 '{"max_drafts_per_run": {"type": "number", "default": 5, "label": "Max draft replies per run"}, "auto_archive_newsletters": {"type": "boolean", "default": false, "label": "Auto-archive newsletters"}}'),

('pr-reviewer', 'PR Review Summarizer',
 'Reviews open pull requests, summarizes changes, flags potential issues, and drafts review comments. You approve before posting.',
 3, 'executor', 'devops', '{"anthropic","github"}', NULL, 5,
 '{"review_depth": {"type": "string", "default": "standard", "label": "Review depth", "options": ["quick", "standard", "thorough"]}}'),

('follow-up-nudger', 'Follow-Up Nudger',
 'Tracks conversations that need follow-up. Drafts gentle nudge emails for threads that have gone quiet. You approve each send.',
 3, 'executor', 'communication', '{"anthropic","gmail"}', '0 10 * * 1,3,5', 4,
 '{"quiet_days_threshold": {"type": "number", "default": 3, "label": "Days of silence before nudge"}}')

ON CONFLICT (id) DO NOTHING;
