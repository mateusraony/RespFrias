import { NextRequest, NextResponse } from 'next/server'
import { validateCronSecret } from '@/lib/cron-auth'
import { runJob, todayKey } from '@/lib/job-runner'
import { sendTelegramAlert } from '@/app/actions/alerts'
import sql from '@/lib/db/client'

export async function POST(req: NextRequest) {
  const authError = validateCronSecret(req)
  if (authError) return authError

  const result = await runJob('appointment-reminder', todayKey(), async () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().slice(0, 10)

    const appointments = await sql`
      SELECT a.date, a.time, p.name AS patient_name, p.phone
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      WHERE a.date = ${tomorrowStr}
        AND a.status IN ('pending', 'confirmed')
        AND p.deleted_at IS NULL
      ORDER BY a.time ASC
    `

    if (appointments.length === 0) {
      return 'No appointments tomorrow — skipped Telegram.'
    }

    function esc(t: string) {
      return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }

    const dateFormatted = tomorrow.toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: '2-digit',
    })

    const lines = [`<b>📅 Agendamentos de amanhã (${esc(dateFormatted)})</b>\n`]
    for (const appt of appointments) {
      const time = String(appt.time).slice(0, 5)
      const phone = appt.phone ? ` · ${esc(String(appt.phone))}` : ''
      lines.push(`• ${time} — ${esc(String(appt.patient_name))}${phone}`)
    }

    const send = await sendTelegramAlert(lines.join('\n'))
    if (!send.success) throw new Error(send.error)

    return `Sent reminder for ${appointments.length} appointments.`
  })

  const status = result.status === 'error' ? 500 : 200
  return NextResponse.json(result, { status })
}
