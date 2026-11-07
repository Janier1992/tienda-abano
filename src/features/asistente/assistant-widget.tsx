'use client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowUp, MessageCircle, Sparkles, UserRound, X } from 'lucide-react'
import { useTrack } from '@/features/analitica/use-track'
import { ChatMessage, HandoffForm, TypingIndicator } from './chat-message'
import { buildHandoffSummary, isBlank, MAX_TEXT_LENGTH } from './guardrails'

const transport = new DefaultChatTransport({ api: '/api/chat' })

const SUGGESTIONS = ['¿Qué me recomiendas para empezar?', '¿Cómo funciona la compra?', '¿Qué servicios ofrecéis?']

function ChatError({ message }: { message: string }) {
  if (message.includes('asistente_no_configurado')) {
    return (
      <div role="status" className="glass space-y-3 rounded-2xl p-4 text-sm">
        <p className="font-semibold">El asistente no está disponible por ahora</p>
        <p className="text-muted-foreground">Mientras tanto, puedes resolver tus dudas aquí:</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/preguntas-frecuentes" className="rounded-full border border-border-strong px-3 py-1.5 text-xs hover:border-primary hover:text-primary">Preguntas frecuentes</Link>
          <Link href="/contacto" className="rounded-full border border-border-strong px-3 py-1.5 text-xs hover:border-primary hover:text-primary">Contactar al equipo</Link>
        </div>
      </div>
    )
  }
  const text = message.includes('limite')
    ? 'Has enviado muchos mensajes seguidos. Espera un minuto e inténtalo de nuevo.'
    : 'No pudimos obtener respuesta. Inténtalo de nuevo o pulsa «Hablar con una persona».'
  return <p role="alert" className="rounded-2xl border border-danger/30 bg-danger/[0.07] p-4 text-sm">{text}</p>
}

