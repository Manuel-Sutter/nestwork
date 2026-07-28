create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'sonstiges',
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  assignee_id uuid references users(id) on delete set null,
  created_by uuid not null references users(id),
  resolution_note text,
  due_at timestamptz,
  position double precision not null default 0,
  source text not null default 'manual'
    check (source in ('manual', 'voice')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tasks_status_idx on tasks (status, position);
create index if not exists tasks_assignee_idx on tasks (assignee_id);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  author_id uuid not null references users(id),
  body text not null,
  reply_to_id uuid references comments(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists comments_task_idx on comments (task_id, created_at);
create index if not exists comments_reply_to_idx on comments (reply_to_id);

create table if not exists comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references comments(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (comment_id, user_id, emoji)
);
create index if not exists comment_reactions_comment_idx on comment_reactions (comment_id);

create table if not exists task_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  actor_id uuid not null references users(id),
  action text not null,
  field text,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);
create index if not exists task_history_task_idx on task_history (task_id, created_at);

create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  created_by uuid not null references users(id),
  remind_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'cancelled')),
  last_sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists reminders_due_idx on reminders (status, remind_at);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx on push_subscriptions (user_id);
