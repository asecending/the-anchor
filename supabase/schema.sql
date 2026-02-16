-- Create daily_logs table
create table public.daily_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  anchor_therapy boolean default false,
  anchor_sobriety boolean default false,
  anchor_sleep boolean default false,
  anchor_movement boolean default false,
  mandate_exposure boolean default false,
  mandate_coursework boolean default false,
  mandate_interaction boolean default false,
  night_anchor_completed boolean default false,
  notes text,
  score integer check (score >= 0 and score <= 10),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- Create mulligans table
create table public.mulligans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  used_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reason text,
  remaining integer not null default 3,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create protocol_rules table
create table public.protocol_rules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  rule_id text not null, -- Maps to daily_logs columns or custom rules like 'youtube_limit'
  status text not null check (status in ('strict', 'relaxed', 'locked')),
  relaxation_level integer check (relaxation_level >= 1 and relaxation_level <= 10),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, rule_id)
);

-- Enable RLS
alter table public.daily_logs enable row level security;
alter table public.mulligans enable row level security;
alter table public.protocol_rules enable row level security;

-- Create policies for daily_logs
create policy "Users can view their own daily logs"
  on public.daily_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own daily logs"
  on public.daily_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own daily logs"
  on public.daily_logs for update
  using (auth.uid() = user_id);

-- Create policies for mulligans
create policy "Users can view their own mulligans"
  on public.mulligans for select
  using (auth.uid() = user_id);

create policy "Users can insert their own mulligans"
  on public.mulligans for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own mulligans"
  on public.mulligans for update
  using (auth.uid() = user_id);

-- Create policies for protocol_rules
create policy "Users can view their own protocol rules"
  on public.protocol_rules for select
  using (auth.uid() = user_id);

create policy "Users can insert their own protocol rules"
  on public.protocol_rules for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own protocol rules"
  on public.protocol_rules for update
  using (auth.uid() = user_id);

-- Function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for updated_at on daily_logs
create trigger handle_updated_at
  before update on public.daily_logs
  for each row
  execute procedure public.handle_updated_at();

-- Trigger for updated_at on protocol_rules
create trigger handle_updated_at_rules
  before update on public.protocol_rules
  for each row
  execute procedure public.handle_updated_at();
