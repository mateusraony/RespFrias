CREATE TABLE IF NOT EXISTS login_attempts (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ip         text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_created
  ON login_attempts (ip, created_at DESC);
