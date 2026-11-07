'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowUpRight, CheckCircle2, QrCode, ShieldCheck, Snowflake, Sparkles, Thermometer } from 'lucide-react'
import { OPEN_ASSISTANT_EVENT } from '@/app/(tienda)/_components/site-header'

interface HeroProps {
  brandName: string
  tagline: string | null
  images: { url: string; alt: string }[]
}

const EASE = [0.22, 1, 0.36, 1] as const

export function Hero({ brandName, tagline, images }: HeroProps) {
  const mainImage = images[0]?.url || '/stitch/hero-humidor.jpg'
  const mainAlt = images[0]?.alt || 'Humidor de cedro español con vitolas reposadas'

  const handleOpenAssistant = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(OPEN_ASSISTANT_EVENT))
    }
  }

  return (
    <>
      <section className="relative w-full overflow-hidden border-b border-border bg-card">
        {/* Grilla editorial de 12 columnas (Stitch) */}
        <div className="mx-auto grid min-h-[640px] max-w-[1440px] grid-cols-1 lg:grid-cols-12">
          {/* Columna Izquierda: Narrativa Editorial (7 columnas) */}
          <div className="z-10 flex flex-col justify-center px-5 py-12 md:px-8 md:py-20 lg:col-span-7 xl:px-16">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="mb-4 flex items-center gap-2"
            >
              <span className="h-px w-8 bg-accent" />
              <span className="label-gold">Cava de Selección Magistral · Vuelta Abajo D.O.P.</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
              className="mb-6 font-display text-4xl leading-[1.08] text-ink sm:text-5xl lg:text-[3.75rem]"
            >
              La Tradición Centenaria del Puro Habano,{' '}
              <em className="text-primary italic">Preservada con Rigor Oficial.</em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="mb-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              {tagline ??
                'Cada vitola es custodiada bajo bóvedas de cedro español a 18°C estables y 70% HR. Certificación de origen indiscutible, timbre holográfico fiscal inviolable y despacho en embalajes isotérmicos protegidos.'}
            </motion.p>

            {/* Botones de acción */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
              className="mb-10 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 rounded border border-accent bg-ink px-6 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-ink-foreground shadow-sm transition hover:bg-cedar"
              >
                <span>Explorar Catálogo Certificado</span>
                <ArrowUpRight className="size-4 text-accent" />
              </Link>

              <button
                type="button"
                onClick={handleOpenAssistant}
                className="inline-flex items-center gap-2.5 rounded border border-border bg-surface px-6 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-ink transition hover:border-accent hover:bg-accent-soft/30"
              >
                <Sparkles className="size-4 text-primary" />
                <span>Consultar al Sommelier Digital</span>
              </button>
            </motion.div>

            {/* Métricas de Cava en Tiempo Real (Stitch) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="grid max-w-lg grid-cols-3 gap-3 border-t border-border pt-6"
            >
              <div className="flex flex-col border border-border bg-surface/70 p-3">
                <span className="font-display text-xl text-primary md:text-2xl">18.0°C</span>
                <span className="label-gold mt-1 !text-[0.6rem] text-muted-foreground">Temperatura Bóveda</span>
              </div>
              <div className="flex flex-col border border-border bg-surface/70 p-3">
                <span className="font-display text-xl text-primary md:text-2xl">70% HR</span>
                <span className="label-gold mt-1 !text-[0.6rem] text-muted-foreground">Higrometría Constante</span>
              </div>
              <div className="flex flex-col border border-border bg-surface/70 p-3">
                <span className="font-display text-xl text-primary md:text-2xl">100%</span>
                <span className="label-gold mt-1 !text-[0.6rem] text-muted-foreground">Trazabilidad Fiscal</span>
              </div>
            </motion.div>
          </div>

          {/* Columna Derecha: Escaparate Fotográfico Editorial (5 columnas) */}
          <div className="relative flex items-center justify-center border-t border-border bg-surface p-5 md:p-8 lg:col-span-5 lg:border-l lg:border-t-0 xl:p-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: EASE }}
              className="relative aspect-[4/3] w-full min-h-[380px] overflow-hidden rounded border border-border bg-card shadow-lg lg:min-h-[480px]"
            >
              <Image
                src={mainImage}
                alt={mainAlt}
                fill
                priority
                unoptimized
                sizes="(min-width: 1024px) 42vw, 95vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-6 text-ink-foreground"
              >
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <span className="label-gold !text-[0.6rem] text-accent">Cava Subterránea No. 4</span>
                    <p className="font-display text-sm text-ink-foreground md:text-base">
                      Lote Especial de Añejamiento Cohiba 2017
                    </p>
                  </div>
                  <span className="shrink-0 rounded border border-accent/60 bg-accent px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ink">
                    Precintado
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Barra de Garantías Oficiales y Trazabilidad (Stitch) */}
      <section className="w-full border-b border-border bg-surface/70 py-6">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-5 sm:grid-cols-2 md:px-8 lg:grid-cols-4 xl:px-16">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded border border-border bg-card text-primary shadow-xs">
              <CheckCircle2 className="size-5 text-accent" />
            </div>
            <div>
              <h4 className="label-spec text-xs uppercase text-ink">D.O.P. Vuelta Abajo</h4>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Denominación de Origen Protegida con precinto oficial Habanos S.A.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded border border-border bg-card text-primary shadow-xs">
              <QrCode className="size-5 text-accent" />
            </div>
            <div>
              <h4 className="label-spec text-xs uppercase text-ink">Holograma & Trazabilidad</h4>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Lectura óptica directa del código de barra y fábrica en cada cajón.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded border border-border bg-card text-primary shadow-xs">
              <Snowflake className="size-5 text-accent" />
            </div>
            <div>
              <h4 className="label-spec text-xs uppercase text-ink">Tránsito Climatizado</h4>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Sobres Boveda® activos 69% HR en paquetes herméticos sellados.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded border border-border bg-card text-primary shadow-xs">
              <ShieldCheck className="size-5 text-accent" />
            </div>
            <div>
              <h4 className="label-spec text-xs uppercase text-ink">Especialistas Certificados</h4>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Asesoramiento personal homologado por Habanosommelier Senior.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
