import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Line,
  Circle,
  G,
} from '@react-pdf/renderer'
import type { Report, Assessment, Session } from '@/types'

const PRIMARY = '#0d7ea8'
const GRAY = '#6b7280'
const LIGHT = '#f3f4f6'
const BORDER = '#e5e7eb'

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, color: '#111827', padding: 40 },
  header: { marginBottom: 20, borderBottomWidth: 2, borderBottomColor: PRIMARY, paddingBottom: 10 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: PRIMARY },
  subtitle: { fontSize: 11, color: GRAY, marginTop: 3 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: PRIMARY, marginBottom: 6, borderBottomWidth: 1, borderBottomColor: BORDER, paddingBottom: 3 },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { fontFamily: 'Helvetica-Bold', width: 130 },
  value: { flex: 1, color: '#374151' },
  tableHeader: { flexDirection: 'row', backgroundColor: LIGHT, padding: 4, marginBottom: 2 },
  tableRow: { flexDirection: 'row', padding: 4, borderBottomWidth: 1, borderBottomColor: BORDER },
  tableCell: { flex: 1, fontSize: 9 },
  tableCellBold: { flex: 1, fontSize: 9, fontFamily: 'Helvetica-Bold' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 9 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: GRAY },
  chartContainer: { marginTop: 6, height: 120 },
  noData: { color: GRAY, fontSize: 9, fontStyle: 'italic' },
})

function fmt(val: unknown): string {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'string' && val.includes('-')) {
    const d = new Date(val + 'T12:00:00')
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('pt-BR')
    }
  }
  return String(val)
}

type ChartDataPoint = Record<string, string | number | undefined>

function LineChart({
  data,
  keys,
  colors,
  width = 500,
  height = 100,
}: {
  data: ChartDataPoint[]
  keys: string[]
  colors: string[]
  width?: number
  height?: number
}) {
  if (data.length < 2) return null

  const pad = { top: 10, right: 10, bottom: 20, left: 30 }
  const w = width - pad.left - pad.right
  const h = height - pad.top - pad.bottom

  const allValues = data.flatMap((d) => keys.map((k) => d[k]).filter((v): v is number => typeof v === 'number'))
  if (allValues.length === 0) return null

  const min = Math.min(...allValues)
  const max = Math.max(...allValues)
  const range = max - min || 1

  const xScale = (i: number) => pad.left + (i / (data.length - 1)) * w
  const yScale = (v: number) => pad.top + h - ((v - min) / range) * h

  return (
    <Svg width={width} height={height}>
      {/* Y axis */}
      <Line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + h} stroke={BORDER} strokeWidth={1} />
      {/* X axis */}
      <Line x1={pad.left} y1={pad.top + h} x2={pad.left + w} y2={pad.top + h} stroke={BORDER} strokeWidth={1} />
      {/* Lines */}
      {keys.map((key, ki) =>
        data.map((d, i) => {
          if (i === 0) return null
          const prev = data[i - 1]
          const v1 = prev[key]
          const v2 = d[key]
          if (typeof v1 !== 'number' || typeof v2 !== 'number') return null
          return (
            <G key={`${ki}-${i}`}>
              <Line
                x1={xScale(i - 1)} y1={yScale(v1)}
                x2={xScale(i)} y2={yScale(v2)}
                stroke={colors[ki]}
                strokeWidth={1.5}
              />
            </G>
          )
        })
      )}
      {/* Dots */}
      {keys.map((key, ki) =>
        data.map((d, i) => {
          const v = d[key]
          if (typeof v !== 'number') return null
          return (
            <Circle key={`dot-${ki}-${i}`} cx={xScale(i)} cy={yScale(v)} r={2.5} fill={colors[ki]} />
          )
        })
      )}
      {/* X labels */}
      {data.map((d, i) => (
        <Text key={`xl-${i}`} x={xScale(i)} y={pad.top + h + 10} style={{ fontSize: 7, fill: GRAY, textAnchor: 'middle' }}>
          {String(d.label ?? i + 1)}
        </Text>
      ))}
      {/* Y min/max */}
      <Text x={pad.left - 3} y={pad.top + 4} style={{ fontSize: 7, fill: GRAY, textAnchor: 'end' }}>{Math.round(max)}</Text>
      <Text x={pad.left - 3} y={pad.top + h} style={{ fontSize: 7, fill: GRAY, textAnchor: 'end' }}>{Math.round(min)}</Text>
    </Svg>
  )
}

