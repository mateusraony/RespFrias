-- Agendamentos fictícios para o paciente de teste — NÃO usar em produção
do $$
declare
  p_id uuid := 'a1b2c3d4-0000-0000-0000-000000000001';
begin
  insert into appointments (id, patient_id, date, time, duration_minutes, status, notes)
  values
    ('a1b2c3d4-0000-0000-0000-000000000020', p_id, current_date + 2, '09:00', 45, 'confirmed', 'Sessão completa de manutenção'),
    ('a1b2c3d4-0000-0000-0000-000000000021', p_id, current_date + 9, '09:00', 45, 'pending', null),
    ('a1b2c3d4-0000-0000-0000-000000000022', p_id, current_date - 7, '09:00', 45, 'done', null)
  on conflict (id) do nothing;
end $$;
