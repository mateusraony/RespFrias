export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PatientTabs } from '@/components/pacientes/patient-tabs'
import { ClinicalFileForm } from '@/components/pacientes/clinical-file-form'
import { SessionCard } from '@/components/pacientes/session-card'
import { GoalActions } from '@/components/pacientes/goal-actions'
import { GoalForm } from '@/components/pacientes/goal-form'
import { DeletePatientButton } from '@/components/pacientes/delete-patient-button'
import { getPatient } from '@/app/actions/patients'
import { getClinicalFile, getAssessments } from '@/app/actions/assessments'
import { getSessions } from '@/app/actions/sessions'
import { getGoals } from '@/app/actions/goals'
import { getAuditLogs } from '@/app/actions/audit'
import { getAppointmentsByPatient } from '@/app/actions/appointments'
import { getPaymentsByPatient } from '@/app/actions/payments'
import { getReports } from '@/app/actions/reports'
import { PaymentStatusBadge } from '@/components/financeiro/payment-status-badge'
import { GenerateReportButton } from '@/components/relatorios/generate-report-button'
import { ApproveReportButton } from '@/components/relatorios/approve-report-button'
import { DeleteReportButton } from '@/components/relatorios/delete-report-button'
import { AssessmentCharts } from '@/components/relatorios/assessment-charts'

function safeDate(val: unknown): string {
  if (!val) return '—'
  try {
    const d = val instanceof Date ? val : new Date(String(val) + 'T12:00:00')
    return format(d, 'dd/MM/yyyy', { locale: ptBR })
  } catch { return '—' }
}

