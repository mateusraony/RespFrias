CREATE TABLE IF NOT EXISTS job_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name      TEXT NOT NULL,
  period_key    TEXT NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('success', 'error', 'skipped')),
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_name, period_key)
);

CREATE INDEX IF NOT EXISTS job_runs_job_name_idx ON job_runs(job_name, created_at DESC);
