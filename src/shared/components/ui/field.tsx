import type { ComponentProps } from 'react'
import { ChevronDown } from 'lucide-react'

const CONTROL =
  'w-full rounded border border-border bg-card px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors duration-200 hover:border-border-strong focus:border-accent focus:outline-none aria-[invalid=true]:border-danger'

const LABEL = 'label-gold block'

interface FieldProps {
  label: string
  name: string
  error?: string
  hint?: string
}

function describedBy(name: string, hint?: string, error?: string) {
  return [hint && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(' ') || undefined
}

function Messages({ name, hint, error }: Pick<FieldProps, 'name' | 'hint' | 'error'>) {
  return (
    <>
      {hint && <p id={`${name}-hint`} className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p id={`${name}-error`} className="text-xs text-danger">{error}</p>}
    </>
  )
}

// Campo con etiqueta, ayuda y error accesibles (aria-describedby)
export function Field({ label, name, error, hint, ...input }: FieldProps & ComponentProps<'input'>) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className={LABEL}>{label}</label>
      <input id={name} name={name} aria-invalid={Boolean(error)} aria-describedby={describedBy(name, hint, error)} className={CONTROL} {...input} />
      <Messages name={name} hint={hint} error={error} />
    </div>
  )
}

export function TextArea({ label, name, error, hint, ...input }: FieldProps & ComponentProps<'textarea'>) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className={LABEL}>{label}</label>
      <textarea id={name} name={name} aria-invalid={Boolean(error)} aria-describedby={describedBy(name, hint, error)} className={CONTROL} rows={4} {...input} />
      <Messages name={name} hint={hint} error={error} />
    </div>
  )
}

export function Select({ label, name, error, children, ...input }: FieldProps & ComponentProps<'select'>) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className={LABEL}>{label}</label>
      <div className="relative">
        <select id={name} name={name} aria-invalid={Boolean(error)} className={`${CONTROL} appearance-none pr-10`} {...input}>{children}</select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
