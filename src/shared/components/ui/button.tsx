import Link from 'next/link'
import type { ComponentProps } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'gold'
type Size = 'sm' | 'md' | 'lg'

// Botones "Patrón" de Stitch: rectos (4px), mayúsculas espaciadas, filete dorado
const BASE =
  'inline-flex items-center justify-center gap-2 rounded font-bold uppercase tracking-[0.12em] transition-all duration-300 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100'

const SIZES: Record<Size, string> = {
  sm: 'px-3.5 py-2 text-[0.65rem]',
  md: 'px-5 py-3 text-[0.7rem]',
  lg: 'px-7 py-4 text-xs',
}

const VARIANTS: Record<Variant, string> = {
  primary: 'shine border border-accent bg-ink text-ink-foreground hover:bg-cedar hover:shadow-[0_8px_24px_-6px_rgba(197,160,89,0.45)]',
  gold: 'border border-accent bg-[#775A19] text-white hover:bg-[#5d4201]',
  secondary: 'border border-accent bg-transparent text-ink hover:bg-accent/10',
  outline: 'border border-border-strong bg-card text-ink hover:border-accent',
  ghost: 'text-ink hover:bg-muted',
  danger: 'border border-danger bg-danger text-white hover:opacity-90',
}

export function buttonClass(variant: Variant = 'primary', extra = '', size: Size = 'md'): string {
  return `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${extra}`
}

type Common = { variant?: Variant; size?: Size }

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ComponentProps<'button'> & Common) {
  return <button className={buttonClass(variant, className, size)} {...props} />
}

export function ButtonLink({ variant = 'primary', size = 'md', className = '', ...props }: ComponentProps<typeof Link> & Common) {
  return <Link className={buttonClass(variant, className, size)} {...props} />
}
