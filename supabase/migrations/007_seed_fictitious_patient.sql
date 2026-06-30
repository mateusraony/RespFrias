-- Paciente fictício para testes — NÃO usar em produção
do $$
declare
  p_id uuid := 'a1b2c3d4-0000-0000-0000-000000000001';
  cf_id uuid := 'a1b2c3d4-0000-0000-0000-000000000002';
  s1_id uuid := 'a1b2c3d4-0000-0000-0000-000000000010';
  s2_id uuid := 'a1b2c3d4-0000-0000-0000-000000000011';
  s3_id uuid := 'a1b2c3d4-0000-0000-0000-000000000012';
  s4_id uuid := 'a1b2c3d4-0000-0000-0000-000000000013';
  s5_id uuid := 'a1b2c3d4-0000-0000-0000-000000000014';
begin
  -- Paciente
  insert into patients (id, name, email, phone, birth_date, diagnosis, notes, is_fictitious)
  values (p_id, 'Ana Paula da Silva (Teste)', 'ana.teste@exemplo.com', '(11) 99999-0001',
          '1975-03-15', 'DPOC moderada',
          'Paciente fictício criado para demonstração e testes do sistema. Não representa dados reais.',
          true)
  on conflict (id) do nothing;

  -- Ficha clínica
  insert into clinical_files (id, patient_id, diagnosis_detail, history, current_medications, allergies, precautions)
  values (cf_id, p_id,
    'DPOC moderada — GOLD II. VEF1/CVF < 0.70, VEF1 50-80% do previsto.',
    'Tabagismo por 20 anos (cessou há 5 anos). Internação por exacerbação em 2022.',
    'Brometo de tiotrópio 18mcg/dia, Salbutamol 100mcg se necessário.',
    'Dipirona (reação cutânea leve).',
    'Evitar exercícios de alta intensidade sem monitoramento de SpO₂. Parar se SpO₂ < 88%.')
  on conflict (id) do nothing;

  -- Avaliação inicial
  insert into assessments (patient_id, assessment_type, date, spo2, borg, respiratory_rate, heart_rate, mrc_scale, six_mwt_distance, notes)
  values (p_id, 'initial', current_date - 60,
    93.0, 4.0, 22, 88, 2, 320,
    'Paciente com limitação moderada ao esforço. Dispneia aos esforços leves.')
  on conflict do nothing;

  -- Sessão 1 — finalizada
  insert into sessions (id, patient_id, session_type, date, duration_minutes,
    spo2_before, spo2_after, borg_before, borg_after,
    respiratory_rate_before, respiratory_rate_after,
    heart_rate_before, heart_rate_after,
    techniques_used, notes, evolution_draft, evolution_final, evolution_finalized_at)
  values (s1_id, p_id, 'full', current_date - 40, 45,
    91, 93, 5, 3, 24, 20, 92, 85,
    array['Respiração diafragmática', 'Pursed lip breathing', 'Ciclo ativo de técnicas respiratórias'],
    'Boa adesão. Paciente motivada.',
    null,
    'Paciente Ana Paula da Silva realizou sessão completa de fisioterapia respiratória em ' || to_char(current_date - 40, 'DD/MM/YYYY') || '. SpO₂: 91% → 93% | Borg: 5 → 3 | FR: 24 → 20 irpm | FC: 92 → 85 bpm. Técnicas: Respiração diafragmática, Pursed lip breathing, Ciclo ativo de técnicas respiratórias. Evolução satisfatória com melhora dos parâmetros após sessão. Conduta: manter protocolo atual.',
    now() - interval '39 days')
  on conflict (id) do nothing;

  -- Sessão 2 — finalizada
  insert into sessions (id, patient_id, session_type, date, duration_minutes,
    spo2_before, spo2_after, borg_before, borg_after,
    respiratory_rate_before, respiratory_rate_after,
    heart_rate_before, heart_rate_after,
    techniques_used, notes, evolution_draft, evolution_final, evolution_finalized_at)
  values (s2_id, p_id, 'full', current_date - 33, 45,
    92, 94, 4, 2, 22, 18, 90, 82,
    array['Respiração diafragmática', 'Exercícios resistidos de membros superiores'],
    'Relata melhora da disposição no dia a dia.',
    null,
    'Paciente Ana Paula da Silva realizou sessão completa em ' || to_char(current_date - 33, 'DD/MM/YYYY') || '. SpO₂: 92% → 94% | Borg: 4 → 2 | FR: 22 → 18 irpm. Melhora progressiva. Iniciado treino de membros superiores com resistência leve. Conduta: progredir carga gradualmente.',
    now() - interval '32 days')
  on conflict (id) do nothing;

  -- Sessão 3 — finalizada
  insert into sessions (id, patient_id, session_type, date, duration_minutes,
    spo2_before, spo2_after, borg_before, borg_after,
    respiratory_rate_before, respiratory_rate_after,
    heart_rate_before, heart_rate_after,
    techniques_used, notes, evolution_draft, evolution_final, evolution_finalized_at)
  values (s3_id, p_id, 'quick', current_date - 26, 30,
    93, 95, 3, 2, 20, 17, 86, 80,
    array['Pursed lip breathing', 'Técnica de huffing'],
    'Sessão de manutenção. Paciente estável.',
    null,
    'Sessão rápida de manutenção em ' || to_char(current_date - 26, 'DD/MM/YYYY') || '. SpO₂: 93% → 95% | Borg: 3 → 2. Paciente estável, técnicas de limpeza brônquica realizadas.',
    now() - interval '25 days')
  on conflict (id) do nothing;

  -- Sessão 4 — finalizada
  insert into sessions (id, patient_id, session_type, date, duration_minutes,
    spo2_before, spo2_after, borg_before, borg_after,
    respiratory_rate_before, respiratory_rate_after,
    heart_rate_before, heart_rate_after,
    techniques_used, notes, evolution_draft, evolution_final, evolution_finalized_at)
  values (s4_id, p_id, 'full', current_date - 19, 45,
    94, 95, 3, 2, 19, 16, 84, 78,
    array['Respiração diafragmática', 'Caminhada supervisionada 10 min', 'Exercícios resistidos MMSS'],
    'Introduzida caminhada supervisionada. Paciente tolerou bem.',
    null,
    'Sessão completa em ' || to_char(current_date - 19, 'DD/MM/YYYY') || '. SpO₂: 94% → 95% | Borg: 3 → 2 | FR: 19 → 16 irpm. Iniciada caminhada supervisionada de 10 minutos com boa tolerância. Progressão mantida.',
    now() - interval '18 days')
  on conflict (id) do nothing;

  -- Sessão 5 — rascunho em aberto (não finalizada)
  insert into sessions (id, patient_id, session_type, date, duration_minutes,
    spo2_before, spo2_after, borg_before, borg_after,
    respiratory_rate_before, respiratory_rate_after,
    heart_rate_before, heart_rate_after,
    techniques_used, notes, evolution_draft)
  values (s5_id, p_id, 'full', current_date - 7, 45,
    95, 96, 2, 1, 18, 15, 82, 76,
    array['Respiração diafragmática', 'Caminhada supervisionada 15 min', 'Exercícios resistidos MMSS'],
    'Aumento do tempo de caminhada. Excelente tolerância.',
    'Paciente Ana Paula da Silva realizou sessão completa em ' || to_char(current_date - 7, 'DD/MM/YYYY') || '. SpO₂: 95% → 96% | Borg: 2 → 1 | FR: 18 → 15 irpm | FC: 82 → 76 bpm. Técnicas: Respiração diafragmática, Caminhada supervisionada 15 min, Exercícios resistidos MMSS. [RASCUNHO — edite e finalize]')
  on conflict (id) do nothing;

  -- Metas terapêuticas
  insert into goals (patient_id, description, target_date, status)
  values
    (p_id, 'Tolerar caminhada de 20 minutos sem pausa com SpO₂ > 90%', current_date + 30, 'active'),
    (p_id, 'Reduzir Borg de repouso para ≤ 1', current_date + 45, 'active')
  on conflict do nothing;
end $$;
