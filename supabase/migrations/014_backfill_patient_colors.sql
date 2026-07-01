-- Backfill colors for patients that still have the default blue (#3B82F6)
-- Assigns rotating colors from the palette based on creation order
WITH palette(idx, color) AS (
  VALUES
    (0, '#3B82F6'),
    (1, '#10B981'),
    (2, '#F59E0B'),
    (3, '#EF4444'),
    (4, '#8B5CF6'),
    (5, '#EC4899'),
    (6, '#06B6D4'),
    (7, '#84CC16'),
    (8, '#F97316'),
    (9, '#6366F1')
),
ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 AS rn
  FROM patients
  WHERE deleted_at IS NULL AND color = '#3B82F6'
)
UPDATE patients
SET color = p.color
FROM ranked r
JOIN palette p ON p.idx = (r.rn % 10)
WHERE patients.id = r.id;
