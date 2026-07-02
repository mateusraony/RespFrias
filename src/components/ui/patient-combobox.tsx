'use client'

import { useState, useEffect, useRef } from 'react'
import type { Patient } from '@/types'

export function PatientCombobox({
  patients,
  defaultValue,
  name,
  required,
  disabled,
}: {
  patients: Patient[]
  defaultValue?: string
  name: string
  required?: boolean
  disabled?: boolean
}) {
  const initial = patients.find((p) => p.id === defaultValue)
  const [query, setQuery] = useState(initial?.name ?? '')
  const [selectedId, setSelectedId] = useState(initial?.id ?? '')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = query.trim()
    ? patients.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : patients

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        if (!selectedId) setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [selectedId])

  function select(p: Patient) {
    setSelectedId(p.id)
    setQuery(p.name)
    setOpen(false)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    setSelectedId('')
    setOpen(true)
  }

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={selectedId} required={required} />
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        placeholder="Buscar paciente..."
        disabled={disabled}
        autoComplete="off"
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-input bg-background shadow-md">
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onMouseDown={() => select(p)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
            >
              <span
                className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: p.color ?? '#94a3b8' }}
              />
              {p.name}
            </button>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground shadow-md">
          Nenhum paciente encontrado
        </div>
      )}
    </div>
  )
}
