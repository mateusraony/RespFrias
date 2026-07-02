export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import MiniCalendar from '@/components/dashboard/mini-calendar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Users,
  Calendar,
  DollarSign,
  FileText,
  ArrowUpRight,
  ChevronRight,
  AlertTriangle,
  Clock,
  TrendingDown,
  CheckCircle2,
} from 'lucide-react'
import sql from '@/lib/db/client'
import { generateAlerts } from '@/app/actions/alerts'
import { getAppointmentsByRange } from '@/app/actions/appointments'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format as fmtDate } from 'date-fns'
import { formatCurrency } from '@/lib/format'
import type { PatientAlert, AppointmentWithPatient } from '@/types'

interface DashboardData {
  activePatients: number
  todayCount: number
  pendingPaymentsAmount: number
  pendingPaymentsCount: number
  draftReportsCount: number
  todayAppointments: {
    id: string
    time: string
    patient_name: string
    patient_id: string
    status: string
    initials: string
  }[]
  monthPaid: number
  monthPending: number
  monthAgreement: number
  alerts: PatientAlert[]
  monthAppointments: AppointmentWithPatient[]
}

async function getDashboardData(): Promise<DashboardData> {
  const now = new Date()
  const today = format(now, 'yyyy-MM-dd')
  const monthStart = format(now, 'yyyy-MM') + '-01'
  const [y, m] = format(now, 'yyyy-MM').split('-').map(Number)
  const monthEnd = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`

  // Calendar grid range (full weeks)
  const gridStart = fmtDate(startOfWeek(startOfMonth(now), { weekStartsOn: 0 }), 'yyyy-MM-dd')
  const gridEnd = fmtDate(endOfWeek(endOfMonth(now), { weekStartsOn: 0 }), 'yyyy-MM-dd')

  const settled = await Promise.allSettled([
    sql`SELECT COUNT(*)::int AS count FROM patients WHERE deleted_at IS NULL`,
    sql`
      SELECT a.id, a.time, a.status, a.patient_id, pt.name AS patient_name
      FROM appointments a
      JOIN patients pt ON pt.id = a.patient_id AND pt.deleted_at IS NULL
      WHERE a.date = ${today} AND a.status != 'cancelled' AND a.deleted_at IS NULL
      ORDER BY a.time
    `,
    sql`
      SELECT COUNT(*)::int AS count, COALESCE(SUM(amount - COALESCE(amount_paid, 0)), 0)::numeric AS total
      FROM payments
      WHERE status IN ('pending', 'partial') AND due_date < CURRENT_DATE
    `,
    sql`SELECT COUNT(*)::int AS count FROM reports WHERE status = 'draft'`,
    sql`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'paid' THEN COALESCE(amount_paid, amount) ELSE 0 END), 0)::numeric AS paid,
        COALESCE(SUM(CASE WHEN status IN ('pending','partial') THEN amount - COALESCE(amount_paid,0) ELSE 0 END), 0)::numeric AS pending,
        COALESCE(SUM(CASE WHEN status = 'agreement' THEN amount ELSE 0 END), 0)::numeric AS agreement
      FROM payments
      WHERE (due_date >= ${monthStart} AND due_date < ${monthEnd})
         OR (due_date IS NULL AND paid_at >= ${monthStart} AND paid_at < ${monthEnd})
         OR (due_date IS NULL AND status != 'paid' AND created_at >= ${monthStart} AND created_at < ${monthEnd})
    `,
    generateAlerts(),
    getAppointmentsByRange(gridStart, gridEnd),
  ])

  const patientRows = settled[0].status === 'fulfilled' ? settled[0].value : []
  const todayRows = settled[1].status === 'fulfilled' ? settled[1].value : []
  const pendingRows = settled[2].status === 'fulfilled' ? settled[2].value : []
  const reportsRows = settled[3].status === 'fulfilled' ? settled[3].value : []
  const financialRows = settled[4].status === 'fulfilled' ? settled[4].value : []
  const alerts: Awaited<ReturnType<typeof generateAlerts>> = settled[5].status === 'fulfilled' ? settled[5].value : []
  const monthAppointments: AppointmentWithPatient[] = settled[6].status === 'fulfilled' ? settled[6].value : []

  const todayAppointments = (todayRows as unknown as { id: string; time: string; status: string; patient_id: string; patient_name: string }[]).map((r) => ({
    id: r.id,
    time: r.time?.slice(0, 5) ?? '—',
    patient_name: r.patient_name,
    patient_id: r.patient_id,
    status: r.status,
    initials: r.patient_name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase(),
  }))

  const fin = (financialRows as unknown as { paid: string; pending: string; agreement: string }[])[0] ?? { paid: '0', pending: '0', agreement: '0' }
  const pend = (pendingRows as unknown as { count: number; total: string }[])[0] ?? { count: 0, total: '0' }

  return {
    activePatients: ((patientRows as unknown as { count: number }[])[0]?.count ?? 0),
    todayCount: todayAppointments.length,
    pendingPaymentsAmount: parseFloat(pend.total),
    pendingPaymentsCount: pend.count,
    draftReportsCount: ((reportsRows as unknown as { count: number }[])[0]?.count ?? 0),
    todayAppointments,
    monthPaid: parseFloat(fin.paid),
    monthPending: parseFloat(fin.pending),
    monthAgreement: parseFloat(fin.agreement),
    alerts: alerts.slice(0, 5),
    monthAppointments,
  }
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'confirmed') return <Badge variant="success">Confirmado</Badge>
  if (status === 'done') return <Badge variant="secondary">Concluído</Badge>
  return <Badge variant="warning">Pendente</Badge>
}

function PriorityBadge({ priority }: { priority: PatientAlert['priority'] }) {
  const map = { high: { label: 'Alto', variant: 'destructive' as const }, medium: { label: 'Médio', variant: 'warning' as const }, low: { label: 'Baixo', variant: 'secondary' as const } }
  const { label, variant } = map[priority]
  return <Badge variant={variant}>{label}</Badge>
}

function AlertTypeIcon({ type }: { type: PatientAlert['type'] }) {
  if (type === 'financial') return <DollarSign className="w-4 h-4 text-amber-500" />
  if (type === 'clinical') return <TrendingDown className="w-4 h-4 text-red-500" />
  return <AlertTriangle className="w-4 h-4 text-gray-500" />
}

export default async function DashboardPage() {
  let data: DashboardData
  try {
    data = await getDashboardData()
  } catch {
    data = {
      activePatients: 0, todayCount: 0, pendingPaymentsAmount: 0, pendingPaymentsCount: 0,
      draftReportsCount: 0, todayAppointments: [], monthPaid: 0, monthPending: 0, monthAgreement: 0, alerts: [], monthAppointments: [],
    }
  }

  const summaryCards = [
    { title: 'Pacientes ativos', value: String(data.activePatients), change: 'Ver pacientes →', icon: Users, color: 'bg-teal-500', href: '/pacientes' },
    { title: 'Atendimentos hoje', value: String(data.todayCount), change: 'Ver agenda →', icon: Calendar, color: 'bg-blue-500', href: '/agenda' },
    { title: 'Pagamentos vencidos', value: formatCurrency(data.pendingPaymentsAmount), change: `${data.pendingPaymentsCount} pagamento${data.pendingPaymentsCount !== 1 ? 's' : ''}`, icon: DollarSign, color: 'bg-amber-500', href: '/financeiro' },
    { title: 'Relatórios em rascunho', value: String(data.draftReportsCount), change: 'Ver relatórios →', icon: FileText, color: 'bg-purple-500', href: '/relatorios' },
  ]

  const total = data.monthPaid + data.monthPending
  const paidPct = total > 0 ? Math.round((data.monthPaid / total) * 100) : 0
  const pendPct = 100 - paidPct

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`${card.color} rounded-xl p-2.5 shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 leading-tight">{card.title}</p>
                    <p className="text-xl font-bold text-gray-900 mt-0.5 leading-tight">{card.value}</p>
                    <a href={card.href} className="text-xs text-[#0d7ea8] flex items-center gap-1 mt-1 hover:underline">
                      {card.change} <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Agenda de hoje */}
        <Card className="border-0 shadow-sm lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Agenda de Hoje</CardTitle>
              <a href="/agenda" className="text-xs text-[#0d7ea8] hover:underline">Ver agenda completa</a>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {data.todayAppointments.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <CheckCircle2 className="mx-auto mb-2 h-6 w-6 opacity-30" />
                Nenhum atendimento hoje
              </div>
            ) : (
              data.todayAppointments.map((appt) => (
                <Link key={appt.id} href={`/agenda/${appt.id}`} className="flex items-center gap-3 hover:bg-gray-50 rounded-md p-1 -mx-1 transition-colors">
                  <span className="text-sm text-gray-500 w-12 shrink-0">{appt.time}</span>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-gray-100 text-gray-700 text-xs font-medium">{appt.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{appt.patient_name}</p>
                  </div>
                  <StatusBadge status={appt.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Mini-calendário */}
        <Card className="border-0 shadow-sm lg:col-span-1">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Calendário</CardTitle>
              <a href="/agenda" className="text-xs text-[#0d7ea8] hover:underline">Ver agenda</a>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <MiniCalendar appointments={data.monthAppointments} />
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card className="border-0 shadow-sm lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Alertas</CardTitle>
              <a href="/alertas" className="text-xs text-[#0d7ea8] hover:underline">Ver todos</a>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {data.alerts.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <CheckCircle2 className="mx-auto mb-2 h-6 w-6 opacity-30" />
                Nenhum alerta no momento
              </div>
            ) : (
              data.alerts.map((alert) => (
                <a
                  key={`${alert.patient_id}-${alert.type}`}
                  href={`/pacientes/${alert.patient_id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <AlertTypeIcon type={alert.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{alert.patient_name}</p>
                    <p className="text-xs text-gray-500 truncate">{alert.reason}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 shrink-0" />
                </a>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pacientes em Alerta (high priority only) */}
      {data.alerts.filter((a) => a.priority === 'high').length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Pacientes com Atenção Urgente
                </CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Pagamentos vencidos — ação necessária</p>
              </div>
              <Link href="/alertas" className="text-xs text-[#0d7ea8] hover:underline">Ver todos os alertas</Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {data.alerts.filter((a) => a.priority === 'high').map((alert) => (
                <div key={`${alert.patient_id}-high`} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-white hover:border-gray-200 transition-colors">
                  <AlertTypeIcon type={alert.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">{alert.patient_name}</span>
                      <PriorityBadge priority={alert.priority} />
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{alert.reason}</p>
                    {alert.last_appointment && (
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Último atendimento: {alert.last_appointment}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0 text-xs h-8" asChild>
                    <a href={`/pacientes/${alert.patient_id}`}>Abrir prontuário</a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financeiro do Mês */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Financeiro — {format(new Date(), 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase())}
            </CardTitle>
            <a href="/financeiro" className="text-xs text-[#0d7ea8] hover:underline">Ver financeiro completo</a>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500">Recebido</p>
              <p className="text-base font-bold text-green-600">{formatCurrency(data.monthPaid)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Pendente</p>
              <p className="text-base font-bold text-amber-600">{formatCurrency(data.monthPending)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Acordos</p>
              <p className="text-base font-bold text-blue-600">{formatCurrency(data.monthAgreement)}</p>
            </div>
          </div>
          {total > 0 ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Recebido vs Pendente</span>
                <span>{paidPct}% / {pendPct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-green-500 rounded-l-full" style={{ width: `${paidPct}%` }} />
                <div className="h-full bg-amber-400 rounded-r-full" style={{ width: `${pendPct}%` }} />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Recebido ({paidPct}%)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Pendente ({pendPct}%)</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">Nenhum pagamento registrado este mês</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
