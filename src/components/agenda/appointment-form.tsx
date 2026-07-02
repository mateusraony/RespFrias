'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
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
import { createAppointment, updateAppointment, cancelAppointment } from '@/app/actions/appointments'
import { PatientCombobox } from '@/components/ui/patient-combobox'
import type { Appointment, Patient } from '@/types'

export function AppointmentForm({
  patients,
  appointment,
  defaultDate,
}: {
  patients: Patient[]
  appointment?: Appointment
  defaultDate?: string
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [justification, setJustification] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [duration, setDuration] = useState(appointment?.duration_minutes ?? 50)

  function redirectAfterSave(date?: string) {
    const d = date ?? defaultDate
    const params = d ? `?view=dia&data=${d}` : ''
    router.push(`/agenda${params}`)
  }

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    const result = appointment
      ? await updateAppointment(appointment.id, formData)
      : await createAppointment(formData)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }
    redirectAfterSave(formData.get('date') as string)
  }

  async function handleCancel() {
    if (!appointment) return
    setCancelling(true)
    const result = await cancelAppointment(appointment.id, justification)
    setCancelling(false)
    setCancelOpen(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    redirectAfterSave(appointment.date)
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)) }} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="patient_id">Paciente *</Label>
        <PatientCombobox
          patients={patients}
          defaultValue={appointment?.patient_id}
          name="patient_id"
          required
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="date">Data *</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={appointment?.date ?? defaultDate}
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="time">Horário *</Label>
          <Input id="time" name="time" type="time" defaultValue={appointment?.time?.slice(0, 5)} required disabled={loading} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="duration_minutes">Duração (min)</Label>
          <Input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            disabled={loading}
          />
          <div className="flex gap-1.5 pt-1">
            {[30, 45, 50, 60].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                disabled={loading}
                className={`rounded-full px-3 py-1 text-xs border transition-colors ${
                  duration === d
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-input hover:bg-accent'
                }`}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="status">Status</Label>
        <Select id="status" name="status" defaultValue={appointment?.status ?? 'pending'} disabled={loading}>
          <option value="pending">Pendente</option>
          <option value="confirmed">Confirmado</option>
          <option value="done">Realizado</option>
          <option value="cancelled">Cancelado</option>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={appointment?.notes} disabled={loading} />
      </div>

      <div className="flex flex-wrap justify-end gap-2 pt-2">
        {appointment && (
          <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
            <Button type="button" variant="destructive" onClick={() => setCancelOpen(true)}>
              Cancelar agendamento
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancelar agendamento?</DialogTitle>
                <DialogDescription>
                  Informe uma justificativa. Esta ação fica registrada na auditoria.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Motivo do cancelamento"
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
                  onClick={handleCancel}
                  disabled={cancelling || !justification.trim()}
                >
                  {cancelling ? 'Cancelando...' : 'Confirmar cancelamento'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Voltar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
