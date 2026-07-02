-- Performance indexes for common query patterns
-- Each index covers the WHERE clauses most used in the application.

-- appointments: busca por data (agenda dia/semana/mês) e por paciente
CREATE INDEX IF NOT EXISTS idx_appointments_date
  ON appointments (date)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_patient_date
  ON appointments (patient_id, date)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_status
  ON appointments (status)
  WHERE deleted_at IS NULL;

-- patients: listagem e verificação de soft-delete
CREATE INDEX IF NOT EXISTS idx_patients_deleted_at
  ON patients (deleted_at);

CREATE INDEX IF NOT EXISTS idx_patients_name
  ON patients (name)
  WHERE deleted_at IS NULL;

-- payments: filtros financeiros por status e vencimento
CREATE INDEX IF NOT EXISTS idx_payments_status_due
  ON payments (status, due_date)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_payments_patient
  ON payments (patient_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_payments_due_date
  ON payments (due_date)
  WHERE deleted_at IS NULL;

-- sessions: busca por paciente (ficha do paciente)
CREATE INDEX IF NOT EXISTS idx_sessions_patient
  ON sessions (patient_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sessions_date
  ON sessions (patient_id, date DESC)
  WHERE deleted_at IS NULL;

-- assessments: busca por paciente
CREATE INDEX IF NOT EXISTS idx_assessments_patient
  ON assessments (patient_id)
  WHERE deleted_at IS NULL;

-- goals: busca por paciente
CREATE INDEX IF NOT EXISTS idx_goals_patient
  ON goals (patient_id)
  WHERE deleted_at IS NULL;

-- reports: busca por paciente e status (aprovação, envio)
CREATE INDEX IF NOT EXISTS idx_reports_patient_status
  ON reports (patient_id, status);

-- job_runs: idempotência dos cron jobs
CREATE INDEX IF NOT EXISTS idx_job_runs_name_period
  ON job_runs (job_name, period_key);

-- audit_logs: consulta por entidade
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON audit_logs (entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_patient
  ON audit_logs (patient_id);
