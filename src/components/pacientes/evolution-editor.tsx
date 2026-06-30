'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { saveDraftEvolution, finalizeEvolution } from '@/app/actions/sessions'
import type { Session } from '@/types'

export function EvolutionEditor({ session, patientId }: { session: Session; patientId: string }) {
  const router = useRouter()
  const isFinalized = !!session.evolution_finalized_at
  const [draft, setDraft] = useState(session.evolution_draft ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  async function handleSaveDraft() {
    setError(null)
    setSaving(true)
    const result = await saveDraftEvolution(session.id, patientId, draft)
    setSaving(false)
    if (!result.success) setError(result.error)
  }

  async function handleFinalize() {
    setError(null)
    setFinalizing(true)
    const result = await finalizeEvolution(session.id, patientId)
    setFinalizing(false)
    setDialogOpen(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    router.refresh()
  }

  if (isFinalized) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Evolução finalizada — bloqueada para edição direta.
        </p>
        <div className="whitespace-pre-wrap rounded-md border bg-gray-50 p-4 text-sm">
          {session.evolution_final}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={10}
        className="font-mono text-sm"
      />
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar rascunho'}
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button type="button" onClick={() => setDialogOpen(true)} disabled={!draft.trim()}>
            Finalizar evolução
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Finalizar evolução?</DialogTitle>
              <DialogDescription>
                Tem certeza? Depois de finalizada, a evolução não poderá ser editada diretamente —
                qualquer alteração futura exigirá justificativa e ficará registrada na auditoria.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleFinalize} disabled={finalizing}>
                {finalizing ? 'Finalizando...' : 'Confirmar e finalizar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
