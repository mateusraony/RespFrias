create table if not exists clinical_files (
  id                   uuid primary key default uuid_generate_v4(),
  patient_id           uuid not null references patients(id),
  diagnosis_detail     text,
  history              text,
  current_medications  text,
  allergies            text,
  precautions          text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create unique index if not exists clinical_files_patient_idx on clinical_files (patient_id);

create trigger clinical_files_updated_at
  before update on clinical_files
  for each row execute function set_updated_at();
