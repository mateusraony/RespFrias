-- Pacotes de sessões pré-pagas por paciente
CREATE TABLE IF NOT EXISTS patient_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id),
  total_sessions int NOT NULL CHECK (total_sessions > 0),
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_packages_patient_id ON patient_packages(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_packages_active ON patient_packages(patient_id, active);
