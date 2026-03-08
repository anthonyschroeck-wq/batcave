-- Batcave Usage Tracking + AI Briefs
-- Run this in the Supabase SQL Editor

-- Usage tracking table
create table batcave_usage (
  id uuid default gen_random_uuid() primary key,
  service text not null default 'anthropic',
  endpoint text,
  input_tokens integer default 0,
  output_tokens integer default 0,
  model text,
  cost_cents numeric(10,4) default 0,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

alter table batcave_usage enable row level security;

create policy "Authenticated users can read usage"
  on batcave_usage for select to authenticated using (true);

create policy "Service role can insert usage"
  on batcave_usage for insert to service_role with check (true);

-- Also allow authenticated insert (for serverless functions using user JWT)
create policy "Authenticated users can insert usage"
  on batcave_usage for insert to authenticated with check (true);

create index idx_usage_created on batcave_usage(created_at);
create index idx_usage_service on batcave_usage(service);

-- AI briefs table
create table batcave_briefs (
  id uuid default gen_random_uuid() primary key,
  brief_date date not null unique,
  content text not null,
  context_snapshot jsonb,
  tokens_used integer default 0,
  created_at timestamp with time zone default now()
);

alter table batcave_briefs enable row level security;

create policy "Authenticated users can read briefs"
  on batcave_briefs for select to authenticated using (true);

create policy "Authenticated users can insert briefs"
  on batcave_briefs for insert to authenticated with check (true);

create policy "Authenticated users can update briefs"
  on batcave_briefs for update to authenticated using (true);

create index idx_briefs_date on batcave_briefs(brief_date);
