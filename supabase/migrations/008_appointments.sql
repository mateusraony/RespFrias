create type appointment_status as enum ('confirmed', 'pending', 'cancelled', 'done');
create type google_sync_status as enum ('synced', 'failed', 'pending');

create table if not exists appointments (
  id                  uuid primary key default uuid_generate_v4(),
  patient_id          uuid not null references patients(id),
  date                date not null,
  time                time not null,
  duration_minutes    integer not null default 50,
  status              appointment_status not null default 'pending',
  notes               text,
  google_event_id     text,
  google_sync_status  google_sync_status,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);

create index if not exists appointments_date_idx on appointments (date) where deleted_at is null;
create index if not exists appointments_patient_idx on appointments (patient_id, date desc);

alter table sessions
  add constraint sessions_appointment_id_fkey
  foreign key (appointment_id) references appointments(id);

create trigger appointments_updated_at
  before update on appointments
  for each row execute function set_updated_at();
