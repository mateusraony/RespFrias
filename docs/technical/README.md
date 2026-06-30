# Documentação Técnica

## Stack

| Tecnologia | Uso |
|---|---|
| Next.js (App Router) | Framework principal |
| TypeScript | Linguagem obrigatória |
| Tailwind CSS | Estilização |
| shadcn/ui | Componentes UI |
| Supabase Postgres | Banco de dados |
| Supabase Storage | Arquivos/anexos |
| Render | Hospedagem |
| GitHub | Versionamento |
| Google Calendar API | Integração de agenda |
| Telegram Bot API | Alertas via bot |
| cron-job.org | Rotinas programadas |
| Recharts | Gráficos |

## Supabase

- `src/lib/supabase/client.ts` — uso no navegador (somente `NEXT_PUBLIC_*`)
- `src/lib/supabase/server.ts` — uso no servidor (pode usar `SUPABASE_SERVICE_ROLE_KEY`)

## Variáveis de ambiente

Ver `.env.example` na raiz do projeto.

## Fases

Ver `CLAUDE.md` na raiz.
