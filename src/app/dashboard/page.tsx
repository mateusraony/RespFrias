import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  TrendingUp,
} from 'lucide-react'
import type { PatientAlert } from '@/types'

// Dados de exemplo — serão substituídos por dados reais do Supabase na Fase 1
const summaryCards = [
  {
    title: 'Pacientes ativos',
    value: '128',
    change: '+12 este mês',
    icon: Users,
    color: 'bg-teal-500',
    href: '/pacientes',
  },
  {
    title: 'Atendimentos hoje',
    value: '14',
    change: 'Ver agenda →',
    icon: Calendar,
    color: 'bg-blue-500',
    href: '/agenda',
  },
  {
    title: 'Pagamentos pendentes',
    value: 'R$ 4.380,00',
    change: '8 pagamentos',
    icon: DollarSign,
    color: 'bg-amber-500',
    href: '/financeiro',
  },
  {
    title: 'Relatórios pendentes',
    value: '7',
    change: 'Ver relatórios →',
    icon: FileText,
    color: 'bg-purple-500',
    href: '/relatorios',
  },
]

const todayAppointments = [
  { time: '08:00', patient: 'Ana Paula da Silva', condition: 'Reabilitação Pulmonar', status: 'confirmed', initials: 'AP' },
  { time: '09:00', patient: 'Carlos Eduardo Oliveira', condition: 'DPOC', status: 'confirmed', initials: 'CE' },
  { time: '10:00', patient: 'Maria Fernanda Lima', condition: 'Asma', status: 'confirmed', initials: 'MF' },
  { time: '11:00', patient: 'João Pedro Santos', condition: 'Fibrose Cística', status: 'confirmed', initials: 'JP' },
  { time: '14:00', patient: 'Lucas Almeida Rocha', condition: 'Pós-COVID', status: 'pending', initials: 'LA' },
]

const patientAlerts: PatientAlert[] = [
  {
    patient_id: '1',
    patient_name: 'Ana Paula da Silva',
    reason: 'SpO₂ caiu de 95% para 91% nas últimas 2 sessões',
    priority: 'high',
    type: 'clinical',
    last_appointment: '19/05/2025',
  },
  {
    patient_id: '2',
    patient_name: 'Carlos Eduardo Oliveira',
    reason: 'Escala de Borg aumentou de 3 para 6 na última semana',
    priority: 'medium',
    type: 'clinical',
    last_appointment: '18/05/2025',
  },
  {
    patient_id: '3',
    patient_name: 'Lucas Almeida Rocha',
    reason: 'Sem reavaliação há 35 dias',
    priority: 'low',
    type: 'clinical',
    last_appointment: '14/04/2025',
  },
  {
    patient_id: '4',
    patient_name: 'Maria Fernanda Lima',
    reason: 'Pagamento em atraso — 3 sessões pendentes',
    priority: 'medium',
    type: 'financial',
    last_appointment: '17/05/2025',
  },
]

const systemAlerts = [
  {
    icon: '📋',
    title: 'Reavaliação pendente',
    description: '5 pacientes precisam de reavaliação',
    href: '/pacientes',
  },
  {
    icon: '💰',
    title: 'Pagamento atrasado',
    description: '3 pagamentos em atraso',
    href: '/financeiro',
  },
  {
    icon: '📄',
    title: 'Relatório mensal para revisar',
    description: 'Julho/2024 está pendente de revisão',
    href: '/relatorios',
  },
]

function StatusBadge({ status }: { status: string }) {
  if (status === 'confirmed') {
    return <Badge variant="success">Confirmado</Badge>
  }
  return <Badge variant="warning">Pendente</Badge>
}

function PriorityBadge({ priority }: { priority: PatientAlert['priority'] }) {
  const map = {
    high: { label: 'Alto', variant: 'destructive' as const },
    medium: { label: 'Médio', variant: 'warning' as const },
    low: { label: 'Baixo', variant: 'secondary' as const },
  }
  const { label, variant } = map[priority]
  return <Badge variant={variant}>{label}</Badge>
}

