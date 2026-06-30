@AGENTS.md

# RespFrias — Regras do Projeto

Sistema de fisioterapia respiratória para uso pessoal.
Stack: Next.js + TypeScript + Tailwind + shadcn/ui + Nhost Postgres. Deploy: Render.

## Regras absolutas

1. **Não remover funcionalidades que já funcionam.**
2. **Trabalhar por fases (1→7).** Validar critérios de aceite antes de avançar.
3. **Nunca expor secrets no frontend.** `NEXT_PUBLIC_*` são os únicos vars permitidos no cliente.
4. **Nunca usar `SUPABASE_SERVICE_ROLE_KEY` no navegador.** Somente em Server Components e Route Handlers.
5. **Nunca expor `TELEGRAM_BOT_TOKEN` no navegador.** Enviar mensagens apenas via backend.
6. **Nunca expor credenciais do Google no navegador.** OAuth apenas no servidor.
7. **Não enviar relatório ao paciente sem aprovação manual.** Sempre gerar como draft, revisar, aprovar, confirmar.
8. **Não criar eventos duplicados no Google Calendar.** Verificar `google_event_id` antes de criar.
9. **Não executar cron job duplicado.** Verificar `job_name + period_key` em `job_runs`.
10. **Não salvar dados clínicos sensíveis em logs técnicos.**
11. **Não apagar dados clínicos definitivamente.** Usar `deleted_at` (soft delete).
12. **Arquitetura mobile-first obrigatória.** Botões grandes, layout responsivo, fácil de usar no celular.
13. **Usar linguagem simples na interface.** Evitar jargão técnico.
14. **Toda ação crítica deve ter confirmação do usuário.**
15. **Toda alteração crítica deve gerar registro de auditoria** (antes/depois, justificativa, data/hora).
16. **TypeScript obrigatório em todos os arquivos.**
17. **Usar Nhost Postgres como banco oficial.** Acesso via `postgres` (porsager) — SQL direto, sem ORM. `DATABASE_URL` é backend only.

## Variáveis de ambiente

| Variável | Onde usar |
|---|---|
| `DATABASE_URL` | **Backend apenas** |
| `AUTH_ENABLED` | Backend apenas |
| `APP_PASSWORD` | Backend apenas |
| `GOOGLE_CLIENT_ID` | Backend apenas |
| `GOOGLE_CLIENT_SECRET` | Backend apenas |
| `GOOGLE_REDIRECT_URI` | Backend apenas |
| `TELEGRAM_BOT_TOKEN` | **Backend apenas** |
| `CRON_SECRET` | Backend apenas |
| `APP_TIMEZONE` | Backend apenas (`America/Sao_Paulo`) |

## Fases do projeto

- **Fase 1** — Núcleo: pacientes, sessões, evolução, ficha clínica
- **Fase 2** — Agenda: dia/semana/mês, Google Calendar
- **Fase 3** — Financeiro: pagamentos, acordos, fechamento mensal, CSV
- **Fase 4** — Relatórios: PDF, gráficos, aprovação manual
- **Fase 5** — Alertas e Telegram: central de alertas, bot Telegram
- **Fase 6** — cron-job.org: endpoints `/api/jobs/*`, autenticados por `CRON_SECRET`
- **Fase 7** — Blindagem: AUTH_ENABLED, RLS, auditoria, backup, checklist produção

## Integração com serviços externos

- **Google Calendar:** RespFrias é a fonte principal. Google é espelho. Salvar `google_event_id`.
- **Telegram:** apenas envios via backend. Nunca expor token no cliente.
- **cron-job.org:** chamar endpoints `/api/jobs/*` com `Authorization: Bearer CRON_SECRET`.

## Auditoria

Registrar em tabela `audit_logs`:
- `entity_type` (patient, session, appointment, payment, report, financial_close)
- `entity_id`
- `patient_id` relacionado
- `action` (create, update, delete, reopen, finalize, send)
- `old_value` (JSON)
- `new_value` (JSON)
- `justification`
- `created_at`

Obrigatório para: edição de evolução finalizada, reabertura de fechamento mensal, exclusão lógica de paciente, envio de relatório.
