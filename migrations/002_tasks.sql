-- Batcave Tasks Table
-- Run this in the Supabase SQL Editor

create table batcave_tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  due_date date,
  completed boolean default false,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references auth.users(id)
);

alter table batcave_tasks enable row level security;

create policy "Authenticated users can read tasks"
  on batcave_tasks for select to authenticated using (true);

create policy "Authenticated users can insert tasks"
  on batcave_tasks for insert to authenticated with check (true);

create policy "Authenticated users can update tasks"
  on batcave_tasks for update to authenticated using (true);

create policy "Authenticated users can delete tasks"
  on batcave_tasks for delete to authenticated using (true);

create index idx_tasks_due on batcave_tasks(due_date);
create index idx_tasks_priority on batcave_tasks(priority);

create trigger tasks_updated_at
  before update on batcave_tasks
  for each row execute function update_updated_at();

-- Seed initial tasks
insert into batcave_tasks (title, priority, due_date) values
  ('Do returns', 'medium', (date_trunc('week', current_date) + interval '4 days')::date),
  ('Refresh Dune base', 'low', (date_trunc('week', current_date) + interval '8 days')::date),
  ('Finish all active laundry', 'high', (date_trunc('week', current_date) + interval '7 days')::date);
