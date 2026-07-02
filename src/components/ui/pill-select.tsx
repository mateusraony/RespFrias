'use client'

export function PillSelect({
  name,
  options,
  value,
  onChange,
  disabled,
}: {
  name: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <input type="hidden" name={name} value={value} />
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          disabled={disabled}
          className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
            value === opt.value
              ? 'bg-primary text-primary-foreground border-primary font-medium'
              : 'bg-background border-input hover:bg-accent'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
