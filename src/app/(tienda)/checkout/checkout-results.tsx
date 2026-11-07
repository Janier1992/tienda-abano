'use client'
import { motion } from 'motion/react'
import { FlaskConical, Hourglass } from 'lucide-react'
import type { CheckoutState } from '@/features/checkout/state'
import { formatMoney } from '@/shared/lib/money'
import { ButtonLink } from '@/shared/components/ui/button'

const EASE = [0.22, 1, 0.36, 1] as const

function ResultCard({ icon, eyebrow, title, children }: { icon: React.ReactNode; eyebrow: string; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div
      role="status" initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, ease: EASE }}
      className="glass ring-gold relative overflow-hidden rounded-[2rem] p-8 md:p-12"
    >
      <div aria-hidden className="animate-aurora pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-primary/15 blur-[90px]" />
      <div className="relative space-y-6">
        <motion.span
          initial={{ scale: 0.4, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ delay: 0.25, type: 'spring', stiffness: 220, damping: 16 }}
          className="ring-gold grid size-16 place-items-center rounded-full bg-surface text-primary"
        >
          {icon}
        </motion.span>
        <div className="space-y-3">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="text-4xl md:text-5xl">{title}</h2>
        </div>
        {children}
      </div>
    </motion.div>
  )
}

// Modo prototipo: recorrido completo sin pedido real; no debe parecer una confirmación
export function SimulatedResult({ state }: { state: Extract<CheckoutState, { status: 'simulated' }> }) {
  return (
    <ResultCard icon={<FlaskConical aria-hidden className="size-7" />} eyebrow="Simulación de prototipo" title={<>Recorrido <em className="text-gold">completado</em></>}>
      <p className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm font-semibold text-foreground">
        Simulación de prototipo: no se ha creado ningún pedido ni se ha realizado ningún cargo.
      </p>
      <dl className="flex flex-col gap-2 border-y border-border py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <dt className="text-sm text-muted-foreground">Subtotal recalculado con los precios oficiales del prototipo</dt>
        <dd className="font-display text-4xl tabular-nums">{formatMoney(state.subtotalCents, state.currency)}</dd>
      </dl>
      <p className="text-sm leading-relaxed text-muted-foreground">
        En la versión real, aquí se iniciaría el pedido con pago pendiente y se verificaría la edad antes de cobrar, solo cuando la marca complete la validación legal y conecte un medio de pago autorizado.
      </p>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/catalogo" size="lg">Volver a la colección</ButtonLink>
        <ButtonLink href="/carrito" size="lg" variant="outline">Ver carrito</ButtonLink>
      </div>
    </ResultCard>
  )
}

// Pedido real iniciado: el pago sigue pendiente, nunca se presenta como compra confirmada
export function OrderStarted({ state }: { state: Extract<CheckoutState, { status: 'started' }> }) {
  return (
    <ResultCard icon={<Hourglass aria-hidden className="size-7" />} eyebrow={`Pedido iniciado · Ref. ${state.reference}`} title={<>Pago <em className="text-gold">pendiente</em></>}>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Hemos registrado tu pedido por un subtotal de <span className="font-semibold text-foreground">{formatMoney(state.subtotalCents, state.currency)}</span>.{' '}
        <strong className="text-foreground">El pago está pendiente</strong>: la integración de pago aún no está disponible, por lo que el pedido no está confirmado ni se ha realizado ningún cargo.
        El equipo te contactará por correo para continuar.
      </p>
      <ButtonLink href={`/contacto?pedido=${state.reference}`} variant="outline">Consultar sobre este pedido</ButtonLink>
    </ResultCard>
  )
}
