-- Batcave Secrets Table
-- Run this in the Supabase SQL Editor for your new Batcave project

-- 1. Create the secrets table
create table batcave_secrets (
  id uuid default gen_random_uuid() primary key,
  service_id text not null unique,
  api_key text not null,
  label text,
  updated_at timestamp with time zone default now(),
  updated_by uuid references auth.users(id)
);

-- 2. Enable RLS
alter table batcave_secrets enable row level security;

-- 3. RLS policies: only authenticated users can read/write
create policy "Authenticated users can read secrets"
  on batcave_secrets for select
  to authenticated
  using (true);

create policy "Authenticated users can insert secrets"
  on batcave_secrets for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update secrets"
  on batcave_secrets for update
  to authenticated
  using (true);

create policy "Authenticated users can delete secrets"
  on batcave_secrets for delete
  to authenticated
  using (true);

-- 4. Index for fast lookup by service_id
create index idx_secrets_service on batcave_secrets(service_id);

-- 5. Auto-update timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger secrets_updated_at
  before update on batcave_secrets
  for each row execute function update_updated_at();
