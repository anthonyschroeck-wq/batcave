-- Batcave Events Table
-- Run this in the Supabase SQL Editor

create table batcave_events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  start_date date not null,
  end_date date,
  all_day boolean default true,
  start_time time,
  end_time time,
  category text default 'personal' check (category in ('personal', 'professional', 'travel', 'health', 'project')),
  location text,
  notes text,
  color text,
  source text default 'batcave' check (source in ('batcave', 'gcal', 'outlook')),
  external_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references auth.users(id)
);

alter table batcave_events enable row level security;

create policy "Authenticated users can read events"
  on batcave_events for select to authenticated using (true);

create policy "Authenticated users can insert events"
  on batcave_events for insert to authenticated with check (true);

create policy "Authenticated users can update events"
  on batcave_events for update to authenticated using (true);

create policy "Authenticated users can delete events"
  on batcave_events for delete to authenticated using (true);

create index idx_events_dates on batcave_events(start_date, end_date);
create index idx_events_category on batcave_events(category);

create trigger events_updated_at
  before update on batcave_events
  for each row execute function update_updated_at();

-- Seed: Tony's trips
insert into batcave_events (title, start_date, end_date, category, location) values
  ('Seattle trip', '2026-03-16', '2026-03-18', 'travel', 'Seattle, WA'),
  ('NYC trip', '2026-03-19', '2026-03-21', 'travel', 'New York, NY');
