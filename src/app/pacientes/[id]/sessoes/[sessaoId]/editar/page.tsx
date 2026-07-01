export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SessionFormEdit } from '@/components/pacientes/session-form-edit'
import { getSession } from '@/app/actions/sessions'
import { getPatient } from '@/app/actions/patients'

export default async function EditarSessaoPage({
  params,
}: {
  params: Promise<{ id: string; sessaoId: string }>
}) {
  const { id, sessaoId } = await params
  const [session, patient] = await Promise.all([getSession(sessaoId), getPatient(id)])
  if (!session || !patient) notFound()

  if (session.evolution_finalized_at) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Button asChild variant="outline" size="sm">
          <Link href={`/pacientes/${id}/sessoes/${sessaoId}`}>← Voltar</Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Esta sessão tem evolução finalizada e não pode ser editada.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href={`/pacientes/${id}/sessoes/${sessaoId}`}>← Voltar</Link>
        </Button>
        <h1 className="text-xl font-semibold">Editar sessão — {patient.name}</h1>
      </div>
      <SessionFormEdit session={session} patientId={id} patientName={patient.name} />
    </div>
  )
}
