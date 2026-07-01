export const dynamic = 'force-dynamic'

import { CheckCircle, XCircle, AlertCircle, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import sql from '@/lib/db/client'

interface CheckItem {
  label: string
  ok: boolean
  detail?: string
  required: boolean
}

async function getChecks(): Promise<CheckItem[]> {
  const checks: CheckItem[] = []

  // 1. AUTH_ENABLED
  const authEnabled = process.env.AUTH_ENABLED === 'true'
  const hasPassword = !!process.env.APP_PASSWORD && process.env.APP_PASSWORD.length >= 8
  checks.push({
    label: 'Autenticação ativada (AUTH_ENABLED=true)',
    ok: authEnabled,
    detail: authEnabled ? 'Acesso protegido por senha.' : 'Qualquer pessoa pode acessar o sistema.',
    required: true,
  })
  checks.push({
    label: 'Senha configurada (APP_PASSWORD ≥ 8 chars)',
    ok: hasPassword,
    detail: hasPassword ? 'Senha definida.' : 'APP_PASSWORD vazia ou muito curta.',
    required: true,
  })

  // 2. Banco de dados
  let dbOk = false
  let dbDetail = 'Erro ao conectar.'
  try {
    await sql`SELECT 1`
    dbOk = true
    dbDetail = 'Conexão com o banco estabelecida.'
  } catch (e) {
    dbDetail = e instanceof Error ? e.message : 'Erro desconhecido.'
  }
  checks.push({ label: 'Banco de dados conectado', ok: dbOk, detail: dbDetail, required: true })

  // 3. Telegram
  const hasTelegram = !!process.env.TELEGRAM_BOT_TOKEN && !!process.env.TELEGRAM_CHAT_ID
  checks.push({
    label: 'Telegram configurado (BOT_TOKEN + CHAT_ID)',
    ok: hasTelegram,
    detail: hasTelegram ? 'Notificações ativas.' : 'Alertas via Telegram desativados.',
    required: false,
  })

  // 4. CRON_SECRET
  const hasCron = !!process.env.CRON_SECRET && process.env.CRON_SECRET.length >= 16
  checks.push({
    label: 'CRON_SECRET configurado (≥ 16 chars)',
    ok: hasCron,
    detail: hasCron ? 'Jobs protegidos.' : 'CRON_SECRET ausente ou muito curto.',
    required: false,
  })

  // 5. Último job executado
  let lastJobOk = false
  let lastJobDetail = 'Nenhum job executado ainda.'
  try {
    const rows = await sql`
      SELECT job_name, status, created_at FROM job_runs
      ORDER BY created_at DESC LIMIT 1
    `
    if (rows.length > 0) {
      const row = rows[0]
      const date = new Date(String(row.created_at)).toLocaleString('pt-BR')
      lastJobOk = row.status === 'success'
      lastJobDetail = `Último: ${row.job_name} — ${row.status} em ${date}`
    }
  } catch { lastJobDetail = 'Tabela job_runs não encontrada.' }
  checks.push({ label: 'Cron jobs executando', ok: lastJobOk, detail: lastJobDetail, required: false })

  // 6. DATABASE_URL presente
  checks.push({
    label: 'DATABASE_URL configurada',
    ok: !!process.env.DATABASE_URL,
    detail: process.env.DATABASE_URL ? 'Variável definida.' : 'DATABASE_URL ausente!',
    required: true,
  })

  return checks
}

export default async function ConfiguracoesPage() {
  const checks = await getChecks()
  const required = checks.filter((c) => c.required)
  const optional = checks.filter((c) => !c.required)
  const allRequiredOk = required.every((c) => c.ok)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Configurações</h1>
        <Badge variant={allRequiredOk ? 'success' : 'destructive'}>
          {allRequiredOk ? 'Sistema OK' : 'Atenção necessária'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" /> Checklist de Produção
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground mb-4">Itens obrigatórios</p>
          {required.map((c, i) => (
            <CheckRow key={i} item={c} />
          ))}
          <p className="text-xs text-muted-foreground mt-6 mb-4">Itens opcionais</p>
          {optional.map((c, i) => (
            <CheckRow key={i} item={c} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Endpoints de Cron Job</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-xs text-muted-foreground mb-3">
            Configure no <strong>cron-job.org</strong> com método POST e header{' '}
            <code className="bg-muted px-1 rounded text-xs">Authorization: Bearer CRON_SECRET</code>
          </p>
          {[
            { path: '/api/jobs/daily-summary', desc: 'Resumo diário de alertas', schedule: 'Todo dia 08:00' },
            { path: '/api/jobs/appointment-reminder', desc: 'Lembrete de agendamentos', schedule: 'Todo dia 07:00' },
            { path: '/api/jobs/monthly-close', desc: 'Fechamento mensal automático', schedule: '1º do mês 06:00' },
          ].map((job) => (
            <div key={job.path} className="flex flex-wrap items-start justify-between gap-2 rounded-md border p-3">
              <div>
                <code className="text-xs font-mono text-[#0d7ea8]">{job.path}</code>
                <p className="text-xs text-muted-foreground mt-0.5">{job.desc}</p>
              </div>
              <Badge variant="outline" className="text-xs">{job.schedule}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function CheckRow({ item }: { item: CheckItem }) {
  const Icon = item.ok ? CheckCircle : item.required ? XCircle : AlertCircle
  const color = item.ok ? 'text-emerald-600' : item.required ? 'text-red-600' : 'text-amber-500'

  return (
    <div className="flex items-start gap-3">
      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${color}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{item.label}</p>
        {item.detail && <p className="text-xs text-muted-foreground">{item.detail}</p>}
      </div>
    </div>
  )
}
