'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedDraftRef = useRef(session.evolution_draft ?? '')

  // Auto-save 30s after last keystroke
  useEffect(() => {
    if (isFinalized) return
    if (draft === savedDraftRef.current) return

    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(async () => {
      if (draft === savedDraftRef.current) return
      const result = await saveDraftEvolution(session.id, patientId, draft)
      if (result.success) {
        savedDraftRef.current = draft
        setLastSaved(new Date())
      }
    }, 8_000)

    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current) }
  }, [draft, isFinalized, session.id, patientId])

  async function handleSaveDraft() {
    setError(null)
    setSaving(true)
    const result = await saveDraftEvolution(session.id, patientId, draft)
    setSaving(false)
    if (!result.success) {
      setError(result.error)
      toast.error(result.error)
    } else {
      savedDraftRef.current = draft
      setLastSaved(new Date())
      toast.success('Rascunho salvo.')
    }
  }

  async function handleFinalize() {
    setError(null)
    setFinalizing(true)
    const result = await finalizeEvolution(session.id, patientId)
    setFinalizing(false)
    setDialogOpen(false)
    if (!result.success) {
      setError(result.error)
      toast.error(result.error)
      return
    }
    toast.success('Evolução finalizada e bloqueada.')
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
      {(() => {
        const pairs: string[] = []
        if (session.spo2_before != null && session.spo2_after != null) pairs.push(`SpO₂: ${session.spo2_before}% → ${session.spo2_after}%`)
        if (session.borg_before != null && session.borg_after != null) pairs.push(`Borg: ${session.borg_before} → ${session.borg_after}`)
        if (session.respiratory_rate_before != null && session.respiratory_rate_after != null) pairs.push(`FR: ${session.respiratory_rate_before} → ${session.respiratory_rate_after} irpm`)
        if (session.heart_rate_before != null && session.heart_rate_after != null) pairs.push(`FC: ${session.heart_rate_before} → ${session.heart_rate_after} bpm`)
        if (pairs.length === 0) return null
        const vitalsLine = pairs.join('  ·  ')
        return (
          <button
            type="button"
            onClick={() => setDraft((d) => d ? `${d}\n${vitalsLine}` : vitalsLine)}
            className="self-start rounded-full px-3 py-1 text-xs border border-input bg-background hover:bg-accent transition-colors"
          >
            ⚡ Inserir dados da sessão
          </button>
        )
      })()}
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={10}
        className="font-mono text-sm"
        placeholder={'S: Paciente refere...\nO: SpO₂ ... Borg ... FR ... FC ...\nA: ...\nP: ...'}
      />
      {lastSaved && (
        <p className="text-xs text-muted-foreground">
          Rascunho salvo às {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
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
                <Button type="button" variant="outline">Cancelar</Button>
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
