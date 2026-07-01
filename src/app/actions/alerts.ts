'use server'

import sql from '@/lib/db/client'
import type { PatientAlert } from '@/types'

export async function generateAlerts(): Promise<PatientAlert[]> {
  try {
    const alerts: PatientAlert[] = []

    // 1. Pagamentos vencidos não pagos
    const overduePayments = await sql`
      SELECT p.patient_id, pt.name AS patient_name, p.due_date
      FROM payments p
      JOIN patients pt ON pt.id = p.patient_id
      WHERE p.status IN ('pending', 'partial')
        AND p.due_date < CURRENT_DATE
        AND pt.deleted_at IS NULL
      ORDER BY p.due_date ASC
    `
    for (const row of overduePayments) {
      alerts.push({
        patient_id: row.patient_id as string,
        patient_name: row.patient_name as string,
        reason: `Pagamento vencido em ${new Date(String(row.due_date) + 'T12:00:00').toLocaleDateString('pt-BR')}`,
        priority: 'high',
        type: 'financial',
      })
    }

    // 2. Pacientes sem sessão há mais de 14 dias
    const inactiveSessions = await sql`
      SELECT pt.id AS patient_id, pt.name AS patient_name,
             MAX(s.date) AS last_session
      FROM patients pt
      LEFT JOIN sessions s ON s.patient_id = pt.id
      WHERE pt.deleted_at IS NULL
      GROUP BY pt.id, pt.name
      HAVING MAX(s.date) < CURRENT_DATE - INTERVAL '14 days'
         OR MAX(s.date) IS NULL
    `
    for (const row of inactiveSessions) {
      const lastSession = row.last_session
        ? new Date(String(row.last_session) + 'T12:00:00').toLocaleDateString('pt-BR')
        : null
      alerts.push({
        patient_id: row.patient_id as string,
        patient_name: row.patient_name as string,
        reason: lastSession
          ? `Sem sessão desde ${lastSession} (mais de 14 dias)`
          : 'Nenhuma sessão registrada',
        priority: 'medium',
        type: 'clinical',
        last_appointment: lastSession ?? undefined,
      })
    }

    // 3. Pacientes sem avaliação há mais de 90 dias
    const noAssessment = await sql`
      SELECT pt.id AS patient_id, pt.name AS patient_name,
             MAX(a.date) AS last_assessment
      FROM patients pt
      LEFT JOIN assessments a ON a.patient_id = pt.id
      WHERE pt.deleted_at IS NULL
      GROUP BY pt.id, pt.name
      HAVING MAX(a.date) < CURRENT_DATE - INTERVAL '90 days'
         OR MAX(a.date) IS NULL
    `
    for (const row of noAssessment) {
      const lastAssessment = row.last_assessment
        ? new Date(String(row.last_assessment) + 'T12:00:00').toLocaleDateString('pt-BR')
        : null
      // Skip if already has inactivity alert (avoid duplicates)
      const alreadyAlerted = alerts.some(
        (a) => a.patient_id === row.patient_id && a.type === 'clinical' && a.priority === 'medium'
      )
      if (!alreadyAlerted) {
        alerts.push({
          patient_id: row.patient_id as string,
          patient_name: row.patient_name as string,
          reason: lastAssessment
            ? `Sem avaliação desde ${lastAssessment} (mais de 90 dias)`
            : 'Nenhuma avaliação registrada',
          priority: 'low',
          type: 'clinical',
        })
      }
    }

    // 4. Pacientes com agendamento passado não confirmado como realizado (abandono)
    const abandonedAppointments = await sql`
      SELECT DISTINCT pt.id AS patient_id, pt.name AS patient_name, a.date AS appt_date
      FROM appointments a
      JOIN patients pt ON pt.id = a.patient_id AND pt.deleted_at IS NULL
      WHERE a.status IN ('pending', 'confirmed')
        AND a.date < CURRENT_DATE - INTERVAL '2 days'
        AND a.deleted_at IS NULL
      ORDER BY a.date DESC
    `
    for (const row of abandonedAppointments) {
      const alreadyAlerted = alerts.some((a) => a.patient_id === row.patient_id)
      if (!alreadyAlerted) {
        const dateStr = new Date(String(row.appt_date) + 'T12:00:00').toLocaleDateString('pt-BR')
        alerts.push({
          patient_id: row.patient_id as string,
          patient_name: row.patient_name as string,
          reason: `Agendamento de ${dateStr} não confirmado como realizado — possível falta`,
          priority: 'medium',
          type: 'clinical',
          last_appointment: dateStr,
        })
      }
    }

    // Sort: high → medium → low
    const order = { high: 0, medium: 1, low: 2 }
    alerts.sort((a, b) => order[a.priority] - order[b.priority])

    return alerts
  } catch (err) {
    console.error('generateAlerts error:', err)
    return []
  }
}

export async function getAlertCount(): Promise<number> {
  try {
    const alerts = await generateAlerts()
    return alerts.filter((a) => a.priority === 'high').length
  } catch {
    return 0
  }
}

export async function sendTelegramAlert(message: string): Promise<{ success: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    return { success: false, error: 'Telegram não configurado. Defina TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID.' }
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    })
    if (!res.ok) {
      const body = await res.text()
      return { success: false, error: `Telegram API error: ${body}` }
    }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
