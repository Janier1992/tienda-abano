'use client'
import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowUpRight, Search, UserRound } from 'lucide-react'
import { getToolName, isToolUIPart, type UIMessage } from 'ai'
import { SupportForm } from '@/features/atencion/support-form'
import { isHandoffOutput, isProductListOutput, type ProductHit } from './types'

// Mini tarjetas de producto devueltas por la búsqueda oficial
function ProductList({ products }: { products: ProductHit[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {products.map((product) => (
        <li key={product.url}>
          <Link href={product.url} className="group flex items-center gap-3 rounded-xl border border-border bg-background/50 p-2 pr-3 transition hover:border-primary/40 hover:bg-background">
            <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#b9774a] via-[#8e5532] to-[#5e3520] font-display text-lg italic text-[#f1d79b]">
              {product.nombre.charAt(0)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold group-hover:text-primary">{product.nombre}</span>
              <span className="block truncate text-xs text-muted-foreground">{product.precio} · {product.disponibilidad}</span>
            </span>
            <ArrowUpRight aria-hidden className="size-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function HandoffForm({ summary, hours }: { summary: string; hours: string | null }) {
  return (
    // El panel es estrecho: el formulario se fuerza a una sola columna
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="ring-gold space-y-3 rounded-2xl bg-card/80 p-4 [&_.grid]:grid-cols-1">

      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-primary/15 text-primary"><UserRound aria-hidden className="size-4" /></span>
        <p className="text-sm font-semibold">Continuar con una persona del equipo</p>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {hours ? `Horario de atención: ${hours}.` : 'El horario de atención no está publicado.'} Te responderemos por correo; no es una confirmación de compra.
      </p>
      <SupportForm context={{ origin: 'asistente' }} defaultType="derivacion_asistente" allowTypeChoice={false} defaultMessage={summary} />
    </motion.div>
  )
}

// Tres puntos animados mientras el asistente prepara la respuesta
export function TypingIndicator() {
  return (
    <div role="status" aria-label="El asistente está escribiendo" className="glass inline-flex items-center gap-1.5 rounded-2xl rounded-tl-md px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i} aria-hidden className="size-1.5 rounded-full bg-primary"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

type Part = UIMessage['parts'][number]

function ToolPart({ part }: { part: Part }) {
  if (!isToolUIPart(part)) return null
  const name = getToolName(part)
  if (part.state === 'input-streaming' || part.state === 'input-available') {
    return (
      <p className="flex items-center gap-2 text-xs italic text-muted-foreground">
        <Search aria-hidden className="size-3.5 animate-pulse text-primary" /> Consultando información oficial…
      </p>
    )
  }
  if (part.state !== 'output-available') return null
  if (name === 'buscarProductos' && isProductListOutput(part.output)) return <ProductList products={part.output.productos} />
  if (name === 'prepararDerivacion' && isHandoffOutput(part.output)) {
    return <HandoffForm summary={part.output.resumen} hours={part.output.horario} />
  }
  return null
}

export function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user'
  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      className={isUser ? 'flex justify-end' : 'flex justify-start'}
    >
      <div
        className={`max-w-[88%] space-y-1 px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'rounded-2xl rounded-tr-md border border-primary/25 bg-gradient-to-br from-primary/25 to-primary/10 text-foreground'
            : 'glass rounded-2xl rounded-tl-md text-foreground'
        }`}
      >
        <span className="sr-only">{isUser ? 'Tú:' : 'Asistente:'}</span>
        {message.parts.map((part, index) =>
          part.type === 'text'
            ? <p key={index} className="whitespace-pre-wrap">{part.text}</p>
            : <ToolPart key={index} part={part} />,
        )}
      </div>
    </motion.li>
  )
}
