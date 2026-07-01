'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, AlertTriangle } from 'lucide-react'
import { createPackage, deactivatePackage } from '@/app/actions/packages'
import type { PatientPackage } from '@/app/actions/packages'

export function PackageWidget({
  patientId,
  pkg,
}: {
  patientId: string
  pkg: PatientPackage | null
}) {
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const remaining = pkg ? pkg.total_sessions - pkg.used_sessions : 0
  const pct = pkg ? Math.min(100, Math.round((pkg.used_sessions / pkg.total_sessions) * 100)) : 0
  const isLow = pkg && remaining <= 3 && remaining > 0
  const isDepleted = pkg && remaining <= 0

  function handleCreate(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createPackage(patientId, formData)
      if (!result.success) setError(result.error)
      else setShowForm(false)
    })
  }

  function handleDeactivate() {
    if (!pkg) return
    startTransition(async () => {
      await deactivatePackage(pkg.id, patientId)
    })
  }

  if (!pkg && !showForm) {
    return (
      <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="w-full">
        <Package className="mr-2 h-4 w-4" /> Criar pacote de sessões
      </Button>
    )
  }

  if (showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4" /> Novo pacote
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleCreate} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="total_sessions">Total de sessões</Label>
              <Input id="total_sessions" name="total_sessions" type="number" min="1" required placeholder="Ex: 20" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input id="description" name="description" placeholder="Ex: Pacote respiratório mensal" />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? 'Salvando...' : 'Criar'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={isDepleted ? 'border-red-200 bg-red-50' : isLow ? 'border-amber-200 bg-amber-50' : ''}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Package className="h-4 w-4" />
            Pacote: {pkg!.used_sessions} / {pkg!.total_sessions} sessões
          </div>
          {(isDepleted || isLow) && (
            <AlertTriangle className={`h-4 w-4 ${isDepleted ? 'text-red-500' : 'text-amber-500'}`} />
          )}
        </div>

        {pkg!.description && (
          <p className="text-xs text-muted-foreground">{pkg!.description}</p>
        )}

        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isDepleted ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-[#0d7ea8]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {isDepleted ? (
          <p className="text-xs font-medium text-red-600">Pacote esgotado — renove para continuar</p>
        ) : isLow ? (
          <p className="text-xs font-medium text-amber-600">
            Restam apenas {remaining} sessão{remaining !== 1 ? 'ões' : ''} — avise o paciente
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Restam {remaining} sessões</p>
        )}

        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            Novo pacote
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDeactivate} disabled={pending} className="text-muted-foreground text-xs">
            Encerrar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
