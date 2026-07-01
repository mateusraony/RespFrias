export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { FileText } from 'lucide-react'
import { safeDate } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getAllReports } from '@/app/actions/reports'


export default async function RelatoriosPage() {
  const reports = await getAllReports()

  const approved = reports.filter((r) => r.status === 'approved')
  const drafts = reports.filter((r) => r.status === 'draft')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Relatórios</h1>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhum relatório gerado ainda.
          </p>
          <p className="text-xs text-muted-foreground">
            Para gerar um relatório, acesse um{' '}
            <Link href="/pacientes" className="underline text-[#0d7ea8]">paciente</Link>
            {' '}e vá na aba <strong>Relatórios</strong>.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {approved.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Aprovados ({approved.length})</h2>
              {approved.map((r) => (
                <Card key={r.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.patient_name} · Gerado em {safeDate(r.created_at)}
                        {r.approved_at && ` · Aprovado em ${safeDate(r.approved_at)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="success">Aprovado</Badge>
                      <Button asChild variant="outline" size="sm">
                        <a href={`/api/reports/${r.id}/pdf`} target="_blank" rel="noopener noreferrer">
                          Baixar PDF
                        </a>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/pacientes/${r.patient_id}?tab=relatorios`}>Ver paciente</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>
          )}

          {drafts.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Rascunhos ({drafts.length})</h2>
              {drafts.map((r) => (
                <Card key={r.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.patient_name} · Gerado em {safeDate(r.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary">Rascunho</Badge>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/pacientes/${r.patient_id}?tab=relatorios`}>Aprovar</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  )
}
