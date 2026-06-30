create type payment_status as enum ('paid', 'pending', 'partial', 'agreement');

create table if not exists payments (
  id              uuid primary key default uuid_generate_v4(),
  patient_id      uuid not null references patients(id),
  session_id      uuid references sessions(id),
  amount          numeric(10,2) not null,
  amount_paid     numeric(10,2),
  status          payment_status not null default 'pending',
  payment_method  text,
  due_date        date,
  paid_at         timestamptz,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists payments_patient_idx on payments (patient_id, due_date desc);
create index if not exists payments_due_date_idx on payments (due_date);

create trigger payments_updated_at
  before update on payments
  for each row execute function set_updated_at();
