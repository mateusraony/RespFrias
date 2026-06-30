'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { closeMonth, reopenMonth } from '@/app/actions/financial-close'
import type { FinancialClose } from '@/types'

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function FinancialCloseCard({
  periodKey,
  financialClose,
  totalExpected,
  totalReceived,
}: {
  periodKey: string
  financialClose: FinancialClose | null
  totalExpected: number
  totalReceived: number
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [closeOpen, setCloseOpen] = useState(false)
  const [reopenOpen, setReopenOpen] = useState(false)
  const [justification, setJustification] = useState('')
  const [loading, setLoading] = useState(false)

  const isClosed = !!financialClose && !financialClose.reopened_at

  async function handleClose() {
    setLoading(true)
    const result = await closeMonth(periodKey)
    setLoading(false)
    setCloseOpen(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    router.refresh()
  }

  async function handleReopen() {
    setLoading(true)
    const result = await reopenMonth(periodKey, justification)
    setLoading(false)
    setReopenOpen(false)
    setJustification('')
    if (!result.success) {
      setError(result.error)
      return
    }
    router.refresh()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Fechamento do mês</CardTitle>
        <Badge variant={isClosed ? 'success' : 'warning'}>{isClosed ? 'Fechado' : 'Aberto'}</Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground">Previsto</p>
            <p className="font-medium">{formatCurrency(totalExpected)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Recebido</p>
            <p className="font-medium">{formatCurrency(totalReceived)}</p>
          </div>
        </div>

        {financialClose && (
          <p className="text-xs text-muted-foreground">
            {isClosed
              ? `Fechado em ${format(new Date(financialClose.closed_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`
              : `Reaberto em ${format(new Date(financialClose.reopened_at!), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          {!isClosed && (
            <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
              <Button type="button" onClick={() => setCloseOpen(true)}>
                Fechar mês
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Fechar o mês?</DialogTitle>
                  <DialogDescription>
                    Após fechado, os pagamentos deste período não poderão mais ser editados até que
                    o fechamento seja reaberto.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Voltar
                    </Button>
                  </DialogClose>
                  <Button type="button" onClick={handleClose} disabled={loading}>
                    {loading ? 'Fechando...' : 'Confirmar fechamento'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {isClosed && (
            <Dialog open={reopenOpen} onOpenChange={setReopenOpen}>
              <Button type="button" variant="destructive" onClick={() => setReopenOpen(true)}>
                Reabrir mês
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reabrir o mês?</DialogTitle>
                  <DialogDescription>
                    Informe uma justificativa. Esta ação fica registrada na auditoria.
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Motivo da reabertura"
                  rows={3}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Voltar
                    </Button>
                  </DialogClose>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleReopen}
                    disabled={loading || !justification.trim()}
                  >
                    {loading ? 'Reabrindo...' : 'Confirmar reabertura'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
