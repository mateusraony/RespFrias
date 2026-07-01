'use client'

import { useTransition } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sendTelegramAlert } from '@/app/actions/alerts'
import type { PatientAlert } from '@/types'

function buildMessage(alerts: PatientAlert[]): string {
  const lines = ['<b>🔔 RespFrias — Resumo de Alertas</b>\n']

  const high = alerts.filter((a) => a.priority === 'high')
  const medium = alerts.filter((a) => a.priority === 'medium')
  const low = alerts.filter((a) => a.priority === 'low')

  if (high.length) {
    lines.push('<b>🔴 Alta prioridade</b>')
    high.forEach((a) => lines.push(`• ${a.patient_name}: ${a.reason}`))
    lines.push('')
  }
  if (medium.length) {
    lines.push('<b>🟡 Média prioridade</b>')
    medium.forEach((a) => lines.push(`• ${a.patient_name}: ${a.reason}`))
    lines.push('')
  }
  if (low.length) {
    lines.push('<b>🟢 Baixa prioridade</b>')
    low.forEach((a) => lines.push(`• ${a.patient_name}: ${a.reason}`))
  }

  return lines.join('\n')
}

export function SendTelegramButton({ alerts }: { alerts: PatientAlert[] }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const message = buildMessage(alerts)
      const result = await sendTelegramAlert(message)
      if (result.success) {
        alert('Resumo enviado via Telegram!')
      } else {
        alert(`Erro: ${result.error}`)
      }
    })
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={pending || alerts.length === 0}>
      <Send className="h-4 w-4" />
      {pending ? 'Enviando...' : 'Enviar via Telegram'}
    </Button>
  )
}
