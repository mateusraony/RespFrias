import { notFound } from 'next/navigation'
import { SessionForm } from '@/components/pacientes/session-form'
import { getPatient } from '@/app/actions/patients'
import type { SessionType } from '@/types'

export default async function NovaSessaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tipo?: string }>
}) {
  const { id } = await params
  const { tipo } = await searchParams
  const patient = await getPatient(id)
  if (!patient) notFound()

  const sessionType: SessionType = tipo === 'full' ? 'full' : 'quick'

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">
        {sessionType === 'quick' ? 'Sessão rápida' : 'Sessão completa'} — {patient.name}
      </h1>
      <SessionForm patientId={id} patientName={patient.name} sessionType={sessionType} />
    </div>
  )
}
