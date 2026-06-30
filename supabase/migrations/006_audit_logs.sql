create type audit_entity_type as enum (
  'patient', 'session', 'appointment', 'payment', 'report',
  'financial_close', 'clinical_file', 'assessment', 'goal'
);

create type audit_action as enum (
  'create', 'update', 'delete', 'reopen', 'finalize', 'send'
);

create table if not exists audit_logs (
  id           uuid primary key default uuid_generate_v4(),
  entity_type  audit_entity_type not null,
  entity_id    uuid not null,
  patient_id   uuid references patients(id),
  action       audit_action not null,
  old_value    jsonb,
  new_value    jsonb,
  justification text,
  created_at   timestamptz not null default now()
);

create index if not exists audit_logs_patient_idx on audit_logs (patient_id, created_at desc);
create index if not exists audit_logs_entity_idx on audit_logs (entity_type, entity_id, created_at desc);
