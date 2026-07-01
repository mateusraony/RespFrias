import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Session } from '@/types'

const VITALS = [
  { key: 'spo2', label: 'SpO₂ (%)', step: '1', min: '0', max: '100' },
  { key: 'borg', label: 'Borg (0-10)', step: '0.5', min: '0', max: '10' },
  { key: 'respiratory_rate', label: 'FR (irpm)', step: '1' },
  { key: 'heart_rate', label: 'FC (bpm)', step: '1' },
] as const

export function VitalsFields({ session }: { session?: Partial<Session> }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      <p className="col-span-2 text-sm font-medium text-muted-foreground">Antes</p>
      {VITALS.map((v) => (
        <div key={`${v.key}_before`} className="space-y-1.5">
          <Label htmlFor={`${v.key}_before`}>{v.label}</Label>
          <Input
            id={`${v.key}_before`}
            name={`${v.key}_before`}
            type="number"
            step={v.step}
            min={'min' in v ? v.min : undefined}
            max={'max' in v ? v.max : undefined}
            defaultValue={session?.[`${v.key}_before` as keyof Session] as number ?? ''}
          />
        </div>
      ))}
      <p className="col-span-2 pt-2 text-sm font-medium text-muted-foreground">Depois</p>
      {VITALS.map((v) => (
        <div key={`${v.key}_after`} className="space-y-1.5">
          <Label htmlFor={`${v.key}_after`}>{v.label}</Label>
          <Input
            id={`${v.key}_after`}
            name={`${v.key}_after`}
            type="number"
            step={v.step}
            min={'min' in v ? v.min : undefined}
            max={'max' in v ? v.max : undefined}
            defaultValue={session?.[`${v.key}_after` as keyof Session] as number ?? ''}
          />
        </div>
      ))}
    </div>
  )
}