function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 4 }}>
      {items.map((it) => (
        <View key={it.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <View style={{ width: 10, height: 3, backgroundColor: it.color }} />
          <Text style={{ fontSize: 8, color: GRAY }}>{it.label}</Text>
        </View>
      ))}
    </View>
  )
}

export function ReportDocument({ report }: { report: Report }) {
  const { patient, clinicalFile, assessments, sessions, goals, generatedAt } = report.content

  const sortedAssessments = [...assessments].sort((a, b) => a.date.localeCompare(b.date))
  const sortedSessions = [...sessions].sort((a, b) => b.date.localeCompare(a.date))

  const spo2Data = sortedAssessments.map((a, i) => ({
    label: `Av.${i + 1}`,
    SpO2: a.spo2,
    FC: a.heart_rate,
  }))

  const borgData = sortedAssessments.map((a, i) => ({
    label: `Av.${i + 1}`,
    Borg: a.borg,
    FR: a.respiratory_rate,
  }))

  const approvedAt = report.approved_at
    ? new Date(report.approved_at).toLocaleDateString('pt-BR')
    : new Date(generatedAt).toLocaleDateString('pt-BR')

  return (
    <Document title={report.title} author="RespFrias">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Fisioterapia Respiratória</Text>
          <Text style={styles.subtitle}>{patient.name} · Gerado em {approvedAt}</Text>
        </View>

        {/* Dados do paciente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do Paciente</Text>
          <View style={styles.row}><Text style={styles.label}>Nome:</Text><Text style={styles.value}>{patient.name}</Text></View>
          {patient.birth_date && <View style={styles.row}><Text style={styles.label}>Nascimento:</Text><Text style={styles.value}>{fmt(patient.birth_date)}</Text></View>}
          {patient.diagnosis && <View style={styles.row}><Text style={styles.label}>Diagnóstico:</Text><Text style={styles.value}>{patient.diagnosis}</Text></View>}
          {patient.email && <View style={styles.row}><Text style={styles.label}>Email:</Text><Text style={styles.value}>{patient.email}</Text></View>}
          {patient.phone && <View style={styles.row}><Text style={styles.label}>Telefone:</Text><Text style={styles.value}>{patient.phone}</Text></View>}
        </View>

        {/* Ficha clínica */}
        {clinicalFile && (clinicalFile.history || clinicalFile.current_medications || clinicalFile.allergies || clinicalFile.precautions) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ficha Clínica</Text>
            {clinicalFile.history && <View style={styles.row}><Text style={styles.label}>Histórico:</Text><Text style={styles.value}>{clinicalFile.history}</Text></View>}
            {clinicalFile.current_medications && <View style={styles.row}><Text style={styles.label}>Medicamentos:</Text><Text style={styles.value}>{clinicalFile.current_medications}</Text></View>}
            {clinicalFile.allergies && <View style={styles.row}><Text style={styles.label}>Alergias:</Text><Text style={styles.value}>{clinicalFile.allergies}</Text></View>}
            {clinicalFile.precautions && <View style={styles.row}><Text style={styles.label}>Precauções:</Text><Text style={styles.value}>{clinicalFile.precautions}</Text></View>}
          </View>
        )}

        {/* Gráficos de evolução */}
        {sortedAssessments.length >= 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evolução nas Avaliações</Text>
            <Legend items={[{ color: '#0d7ea8', label: 'SpO₂ (%)' }, { color: '#10B981', label: 'FC (bpm)' }]} />
            <View style={styles.chartContainer}>
              <LineChart data={spo2Data} keys={['SpO2', 'FC']} colors={['#0d7ea8', '#10B981']} />
            </View>
            <Legend items={[{ color: '#F59E0B', label: 'Borg' }, { color: '#EF4444', label: 'FR (irpm)' }]} />
            <View style={styles.chartContainer}>
              <LineChart data={borgData} keys={['Borg', 'FR']} colors={['#F59E0B', '#EF4444']} />
            </View>
          </View>
        )}

        {/* Avaliações */}
        {sortedAssessments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avaliações ({sortedAssessments.length})</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellBold, { flex: 1.2 }]}>Data</Text>
              <Text style={styles.tableCellBold}>SpO₂</Text>
              <Text style={styles.tableCellBold}>FC</Text>
              <Text style={styles.tableCellBold}>Borg</Text>
              <Text style={styles.tableCellBold}>FR</Text>
              <Text style={styles.tableCellBold}>MRC</Text>
              <Text style={styles.tableCellBold}>TC6</Text>
            </View>
            {sortedAssessments.map((a) => (
              <View key={a.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1.2 }]}>{fmt(a.date)}</Text>
                <Text style={styles.tableCell}>{a.spo2 ?? '—'}</Text>
                <Text style={styles.tableCell}>{a.heart_rate ?? '—'}</Text>
                <Text style={styles.tableCell}>{a.borg ?? '—'}</Text>
                <Text style={styles.tableCell}>{a.respiratory_rate ?? '—'}</Text>
                <Text style={styles.tableCell}>{a.mrc_scale ?? '—'}</Text>
                <Text style={styles.tableCell}>{a.six_mwt_distance ? `${a.six_mwt_distance}m` : '—'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer} fixed>
          RespFrias · Fisioterapia Respiratória · Documento confidencial · {approvedAt}
        </Text>
      </Page>

      {/* Página 2: Sessões e Metas */}
      <Page size="A4" style={styles.page}>
        {/* Sessões */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sessões ({sortedSessions.length})</Text>
          {sortedSessions.length === 0 ? (
            <Text style={styles.noData}>Nenhuma sessão registrada.</Text>
          ) : (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCellBold, { flex: 1.2 }]}>Data</Text>
                <Text style={styles.tableCellBold}>Tipo</Text>
                <Text style={styles.tableCellBold}>SpO₂ A/D</Text>
                <Text style={styles.tableCellBold}>FC A/D</Text>
                <Text style={styles.tableCellBold}>Borg A/D</Text>
                <Text style={[styles.tableCellBold, { flex: 2 }]}>Evolução</Text>
              </View>
              {sortedSessions.map((s) => (
                <View key={s.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 1.2 }]}>{fmt(s.date)}</Text>
                  <Text style={styles.tableCell}>{s.session_type === 'quick' ? 'Rápida' : 'Completa'}</Text>
                  <Text style={styles.tableCell}>{s.spo2_before ?? '—'}/{s.spo2_after ?? '—'}</Text>
                  <Text style={styles.tableCell}>{s.heart_rate_before ?? '—'}/{s.heart_rate_after ?? '—'}</Text>
                  <Text style={styles.tableCell}>{s.borg_before ?? '—'}/{s.borg_after ?? '—'}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {(s.evolution_final || s.evolution_draft || '—').slice(0, 200)}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Metas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metas Terapêuticas</Text>
          {goals.length === 0 ? (
            <Text style={styles.noData}>Nenhuma meta registrada.</Text>
          ) : (
            goals.map((g) => (
              <View key={g.id} style={[styles.row, { marginBottom: 5 }]}>
                <Text style={[styles.badge, {
                  backgroundColor: g.status === 'achieved' ? '#D1FAE5' : g.status === 'cancelled' ? '#FEE2E2' : '#DBEAFE',
                  color: g.status === 'achieved' ? '#065F46' : g.status === 'cancelled' ? '#991B1B' : '#1E40AF',
                  marginRight: 8,
                }]}>
                  {g.status === 'active' ? 'Ativa' : g.status === 'achieved' ? 'Atingida' : 'Cancelada'}
                </Text>
                <Text style={{ flex: 1 }}>{g.description}</Text>
                {g.target_date && <Text style={{ color: GRAY, marginLeft: 8 }}>Prazo: {fmt(g.target_date)}</Text>}
              </View>
            ))
          )}
        </View>

        <Text style={styles.footer} fixed>
          RespFrias · Fisioterapia Respiratória · Documento confidencial · {approvedAt}
        </Text>
      </Page>
    </Document>
  )
}
