-- Performance indexes for common query patterns.
-- Only adds indexes not already created by earlier migrations.
-- Partial indexes (WHERE deleted_at IS NULL) only on tables that have that column:
--   patients, appointments, goals — YES
--   payments, sessions, assessments, reports, job_runs, audit_logs — NO

-- appointments (has deleted_at): date index already exists in 008;
-- add composite and status indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date
  ON appointments (patient_id, date)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_status
  ON appointments (status)
  WHERE deleted_at IS NULL;

-- patients (has deleted_at): deleted_at index already exists in 001;
-- add name search index
CREATE INDEX IF NOT EXISTS idx_patients_name
  ON patients (name)
  WHERE deleted_at IS NULL;

-- payments (no deleted_at column)
CREATE INDEX IF NOT EXISTS idx_payments_status_due
  ON payments (status, due_date);

CREATE INDEX IF NOT EXISTS idx_payments_patient
  ON payments (patient_id);

CREATE INDEX IF NOT EXISTS idx_payments_due_date
  ON payments (due_date);

-- sessions (no deleted_at column)
CREATE INDEX IF NOT EXISTS idx_sessions_patient
  ON sessions (patient_id);

CREATE INDEX IF NOT EXISTS idx_sessions_patient_date
  ON sessions (patient_id, date DESC);

-- assessments (no deleted_at column)
CREATE INDEX IF NOT EXISTS idx_assessments_patient
  ON assessments (patient_id);

-- reports (no deleted_at column)
CREATE INDEX IF NOT EXISTS idx_reports_patient_status
  ON reports (patient_id, status);

-- job_runs (no deleted_at column): idempotência dos cron jobs
CREATE INDEX IF NOT EXISTS idx_job_runs_name_period
  ON job_runs (job_name, period_key);

-- audit_logs (no deleted_at column)
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON audit_logs (entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_patient
  ON audit_logs (patient_id);