function Welcome({ onPick, disabled }: { onPick: (text: string) => void; disabled: boolean }) {
  return (
    <div className="space-y-5">
      <div className="glass space-y-2 rounded-2xl rounded-tl-md p-4 text-sm leading-relaxed">
        <p className="font-semibold">Hola, ¿en qué podemos ayudarte?</p>
        <p className="text-muted-foreground">
          Soy un asistente automatizado: respondo con la información oficial publicada por la marca y, si lo necesitas, te paso con una persona del equipo.
        </p>
      </div>
      <div className="space-y-2">
        <p className="eyebrow !text-[0.6rem]">Sugerencias</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((text) => (
            <button
              key={text} type="button" disabled={disabled} onClick={() => onPick(text)}
              className="rounded-full border border-border-strong bg-surface/60 px-3.5 py-2 text-left text-xs transition hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary disabled:opacity-40"
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AssistantWidget({ supportHours }: { supportHours: string | null }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [handoff, setHandoff] = useState<string | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const handoffRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const track = useTrack()
  const { messages, sendMessage, status, error } = useChat({ transport })
  const busy = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Desplazamiento suave al último mensaje
  useEffect(() => {
    const box = scrollRef.current
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: reduce ? 'auto' : 'smooth' })
  }, [messages, status, error, reduce])

  // Al derivar, se muestra el formulario desde su inicio
  useEffect(() => {
    if (handoff !== null) handoffRef.current?.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' })
  }, [handoff, reduce])

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  const send = (text: string) => {
    if (busy || isBlank(text)) return
    sendMessage({ text: text.slice(0, MAX_TEXT_LENGTH) })
    track('asistente_mensaje')
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    send(input)
    setInput('')
  }

  const askHuman = () => {
    setHandoff(buildHandoffSummary(messages))
    track('asistente_derivacion')
  }

  return (
    <>
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls="asistente-panel"
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="assistant-launcher shine fixed bottom-5 right-5 z-30 inline-flex items-center gap-2.5 rounded-full bg-gradient-to-br from-[hsl(42_70%_80%)] via-primary to-[hsl(32_48%_50%)] p-3 text-sm sm:py-3 sm:pl-3.5 sm:pr-5 font-semibold text-primary-foreground shadow-[0_14px_40px_-10px_hsl(40_60%_55%/0.65)] transition-[bottom,transform] duration-500 hover:-translate-y-0.5"
      >
        {!open && <span aria-hidden className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/30 [animation-duration:2.6s]" />}
        <span className="grid size-7 place-items-center rounded-full bg-primary-foreground/15">
          {open ? <X aria-hidden className="size-4" /> : <MessageCircle aria-hidden className="size-4" />}
        </span>
        {/* En móvil solo el icono, para no tapar el contenido */}
        <span className="sr-only sm:not-sr-only">{open ? 'Cerrar' : '¿Te ayudamos?'}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.section
            id="asistente-panel"
            role="dialog"
            aria-modal="false"
            aria-labelledby="asistente-titulo"
            onKeyDown={(event) => event.key === 'Escape' && close()}
            initial={reduce ? false : { opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            style={{ transformOrigin: 'bottom right' }}
            className="ring-gold fixed inset-0 z-50 bg-gradient-to-b from-elevated/[0.97] to-card/[0.98] backdrop-blur-2xl flex flex-col overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[min(640px,calc(100vh-8rem))] sm:w-[400px] sm:rounded-[1.75rem]"
          >
            <PanelHeader onClose={close} />

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5" aria-live="polite">
              {messages.length === 0 && <Welcome onPick={send} disabled={busy} />}
              <ol className="space-y-4">
                {messages.map((message) => <ChatMessage key={message.id} message={message} />)}
              </ol>
              {busy && messages.at(-1)?.role === 'user' && <TypingIndicator />}
              {error && <ChatError message={error.message} />}
              {handoff !== null && <div ref={handoffRef} className="scroll-mt-2"><HandoffForm summary={handoff} hours={supportHours} /></div>}
            </div>

            <form onSubmit={submit} className="space-y-3 border-t border-border bg-background/40 px-4 pb-4 pt-3">
              <label htmlFor="asistente-entrada" className="sr-only">Escribe tu consulta</label>
              <div className="flex items-end gap-2 rounded-2xl border border-border-strong bg-surface/80 p-1.5 pl-4 transition focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15">
                <textarea
                  id="asistente-entrada"
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) submit(event)
                  }}
                  maxLength={MAX_TEXT_LENGTH}
                  rows={1}
                  placeholder="Escribe tu consulta…"
                  // El foco lo indica el anillo del contenedor; se evita el doble contorno global
                  style={{ outline: 'none' }}
                  className="max-h-28 flex-1 resize-none bg-transparent py-2 text-sm placeholder:text-muted-foreground/70"
                />
                <button
                  type="submit" disabled={busy || isBlank(input)} aria-label="Enviar mensaje"
                  className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition hover:brightness-110 disabled:opacity-30"
                >
                  <ArrowUp aria-hidden className="size-4" />
                </button>
              </div>
              <button type="button" onClick={askHuman} className="flex w-full items-center justify-center gap-2 rounded-full py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground">
                <UserRound aria-hidden className="size-3.5" /> Hablar con una persona
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}

function PanelHeader({ onClose }: { onClose: () => void }) {
  return (
    <header className="relative flex items-center gap-3 border-b border-border px-5 py-4">
      <div aria-hidden className="pointer-events-none absolute -top-16 right-0 h-32 w-48 rounded-full bg-primary/15 blur-3xl" />
      <span aria-hidden className="ring-gold relative grid size-10 place-items-center rounded-full bg-surface text-primary">
        <Sparkles className="size-4" />
        <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-success" />
      </span>
      <div className="relative min-w-0 flex-1">
        <h2 id="asistente-titulo" className="font-display text-2xl leading-none">Asistente</h2>
        <p className="mt-1 text-xs text-muted-foreground">Respuesta automática · información oficial</p>
      </div>
      <button type="button" onClick={onClose} aria-label="Cerrar asistente" className="relative grid size-9 place-items-center rounded-full transition hover:bg-muted">
        <X aria-hidden className="size-4" />
      </button>
    </header>
  )
}
