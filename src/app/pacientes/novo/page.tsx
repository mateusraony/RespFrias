import { PatientForm } from '@/components/pacientes/patient-form'

export default function NovoPacientePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Novo paciente</h1>
      <PatientForm />
    </div>
  )
}
