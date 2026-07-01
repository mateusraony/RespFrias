create type goal_status as enum ('active', 'achieved', 'cancelled');

create table if not exists goals (
  id          uuid primary key default uuid_generate_v4(),
  patient_id  uuid not null references patients(id),
  description text not null,
  target_date date,
  status      goal_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index if not exists goals_patient_idx on goals (patient_id) where deleted_at is null;

create trigger goals_updated_at
  before update on goals
  for each row execute function set_updated_at();
