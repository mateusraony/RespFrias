# Decisões de Arquitetura

## ADR-001 — Supabase como banco oficial

**Decisão:** Usar Supabase Postgres como única fonte de dados.
**Motivo:** Gratuito para uso pessoal, suporte a RLS, Storage integrado, SDK TypeScript.

## ADR-002 — RespFrias como fonte principal da agenda

**Decisão:** O RespFrias é a fonte principal. Google Calendar é espelho.
**Motivo:** Evitar perda de dados se Google falhar. `google_event_id` salvo localmente.

## ADR-003 — Soft delete obrigatório para dados clínicos

**Decisão:** Nunca deletar dados clínicos. Usar `deleted_at` timestamp.
**Motivo:** Rastreabilidade, LGPD, auditoria.

## ADR-004 — Aprovação manual obrigatória para envio de relatórios

**Decisão:** Sistema gera relatório como draft. Usuário revisa → aprova → confirma envio.
**Motivo:** Evitar envio acidental de informações incompletas ou incorretas ao paciente.

## ADR-005 — Telegram e Google apenas via backend

**Decisão:** Tokens nunca expostos no frontend.
**Motivo:** Segurança. Tokens no cliente podem ser extraídos pelo navegador.

## ADR-006 — cron-job.org para rotinas

**Decisão:** Usar cron-job.org chamando endpoints `/api/jobs/*` com `CRON_SECRET`.
**Motivo:** Render free tier duerme; cron-job.org é gratuito e mantém o app ativo.
