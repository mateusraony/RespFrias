create type assessment_type as enum ('initial', 'periodic');

create table if not exists assessments (
  id                uuid primary key default uuid_generate_v4(),
  patient_id        uuid not null references patients(id),
  assessment_type   assessment_type not null default 'initial',
  date              date not null,
  spo2              numeric(5,1),
  borg              numeric(4,1),
  respiratory_rate  integer,
  heart_rate        integer,
  mrc_scale         integer check (mrc_scale between 0 and 5),
  six_mwt_distance  integer,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists assessments_patient_idx on assessments (patient_id, date desc);

create trigger assessments_updated_at
  before update on assessments
  for each row execute function set_updated_at();
