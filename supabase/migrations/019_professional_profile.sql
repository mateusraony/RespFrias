CREATE TABLE IF NOT EXISTS professional_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT 'Fisioterapeuta',
  title text NOT NULL DEFAULT 'Ft.',
  crf_number text,
  specialty text,
  phone text,
  email text,
  address text,
  city text,
  signature_line text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default row
INSERT INTO professional_profile (full_name, title, specialty)
VALUES ('Izabella Frias Loureiro', 'Ft.', 'Fisioterapia Respiratória')
ON CONFLICT DO NOTHING;
