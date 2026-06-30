export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PatientCard } from '@/components/pacientes/patient-card'
import { PatientSearch } from '@/components/pacientes/patient-search'
import { getPatients } from '@/app/actions/patients'

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string }>
}) {
  const { busca } = await searchParams
  const patients = await getPatients(busca)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Pacientes</h1>
        <Button asChild>
          <Link href="/pacientes/novo">
            <Plus className="h-4 w-4" />
            Novo paciente
          </Link>
        </Button>
      </div>

      <PatientSearch defaultValue={busca} />

      {patients.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Nenhum paciente encontrado.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      )}
    </div>
  )
}
