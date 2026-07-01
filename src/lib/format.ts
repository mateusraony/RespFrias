import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function safeDate(val: unknown): string {
  if (!val) return '—'
  try {
    const d = val instanceof Date ? val : new Date(String(val) + 'T12:00:00')
    return format(d, 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return '—'
  }
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
