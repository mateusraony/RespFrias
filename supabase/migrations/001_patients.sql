create extension if not exists "uuid-ossp";

create table if not exists patients (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  email         text,
  phone         text,
  birth_date    date,
  diagnosis     text,
  notes         text,
  is_fictitious boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create index if not exists patients_name_idx on patients using gin(to_tsvector('portuguese', name));
create index if not exists patients_deleted_at_idx on patients (deleted_at) where deleted_at is null;

-- auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger patients_updated_at
  before update on patients
  for each row execute function set_updated_at();