export default async function PacientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab } = await searchParams
  const patient = await getPatient(id)
  if (!patient) notFound()

  const [clinicalFile, assessments, sessions, goals, auditLogs, patientAppointments, patientPayments, reports] =
    await Promise.all([
      getClinicalFile(id),
      getAssessments(id),
      getSessions(id),
      getGoals(id),
      getAuditLogs(id),
      getAppointmentsByPatient(id),
      getPaymentsByPatient(id),
      getReports(id),
    ])

  const activeGoals = goals.filter((g) => g.status === 'active')

  const tabs = [
    {
      key: 'resumo',
      label: 'Resumo',
      content: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Últimas sessões</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma sessão registrada.</p>
              ) : (
                <>
                  {sessions.slice(0, 3).map((s) => (
                    <SessionCard key={s.id} session={s} patientId={id} />
                  ))}
                  {sessions.length > 3 && (
                    <a href={`/pacientes/${id}?tab=sessoes`} className="block text-center text-sm text-[#0d7ea8] hover:underline">
                      Ver todas as {sessions.length} sessões →
                    </a>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metas ativas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeGoals.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma meta ativa.</p>
              ) : (
                activeGoals.map((g) => (
                  <p key={g.id} className="text-sm">
                    {g.description}
                  </p>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      key: 'dados',
      label: 'Dados Pessoais',
      content: (
        <Card>
          <CardContent className="space-y-2 p-4">
            <p>
              <span className="font-medium">Email:</span> {patient.email || '—'}
            </p>
            <p>
              <span className="font-medium">Telefone:</span> {patient.phone || '—'}
            </p>
            <p>
              <span className="font-medium">Nascimento:</span>{' '}
              {safeDate(patient.birth_date)}
            </p>
            <p>
              <span className="font-medium">Diagnóstico:</span> {patient.diagnosis || '—'}
            </p>
            <p>
              <span className="font-medium">Observações:</span> {patient.notes || '—'}
            </p>
            <Button asChild className="mt-2">
              <Link href={`/pacientes/${id}/editar`}>Editar dados</Link>
            </Button>
          </CardContent>
        </Card>
      ),
    },
    {
      key: 'ficha',
      label: 'Ficha Clínica',
      content: <ClinicalFileForm patientId={id} clinicalFile={clinicalFile} />,
    },
    {
      key: 'avaliacoes',
      label: 'Avaliações',
      content: (
        <div className="space-y-3">
          <Button asChild>
            <Link href={`/pacientes/${id}/avaliacoes/nova`}>Nova avaliação</Link>
          </Button>
          {assessments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma avaliação registrada.</p>
          ) : (
            assessments.map((a) => (
              <Card key={a.id}>
                <CardContent className="space-y-1 p-4 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">
                      {safeDate(a.date)} ·{' '}
                      {a.assessment_type === 'initial' ? 'Inicial' : 'Periódica'}
                    </p>
                    <Button asChild variant="outline" size="sm" className="shrink-0">
                      <Link href={`/pacientes/${id}/avaliacoes/${a.id}/editar`}>Editar</Link>
                    </Button>
                  </div>
                  <p className="text-muted-foreground">
                    SpO₂: {a.spo2 ?? '—'} · Borg: {a.borg ?? '—'} · FR: {a.respiratory_rate ?? '—'} ·
                    FC: {a.heart_rate ?? '—'} · MRC: {a.mrc_scale ?? '—'} · TC6:{' '}
                    {a.six_mwt_distance ?? '—'}m
                  </p>
                  {a.notes && <p>{a.notes}</p>}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ),
    },
    {
      key: 'sessoes',
      label: 'Sessões',
      content: (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/pacientes/${id}/sessoes/nova?tipo=quick`}>Sessão rápida</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/pacientes/${id}/sessoes/nova?tipo=full`}>Sessão completa</Link>
            </Button>
          </div>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma sessão registrada.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <SessionCard key={s.id} session={s} patientId={id} />
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'metas',
      label: 'Metas',
      content: (
        <div className="space-y-3">
          <GoalForm patientId={id} />
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma meta registrada.</p>
          ) : (
            goals.map((g) => (
              <Card key={g.id}>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm">{g.description}</p>
                    {g.target_date && (
                      <p className="text-xs text-muted-foreground">
                        Prazo: {safeDate(g.target_date)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        g.status === 'achieved'
                          ? 'success'
                          : g.status === 'cancelled'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {g.status === 'active'
                        ? 'Ativa'
                        : g.status === 'achieved'
                          ? 'Atingida'
                          : 'Cancelada'}
                    </Badge>
                    <GoalActions goalId={g.id} patientId={id} status={g.status} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ),
    },
    {
      key: 'agenda',
      label: 'Agenda',
      content: (
        <div className="space-y-3">
          <Button asChild>
            <Link href={`/agenda/nova`}>Novo agendamento</Link>
          </Button>
          {patientAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum agendamento futuro.</p>
          ) : (
            patientAppointments.map((a) => (
              <Card key={a.id}>
                <CardContent className="flex items-center justify-between gap-3 p-4 text-sm">
                  <div>
                    <p className="font-medium">
                      {safeDate(a.date)} · {a.time.slice(0, 5)}
                    </p>
                    {a.notes && <p className="text-muted-foreground">{a.notes}</p>}
                  </div>
                  <Badge
                    variant={
                      a.status === 'cancelled'
                        ? 'destructive'
                        : a.status === 'done'
                          ? 'secondary'
                          : a.status === 'confirmed'
                            ? 'success'
                            : 'warning'
                    }
                  >
                    {
                      { pending: 'Pendente', confirmed: 'Confirmado', done: 'Realizado', cancelled: 'Cancelado' }[
                        a.status
                      ]
                    }
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
          <p className="text-xs text-muted-foreground">
            Veja a agenda completa em <Link href="/agenda" className="underline">/agenda</Link>.
          </p>
        </div>
      ),
    },
    {
      key: 'pagamentos',
      label: 'Pagamentos',
      content: (
        <div className="space-y-2">
          <Button asChild size="sm">
            <Link href={`/financeiro/pagamentos/novo?patient_id=${id}`}>+ Novo pagamento</Link>
          </Button>
          {patientPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum pagamento registrado.</p>
          ) : (
            patientPayments.map((p) => (
              <Card key={p.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
                  <div>
                    <p className="font-medium">
                      {p.due_date ? safeDate(p.due_date) : 'Sem vencimento'}
                    </p>
                    {p.notes && <p className="text-muted-foreground">{p.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-medium">
                      {Number(p.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <PaymentStatusBadge status={p.status} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          <p className="text-xs text-muted-foreground">
            Veja o financeiro completo em <Link href="/financeiro" className="underline">/financeiro</Link>.
          </p>
        </div>
      ),
    },
    {
      key: 'relatorios',
      label: 'Relatórios',
      content: (
        <div className="space-y-4">
          {/* Gráficos de evolução */}
          {assessments.length >= 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Evolução nas Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                <AssessmentCharts assessments={assessments} />
              </CardContent>
            </Card>
          )}

          {/* Relatórios gerados */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Relatórios</CardTitle>
              <GenerateReportButton patientId={id} />
            </CardHeader>
            <CardContent className="space-y-3">
              {reports.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum relatório gerado. Clique em &quot;Gerar relatório&quot; para criar o primeiro.
                </p>
              ) : (
                reports.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {safeDate(r.created_at)}
                        {r.approved_at && ` · Aprovado em ${safeDate(r.approved_at)}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant={r.status === 'approved' ? 'success' : 'secondary'}>
                        {r.status === 'approved' ? 'Aprovado' : 'Rascunho'}
                      </Badge>
                      {r.status === 'draft' && (
                        <ApproveReportButton reportId={r.id} patientId={id} />
                      )}
                      {r.status === 'approved' && (
                        <Button asChild variant="outline" size="sm">
                          <a href={`/api/reports/${r.id}/pdf`} target="_blank" rel="noopener noreferrer">
                            Baixar PDF
                          </a>
                        </Button>
                      )}
                      <DeleteReportButton reportId={r.id} patientId={id} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      key: 'anexos',
      label: 'Anexos',
      content: <PlaceholderTab text="Anexos serão implementados futuramente." />,
    },
    {
      key: 'comunicacao',
      label: 'Comunicação',
      content: <PlaceholderTab text="Comunicação (Telegram) será implementada na Fase 5." />,
    },
    {
      key: 'auditoria',
      label: 'Auditoria',
      content: (
        <div className="space-y-2">
          {auditLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum registro de auditoria.</p>
          ) : (
            auditLogs.map((log) => (
              <Card key={log.id}>
                <CardContent className="p-4 text-sm">
                  <p className="font-medium">
                    {({'patient':'Paciente','session':'Sessão','assessment':'Avaliação','goal':'Meta','clinical_file':'Ficha Clínica','appointment':'Agendamento','payment':'Pagamento','financial_close':'Fechamento','report':'Relatório'} as Record<string,string>)[log.entity_type] ?? log.entity_type}
                    {' · '}
                    {({'create':'Criação','update':'Atualização','delete':'Exclusão','finalize':'Finalização','reopen':'Reabertura','send':'Envio'} as Record<string,string>)[log.action] ?? log.action}
                    {' · '}
                    {log.created_at ? (() => { try { return format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) } catch { return '—' } })() : '—'}
                  </p>
                  {log.justification && (
                    <p className="text-muted-foreground">Justificativa: {log.justification}</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{patient.name}</h1>
          {patient.is_fictitious && <Badge variant="warning">Paciente de teste</Badge>}
        </div>
        <DeletePatientButton patientId={id} />
      </div>
      <PatientTabs tabs={tabs} defaultTab={tab} />
    </div>
  )
}

function PlaceholderTab({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="p-6 text-center text-sm text-muted-foreground">{text}</CardContent>
    </Card>
  )
}
