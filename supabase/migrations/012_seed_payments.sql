-- Pagamentos fictícios para o paciente de teste — NÃO usar em produção
do $$
declare
  p_id uuid := 'a1b2c3d4-0000-0000-0000-000000000001';
begin
  insert into payments (id, patient_id, amount, amount_paid, status, payment_method, due_date, paid_at, notes)
  values
    ('a1b2c3d4-0000-0000-0000-000000000030', p_id, 150.00, 150.00, 'paid', 'pix',
      current_date - 33, now() - interval '32 days', 'Sessão de ' || to_char(current_date - 33, 'DD/MM')),
    ('a1b2c3d4-0000-0000-0000-000000000031', p_id, 150.00, 150.00, 'paid', 'pix',
      current_date - 19, now() - interval '18 days', 'Sessão de ' || to_char(current_date - 19, 'DD/MM')),
    ('a1b2c3d4-0000-0000-0000-000000000032', p_id, 150.00, null, 'pending', null,
      current_date + 2, null, 'Sessão agendada')
  on conflict (id) do nothing;
end $$;
