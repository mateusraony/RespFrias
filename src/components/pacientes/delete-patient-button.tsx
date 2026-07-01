'use client'

import { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { softDeletePatient } from '@/app/actions/patients'

export function DeletePatientButton({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false)
  const [justification, setJustification] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true)
    setError(null)
    const result = await softDeletePatient(patientId, justification)
    setLoading(false)
    if (result && !result.success) {
      setError(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" variant="destructive" size="sm" onClick={() => setOpen(true)}>
        Excluir paciente
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir paciente?</DialogTitle>
          <DialogDescription>
            O paciente será desativado (não apagado). Informe a justificativa para o registro de auditoria.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}
        <Textarea
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          placeholder="Motivo da exclusão"
          rows={3}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || !justification.trim()}
          >
            {loading ? 'Excluindo...' : 'Confirmar exclusão'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
