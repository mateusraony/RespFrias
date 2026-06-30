import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Patient } from '@/types'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function PatientCard({ patient }: { patient: Patient }) {
  return (
    <Link href={`/pacientes/${patient.id}`}>
      <Card className="transition-shadow hover:shadow-md active:scale-[0.99]">
        <CardContent className="flex items-center gap-3 p-4">
          <Avatar>
            <AvatarFallback>{initials(patient.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{patient.name}</p>
              {patient.is_fictitious && (
                <Badge variant="warning" className="shrink-0">
                  Teste
                </Badge>
              )}
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {patient.diagnosis || 'Sem diagnóstico registrado'}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
