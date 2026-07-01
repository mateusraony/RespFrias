import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { getReport } from '@/app/actions/reports'
import { getProfile } from '@/app/actions/profile'
import { ReportDocument } from '@/components/relatorios/report-pdf'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const [report, profile] = await Promise.all([getReport(id), getProfile()])

  if (!report) {
    return NextResponse.json({ error: 'Relatório não encontrado.' }, { status: 404 })
  }

  if (report.status !== 'approved') {
    return NextResponse.json({ error: 'Relatório ainda não aprovado.' }, { status: 403 })
  }

  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('PDF generation timed out')), 30_000)
    )
    const buffer = Buffer.from(
      await Promise.race([renderToBuffer(ReportDocument({ report, profile })), timeout])
    )

    const filename = `relatorio-${report.content.patient.name.replace(/\s+/g, '-').toLowerCase()}.pdf`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao gerar PDF.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
