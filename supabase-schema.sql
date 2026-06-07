-- ═══════════════════════════════════════════════
--  CHILL BUGS — Supabase Database Schema
--  Paste this into: Supabase Dashboard > SQL Editor
-- ═══════════════════════════════════════════════

-- Users table
create table if not exists users (
  id               uuid primary key default gen_random_uuid(),
  wallet_address   text unique,
  x_id             text unique not null,
  x_username       text not null,
  x_avatar_url     text,
  bug_points       integer not null default 0,
  streak_count     integer not null default 0,
  last_checkin     timestamptz,
  referral_code    text unique default 'BUG-' || upper(substr(md5(random()::text), 1, 8)),
  referred_by      text references users(referral_code),
  created_at       timestamptz not null default now()
);

-- Activity log table
create table if not exists activities (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references users(id) on delete cascade,
  type           text not null check (type in (
                   'daily_checkin',
                   'bug_catcher_game',
                   'lore_quiz',
                   'referral',
                   'share_x'
                 )),
  points_earned  integer not null default 0,
  created_at     timestamptz not null default now()
);

-- Indexes for leaderboard + lookups
create index if not exists idx_users_bug_points on users(bug_points desc);
create index if not exists idx_users_x_id on users(x_id);
create index if not exists idx_users_wallet on users(wallet_address);
create index if not exists idx_activities_user_id on activities(user_id);

-- Row Level Security
alter table users enable row level security;
alter table activities enable row level security;

-- Users can read all profiles (for leaderboard)
create policy "Public read users"
  on users for select using (true);

-- Users can only update their own row
create policy "Users update own row"
  on users for update using (auth.uid()::text = x_id);

-- Users can read their own activities
create policy "Users read own activities"
  on activities for select using (
    user_id = (select id from users where x_id = auth.uid()::text)
  );
