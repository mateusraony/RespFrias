export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Bell, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { generateAlerts } from '@/app/actions/alerts'
import { SendTelegramButton } from '@/components/alertas/send-telegram-button'
import type { PatientAlert } from '@/types'

const PRIORITY_CONFIG = {
  high: {
    label: 'Alta',
    variant: 'destructive' as const,
    Icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
  },
  medium: {
    label: 'Média',
    variant: 'warning' as const,
    Icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
  },
  low: {
    label: 'Baixa',
    variant: 'secondary' as const,
    Icon: Info,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
  },
}

const TYPE_LABEL: Record<string, string> = {
  financial: 'Financeiro',
  clinical: 'Clínico',
  technical: 'Técnico',
}

function AlertCard({ alert }: { alert: PatientAlert }) {
  const cfg = PRIORITY_CONFIG[alert.priority]
  const Icon = cfg.Icon

  return (
    <Card className={`border ${cfg.bg}`}>
      <CardContent className="flex items-start gap-3 p-4">
        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${cfg.color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-medium text-sm">{alert.patient_name}</p>
            <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
            <Badge variant="outline" className="text-xs">{TYPE_LABEL[alert.type] ?? alert.type}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{alert.reason}</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link href={`/pacientes/${alert.patient_id}${
            alert.type === 'financial' ? '?tab=pagamentos'
            : alert.reason.toLowerCase().includes('avalia') ? '?tab=avaliacoes'
            : '?tab=sessoes'
          }`}>
            Ver
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default async function AlertasPage() {
  const alerts = await generateAlerts()

  const high = alerts.filter((a) => a.priority === 'high')
  const medium = alerts.filter((a) => a.priority === 'medium')
  const low = alerts.filter((a) => a.priority === 'low')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Alertas</h1>
          {alerts.length > 0 && (
            <Badge variant="destructive">{alerts.length}</Badge>
          )}
        </div>
        <SendTelegramButton alerts={alerts} />
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Bell className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhum alerta no momento.</p>
          <p className="text-xs text-muted-foreground">Todos os pagamentos estão em dia e os pacientes estão ativos.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {high.length > 0 && (
            <section className="space-y-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-red-700">
                <AlertCircle className="h-4 w-4" /> Alta prioridade ({high.length})
              </h2>
              {high.map((a, i) => <AlertCard key={i} alert={a} />)}
            </section>
          )}
          {medium.length > 0 && (
            <section className="space-y-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                <AlertTriangle className="h-4 w-4" /> Média prioridade ({medium.length})
              </h2>
              {medium.map((a, i) => <AlertCard key={i} alert={a} />)}
            </section>
          )}
          {low.length > 0 && (
            <section className="space-y-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                <Info className="h-4 w-4" /> Baixa prioridade ({low.length})
              </h2>
              {low.map((a, i) => <AlertCard key={i} alert={a} />)}
            </section>
          )}
        </div>
      )}
    </div>
  )
}
