'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createPatient, updatePatient } from '@/app/actions/patients'
import { toast } from 'sonner'
import { PATIENT_COLORS } from '@/lib/patient-colors'
import type { Patient } from '@/types'

const RESPIRATORY_DIAGNOSES = [
  'DPOC',
  'Asma',
  'Fibrose pulmonar',
  'Bronquiectasia',
  'Hipertensão pulmonar',
  'Insuficiência respiratória crônica',
  'Apneia do sono',
  'Pneumonia em recuperação',
  'Síndrome pós-COVID',
  'Câncer de pulmão',
  'Derrame pleural',
  'Pneumotórax em recuperação',
]

export function PatientForm({ patient }: { patient?: Patient }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState(patient?.color ?? PATIENT_COLORS[0])
  const [diagnosisValue, setDiagnosisValue] = useState(patient?.diagnosis ?? '')
  const [diagnosisOpen, setDiagnosisOpen] = useState(false)
  const [patientNotes, setPatientNotes] = useState(patient?.notes ?? '')

  const NOTES_CHIPS = ['Atendimento domiciliar', 'Familiar acompanhante', 'Sem plano de saúde', 'Uso de O₂ domiciliar', 'Idoso dependente']

  const filteredDiagnoses = diagnosisValue.trim()
    ? RESPIRATORY_DIAGNOSES.filter((d) =>
        d.toLowerCase().includes(diagnosisValue.toLowerCase())
      )
    : RESPIRATORY_DIAGNOSES

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    if (patient) {
      const result = await updatePatient(patient.id, formData)
      setLoading(false)
      if (!result.success) { setError(result.error); return }
      toast.success('Paciente salvo.')
      router.push(`/pacientes/${patient.id}`)
    } else {
      const result = await createPatient(formData)
      setLoading(false)
      if (!result.success) { setError(result.error); return }
      toast.success('Paciente criado.')
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
        <Input id="name" name="name" defaultValue={patient?.name} required disabled={loading} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={patient?.email} disabled={loading} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" defaultValue={patient?.phone} disabled={loading} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="birth_date">Data de nascimento</Label>
        <Input id="birth_date" name="birth_date" type="date" defaultValue={patient?.birth_date} disabled={loading} />
      </div>

      <div className="relative space-y-1.5">
        <Label htmlFor="diagnosis">Diagnóstico</Label>
        <Input
          id="diagnosis"
          name="diagnosis"
          value={diagnosisValue}
          onChange={(e) => { setDiagnosisValue(e.target.value); setDiagnosisOpen(true) }}
          onFocus={() => setDiagnosisOpen(true)}
          onBlur={() => setTimeout(() => setDiagnosisOpen(false), 150)}
          placeholder="Digite ou selecione"
          autoComplete="off"
          disabled={loading}
        />
        {diagnosisOpen && filteredDiagnoses.length > 0 && (
          <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-input bg-background shadow-md">
            {filteredDiagnoses.map((d) => (
              <button
                key={d}
                type="button"
                onMouseDown={() => { setDiagnosisValue(d); setDiagnosisOpen(false) }}
                className="flex w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações</Label>
        <div className="flex flex-wrap gap-1 mb-1">
          {NOTES_CHIPS.map((c) => (
            <button key={c} type="button" disabled={loading}
              onClick={() => setPatientNotes((n) => n ? `${n} · ${c}` : c)}
              className="rounded-full px-2.5 py-0.5 text-xs border border-input bg-background hover:bg-accent transition-colors disabled:opacity-50">
              {c}
            </button>
          ))}
        </div>
        <Textarea id="notes" name="notes" rows={4} value={patientNotes} onChange={(e) => setPatientNotes(e.target.value)} disabled={loading} />
      </div>

      <div className="space-y-1.5">
        <Label>Cor na agenda</Label>
        <div className="flex flex-wrap gap-2">
          {PATIENT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedColor(c)}
              style={{ backgroundColor: c }}
              className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${
                selectedColor === c ? 'ring-2 ring-offset-2 ring-foreground scale-110' : ''
              }`}
              title={c}
            />
          ))}
        </div>
        <input type="hidden" name="color" value={selectedColor} />
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
