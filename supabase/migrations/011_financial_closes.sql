create table if not exists financial_closes (
  id            uuid primary key default uuid_generate_v4(),
  period_key    text not null unique, -- formato 'YYYY-MM'
  total_expected numeric(10,2) not null default 0,
  total_received numeric(10,2) not null default 0,
  closed_at     timestamptz not null default now(),
  reopened_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger financial_closes_updated_at
  before update on financial_closes
  for each row execute function set_updated_at();
