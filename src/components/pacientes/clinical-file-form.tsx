'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { saveClinicalFile } from '@/app/actions/assessments'
import type { ClinicalFile } from '@/types'

function TagInput({
  id,
  name,
  label,
  defaultValue,
  placeholder,
}: {
  id: string
  name: string
  label: string
  defaultValue?: string
  placeholder?: string
}) {
  const parse = (v?: string) =>
    v ? v.split('\n').map((s) => s.trim()).filter(Boolean) : []

  const [tags, setTags] = useState<string[]>(parse(defaultValue))
  const [input, setInput] = useState('')

  function add() {
    const trimmed = input.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed])
    }
    setInput('')
  }

  function remove(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <input
        type="hidden"
        name={name}
        value={input.trim() ? [...tags, input.trim()].join('\n') : tags.join('\n')}
      />
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full border border-input bg-muted px-2.5 py-0.5 text-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                className="ml-0.5 text-muted-foreground hover:text-destructive"
                aria-label={`Remover ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder ?? 'Digite e pressione Enter'}
          className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Button type="button" variant="outline" onClick={add} className="shrink-0">
          Adicionar
        </Button>
      </div>
    </div>
  )
}

function TagInputWithSuggestions({
  suggestions,
  ...props
}: {
  id: string
  name: string
  label: string
  defaultValue?: string
  placeholder?: string
  suggestions: string[]
}) {
  const parse = (v?: string) =>
    v ? v.split('\n').map((s) => s.trim()).filter(Boolean) : []

  const [tags, setTags] = useState<string[]>(parse(props.defaultValue))
  const [input, setInput] = useState('')

  function add(value: string) {
    const trimmed = value.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed])
    }
    setInput('')
  }

  function remove(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={props.id}>{props.label}</Label>
      <input
        type="hidden"
        name={props.name}
        value={input.trim() ? [...tags, input.trim()].join('\n') : tags.join('\n')}
      />
      <div className="flex flex-wrap gap-1.5 pb-1">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => add(s)}
            disabled={tags.includes(s)}
            className={`rounded-full px-2.5 py-0.5 text-xs border transition-colors ${
              tags.includes(s)
                ? 'bg-primary text-primary-foreground border-primary opacity-60'
                : 'bg-background border-input hover:bg-accent'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full border border-input bg-muted px-2.5 py-0.5 text-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                className="ml-0.5 text-muted-foreground hover:text-destructive"
                aria-label={`Remover ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          id={props.id}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(input) } }}
          placeholder={props.placeholder ?? 'Digite e pressione Enter'}
          className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Button type="button" variant="outline" onClick={() => add(input)} className="shrink-0">
          Adicionar
        </Button>
      </div>
    </div>
  )
}

export function ClinicalFileForm({
  patientId,
  clinicalFile,
}: {
  patientId: string
  clinicalFile: ClinicalFile | null
}) {
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSaved(false)
    setLoading(true)
    const result = await saveClinicalFile(patientId, formData)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }
    setSaved(true)
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)) }} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      {saved && (
        <p className="rounded-md bg-green-100 px-3 py-2 text-sm text-green-800">
          Ficha clínica salva.
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="diagnosis_detail">Diagnóstico detalhado</Label>
        <Textarea
          id="diagnosis_detail"
          name="diagnosis_detail"
          rows={3}
          defaultValue={clinicalFile?.diagnosis_detail}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="history">Histórico</Label>
        <Textarea id="history" name="history" rows={3} defaultValue={clinicalFile?.history} />
      </div>

      <TagInputWithSuggestions
        id="current_medications"
        name="current_medications"
        label="Medicações em uso"
        defaultValue={clinicalFile?.current_medications}
        placeholder="Ex: Salbutamol 100mcg — adicione uma por vez"
        suggestions={['Salbutamol', 'Ipratrópio', 'Budesonida', 'Formoterol', 'Tiotrópio', 'Prednisolona', 'N-acetilcisteína']}
      />

      <TagInputWithSuggestions
        id="allergies"
        name="allergies"
        label="Alergias"
        defaultValue={clinicalFile?.allergies}
        placeholder="Ex: Dipirona — adicione uma por vez"
        suggestions={['Dipirona', 'Penicilina', 'AAS', 'Ibuprofeno', 'Látex']}
      />

      <div className="space-y-1.5">
        <Label htmlFor="precautions">Precauções</Label>
        <Textarea
          id="precautions"
          name="precautions"
          rows={2}
          defaultValue={clinicalFile?.precautions}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar ficha clínica'}
        </Button>
      </div>
    </form>
  )
}
