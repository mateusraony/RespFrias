-- Enable Row Level Security on all clinical tables
-- The application connects via DATABASE_URL (service role) which bypasses RLS by default.
-- This blocks any direct database access from other roles/clients.

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_closes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_runs ENABLE ROW LEVEL SECURITY;

-- Allow full access to the postgres superuser/service role used by the app
-- (porsager/postgres connects as the DATABASE_URL role which has BYPASSRLS)
-- No additional policies needed for the service connection.
-- This ensures no anonymous or foreign connections can read clinical data.
