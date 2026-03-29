create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

alter table profiles add column if not exists full_name text;
alter table profiles add column if not exists phone text;

create unique index if not exists profiles_phone_unique_normalized
on profiles ((regexp_replace(phone, '\\D', '', 'g')))
where phone is not null and btrim(phone) <> '';

do $$
begin
  if not exists (select 1 from pg_type where typname = 'trade_result') then
    create type trade_result as enum ('hit', 'sl', 'open');
  end if;
end $$;

create table if not exists trades (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  entry_price numeric not null,
  target numeric not null,
  target_1 numeric,
  target_2 numeric,
  target_3 numeric,
  stop_loss numeric not null,
  result trade_result not null,
  points numeric not null,
  notes text,
  screenshot_url text,
  created_at timestamptz default now()
);

alter table trades add column if not exists target_1 numeric;
alter table trades add column if not exists target_2 numeric;
alter table trades add column if not exists target_3 numeric;

create table if not exists monthly_summaries (
  id uuid primary key default gen_random_uuid(),
  month text unique not null,
  summary_text text,
  created_at timestamptz default now()
);

create table if not exists site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

create table if not exists content_blocks (
  id uuid primary key default gen_random_uuid(),
  block_key text unique not null,
  content_html text not null,
  updated_at timestamptz default now()
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'market_bias') then
    create type market_bias as enum ('bullish', 'bearish', 'sideways');
  end if;

  if not exists (select 1 from pg_type where typname = 'live_trade_status') then
    create type live_trade_status as enum ('pending', 'live', 'target_hit', 'sl_hit', 'closed');
  end if;

  if not exists (select 1 from pg_type where typname = 'message_type') then
    create type message_type as enum ('info', 'success', 'warning', 'celebration');
  end if;
end $$;

create table if not exists daily_analysis (
  id uuid primary key default gen_random_uuid(),
  date date unique not null,
  title text not null,
  content_html text not null,
  market_bias market_bias not null default 'sideways',
  key_levels text not null,
  posted_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists live_trades (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  instrument text not null,
  trade_type text not null,
  entry_price numeric not null,
  target_price numeric not null,
  stop_loss numeric not null,
  current_price numeric,
  status live_trade_status not null default 'pending',
  points_result numeric,
  admin_message text,
  message_type message_type,
  posted_at timestamptz default now(),
  updated_at timestamptz default now(),
  closed_at timestamptz
);

create table if not exists trade_reactions (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid references live_trades(id) on delete cascade,
  reaction_type text not null,
  message text not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table trades enable row level security;
alter table monthly_summaries enable row level security;
alter table site_settings enable row level security;
alter table content_blocks enable row level security;
alter table daily_analysis enable row level security;
alter table live_trades enable row level security;
alter table trade_reactions enable row level security;

drop policy if exists "public can read trades" on trades;
create policy "public can read trades" on trades for select using (true);

drop policy if exists "public can read monthly" on monthly_summaries;
create policy "public can read monthly" on monthly_summaries for select using (true);

drop policy if exists "public can read settings" on site_settings;
create policy "public can read settings" on site_settings for select using (true);

drop policy if exists "public can read blocks" on content_blocks;
create policy "public can read blocks" on content_blocks for select using (true);

drop policy if exists "public can read analysis" on daily_analysis;
create policy "public can read analysis" on daily_analysis for select using (true);

drop policy if exists "public can read live trades" on live_trades;
create policy "public can read live trades" on live_trades for select using (true);

drop policy if exists "public can read reactions" on trade_reactions;
create policy "public can read reactions" on trade_reactions for select using (true);

drop policy if exists "admins full profiles" on profiles;
create policy "admins full profiles" on profiles for all to authenticated using (
  coalesce(auth.jwt()->'app_metadata'->>'is_admin', 'false') = 'true'
  or lower(coalesce(auth.jwt()->>'email', '')) = 'junctionking29@gmail.com'
) with check (
  coalesce(auth.jwt()->'app_metadata'->>'is_admin', 'false') = 'true'
  or lower(coalesce(auth.jwt()->>'email', '')) = 'junctionking29@gmail.com'
);

drop policy if exists "users read own profile" on profiles;
create policy "users read own profile"
on profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "users insert own profile" on profiles;
create policy "users insert own profile"
on profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
  and (
    coalesce(is_admin, false) = false
    or lower(coalesce(auth.jwt()->>'email', '')) = 'junctionking29@gmail.com'
  )
);

drop policy if exists "users update own profile" on profiles;
create policy "users update own profile"
on profiles
for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
  and (
    coalesce(is_admin, false) = false
    or lower(coalesce(auth.jwt()->>'email', '')) = 'junctionking29@gmail.com'
  )
);

drop policy if exists "admins full trades" on trades;
create policy "admins full trades" on trades for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
);

drop policy if exists "admins full monthly" on monthly_summaries;
create policy "admins full monthly" on monthly_summaries for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
);

drop policy if exists "admins full settings" on site_settings;
create policy "admins full settings" on site_settings for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
);

drop policy if exists "admins full blocks" on content_blocks;
create policy "admins full blocks" on content_blocks for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
);

drop policy if exists "admins full analysis" on daily_analysis;
create policy "admins full analysis" on daily_analysis for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
);

drop policy if exists "admins full live trades" on live_trades;
create policy "admins full live trades" on live_trades for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
);

drop policy if exists "admins full reactions" on trade_reactions;
create policy "admins full reactions" on trade_reactions for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
);

insert into storage.buckets (id, name, public)
values ('trade-screenshots', 'trade-screenshots', false)
on conflict (id) do nothing;

drop policy if exists "admins can upload screenshots" on storage.objects;
create policy "admins can upload screenshots"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'trade-screenshots'
  and exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
);

drop policy if exists "admins can select screenshots" on storage.objects;
create policy "admins can select screenshots"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'trade-screenshots'
  and exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
);

insert into site_settings (key, value)
values
  ('notice_text', 'New trade call posted - NIFTY 22,150 -> 22,420'),
  ('telegram_url', 'https://t.me/example'),
  ('whatsapp_url', 'https://chat.whatsapp.com/example'),
  ('total_calls', '0'),
  ('win_rate', '0'),
  ('avg_monthly_return', '0'),
  ('hero_text', 'We trade like institutions. Proof every single day.'),
  ('about_text', 'Process-driven and transparent trade execution.'),
  ('how_we_trade_text', 'Plan, execute, and review with discipline.'),
  ('home_alerts_html', '<p><strong>Offer:</strong> Join now and get free weekly review sessions.</p>'),
  ('home_offer_url', '/community'),
  ('home_section_order', 'announcements,alerts,todays-trades,about,community-cta,all-pages'),
  ('template_nifty_target', '60'),
  ('template_nifty_sl', '35'),
  ('template_banknifty_target', '150'),
  ('template_banknifty_sl', '90'),
  ('template_finnifty_target', '45'),
  ('template_finnifty_sl', '25')
on conflict (key) do nothing;
