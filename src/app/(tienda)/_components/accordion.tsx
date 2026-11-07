'use client'
import { useId, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus } from 'lucide-react'

export interface AccordionItem {
  id: string
  title: ReactNode
  content: ReactNode
}

// Acordeón accesible (botón + región) con una sola sección abierta a la vez
export function Accordion({ items, defaultOpen = null, numbered = false }: { items: AccordionItem[]; defaultOpen?: string | null; numbered?: boolean }) {
  const [open, setOpen] = useState<string | null>(defaultOpen)
  const baseId = useId()

  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((item, i) => {
        const isOpen = open === item.id
        const panelId = `${baseId}-${item.id}`
        return (
          <div key={item.id}>
            <h3 className="text-base">
              <button
                type="button" aria-expanded={isOpen} aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="group flex w-full items-center gap-5 py-6 text-left"
              >
                {numbered && <span className="w-8 shrink-0 font-display text-xl text-primary/70">{String(i + 1).padStart(2, '0')}</span>}
                <span className={`flex-1 font-display text-2xl leading-snug transition-colors md:text-3xl ${isOpen ? 'text-primary' : 'group-hover:text-primary'}`}>{item.title}</span>
                <span className={`grid size-10 shrink-0 place-items-center rounded-full border transition-all duration-500 ${isOpen ? 'rotate-45 border-primary bg-primary text-primary-foreground' : 'border-border-strong group-hover:border-primary/60'}`}>
                  <Plus aria-hidden className="size-4" />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId} role="region"
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className={`pb-7 text-sm leading-relaxed text-muted-foreground md:text-base ${numbered ? 'md:pl-13' : ''}`}>{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
