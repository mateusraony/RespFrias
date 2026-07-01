create type session_type as enum ('quick', 'full');

create table if not exists sessions (
  id                          uuid primary key default uuid_generate_v4(),
  patient_id                  uuid not null references patients(id),
  appointment_id              uuid,
  session_type                session_type not null default 'full',
  date                        date not null,
  duration_minutes            integer,
  spo2_before                 numeric(5,1),
  spo2_after                  numeric(5,1),
  borg_before                 numeric(4,1),
  borg_after                  numeric(4,1),
  respiratory_rate_before     integer,
  respiratory_rate_after      integer,
  heart_rate_before           integer,
  heart_rate_after            integer,
  techniques_used             text[],
  notes                       text,
  evolution_draft             text,
  evolution_final             text,
  evolution_finalized_at      timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists sessions_patient_idx on sessions (patient_id, date desc);

create trigger sessions_updated_at
  before update on sessions
  for each row execute function set_updated_at();