function AlertTypeIcon({ type }: { type: PatientAlert['type'] }) {
  if (type === 'financial') return <DollarSign className="w-4 h-4 text-amber-500" />
  if (type === 'clinical') return <TrendingDown className="w-4 h-4 text-red-500" />
  return <AlertTriangle className="w-4 h-4 text-gray-500" />
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
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
              <a href="/agenda" className="text-xs text-[#0d7ea8] hover:underline">
                Ver agenda completa
              </a>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {todayAppointments.map((appt) => (
              <div key={appt.time} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-12 shrink-0">{appt.time}</span>
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-gray-100 text-gray-700 text-xs font-medium">
                    {appt.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{appt.patient}</p>
                  <p className="text-xs text-gray-500 truncate">{appt.condition}</p>
                </div>
                <StatusBadge status={appt.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Evolução Geral dos Pacientes */}
        <Card className="border-0 shadow-sm lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Evolução Geral dos Pacientes</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Média dos pacientes ativos — últimos 30 dias</p>
              </div>
              <select className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-[#0d7ea8]">
                <option value="">Todos os pacientes</option>
                <option value="1">Ana Paula da Silva</option>
                <option value="2">Carlos Eduardo Oliveira</option>
                <option value="3">Maria Fernanda Lima</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {/* SpO₂ */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">SpO₂ (%)</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-teal-600">95%</span>
                  <span className="flex items-center text-xs text-teal-600">
                    <TrendingUp className="w-3 h-3" /> +5%
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full">
                <div className="h-1.5 bg-teal-500 rounded-full" style={{ width: '95%' }} />
              </div>
            </div>
            {/* Borg */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">Escala de Borg (dispneia)</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-blue-600">2</span>
                  <span className="flex items-center text-xs text-green-600">
                    <TrendingDown className="w-3 h-3" /> -1
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full">
                <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
            {/* FR */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">Freq. Respiratória (irpm)</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-purple-600">18</span>
                  <span className="flex items-center text-xs text-red-500">
                    <TrendingDown className="w-3 h-3" /> -3
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full">
                <div className="h-1.5 bg-purple-500 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center pt-2">
              Gráficos detalhados disponíveis na Fase 1
            </p>
          </CardContent>
        </Card>

        {/* Alertas do sistema */}
        <Card className="border-0 shadow-sm lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Alertas</CardTitle>
              <a href="/alertas" className="text-xs text-[#0d7ea8] hover:underline">
                Ver todos
              </a>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {systemAlerts.map((alert) => (
              <a
                key={alert.title}
                href={alert.href}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
              >
                <span className="text-xl shrink-0">{alert.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                  <p className="text-xs text-gray-500">{alert.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 shrink-0" />
              </a>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Pacientes em Alerta */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Pacientes em Alerta
              </CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Pacientes que precisam de atenção agora</p>
            </div>
            <a href="/pacientes?filtro=alerta" className="text-xs text-[#0d7ea8] hover:underline">
              Ver todos
            </a>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {patientAlerts.map((alert) => (
              <div
                key={alert.patient_id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-white hover:border-gray-200 transition-colors"
              >
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

      {/* Financeiro resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Financeiro do Mês</CardTitle>
              <a href="/financeiro" className="text-xs text-[#0d7ea8] hover:underline">
                Ver financeiro completo
              </a>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Recebido</p>
                <p className="text-base font-bold text-green-600">R$ 18.650,00</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Pendente</p>
                <p className="text-base font-bold text-amber-600">R$ 4.380,00</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Acordos</p>
                <p className="text-base font-bold text-blue-600">R$ 2.150,00</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Recebido vs Pendente</span>
                <span>81% / 19%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-green-500 rounded-l-full" style={{ width: '81%' }} />
                <div className="h-full bg-amber-400 rounded-r-full" style={{ width: '19%' }} />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Recebido (81%)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Pendente (19%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integrações */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Integrações</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-xl">📅</span>
                <span className="text-sm font-medium text-gray-900">Google Calendar</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">Sincronizado</Badge>
                <button className="text-gray-400 hover:text-gray-600">⋮</button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-xl">✈️</span>
                <span className="text-sm font-medium text-gray-900">Telegram</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">Sincronizado</Badge>
                <button className="text-gray-400 hover:text-gray-600">⋮</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
