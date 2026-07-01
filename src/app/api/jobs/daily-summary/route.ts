import { NextRequest, NextResponse } from 'next/server'
import { validateCronSecret } from '@/lib/cron-auth'
import { runJob, todayKey } from '@/lib/job-runner'
import { generateAlerts, sendTelegramAlert } from '@/app/actions/alerts'

export async function POST(req: NextRequest) {
  const authError = validateCronSecret(req)
  if (authError) return authError

  const result = await runJob('daily-summary', todayKey(), async () => {
    const alerts = await generateAlerts()

    if (alerts.length === 0) {
      await sendTelegramAlert('✅ <b>RespFrias</b> — Nenhum alerta pendente hoje.')
      return 'No alerts — ok message sent.'
    }

    const high = alerts.filter((a) => a.priority === 'high')
    const medium = alerts.filter((a) => a.priority === 'medium')
    const low = alerts.filter((a) => a.priority === 'low')

    function esc(t: string) {
      return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }

    const lines = ['<b>🔔 RespFrias — Resumo Diário</b>\n']
    if (high.length) {
      lines.push('<b>🔴 Alta prioridade</b>')
      high.forEach((a) => lines.push(`• ${esc(a.patient_name)}: ${esc(a.reason)}`))
      lines.push('')
    }
    if (medium.length) {
      lines.push('<b>🟡 Média prioridade</b>')
      medium.forEach((a) => lines.push(`• ${esc(a.patient_name)}: ${esc(a.reason)}`))
      lines.push('')
    }
    if (low.length) {
      lines.push('<b>🟢 Baixa prioridade</b>')
      low.forEach((a) => lines.push(`• ${esc(a.patient_name)}: ${esc(a.reason)}`))
    }

    const send = await sendTelegramAlert(lines.join('\n'))
    if (!send.success) throw new Error(send.error)

    return `Sent ${alerts.length} alerts via Telegram.`
  })

  const status = result.status === 'error' ? 500 : 200
  return NextResponse.json(result, { status })
}
