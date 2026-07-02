'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'

export function ChipInput({
  id,
  name,
  chips,
  defaultValue,
  disabled,
  ...inputProps
}: {
  id: string
  name: string
  chips: number[]
  defaultValue?: number | string
  disabled?: boolean
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue'>) {
  const [value, setValue] = useState(defaultValue != null ? String(defaultValue) : '')

  return (
    <div className="space-y-1">
      <Input
        id={id}
        name={name}
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        {...inputProps}
      />
      <div className="flex flex-wrap gap-1">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setValue(String(c))}
            disabled={disabled}
            className={`rounded-full px-2.5 py-0.5 text-xs border transition-colors ${
              value === String(c)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-input hover:bg-accent'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}
