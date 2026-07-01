'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createPatient, updatePatient } from '@/app/actions/patients'
import type { Patient } from '@/types'

export function PatientForm({ patient }: { patient?: Patient }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    if (patient) {
      const result = await updatePatient(patient.id, formData)
      setLoading(false)
      if (!result.success) {
        setError(result.error)
        return
      }
      router.push(`/pacientes/${patient.id}`)
    } else {
      const result = await createPatient(formData)
      setLoading(false)
      if (!result.success) {
        setError(result.error)
        return
      }
      router.push(`/pacientes/${result.data.id}`)
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)) }} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">Nome *</Label>
        <Input id="name" name="name" defaultValue={patient?.name} required />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={patient?.email} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" defaultValue={patient?.phone} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="birth_date">Data de nascimento</Label>
        <Input id="birth_date" name="birth_date" type="date" defaultValue={patient?.birth_date} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="diagnosis">Diagnóstico</Label>
        <Input id="diagnosis" name="diagnosis" defaultValue={patient?.diagnosis} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" rows={4} defaultValue={patient?.notes} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
