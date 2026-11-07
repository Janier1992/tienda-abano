'use client'
import { useRef } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { ButtonLink } from '@/shared/components/ui/button'

interface HeroProps {
  brandName: string
  tagline: string | null
  images: { url: string; alt: string }[]
}

const EASE = [0.22, 1, 0.36, 1] as const

// Portada cinematográfica: luz en movimiento, titular editorial y composición flotante con parallax
export function Hero({ brandName, tagline, images }: HeroProps) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yBack = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -120])
  const yFront = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -220])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0])

  return (
    <section ref={ref} className="relative isolate -mt-18 flex min-h-[100svh] items-center overflow-hidden pt-24 md:-mt-20">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="animate-aurora absolute -left-40 top-10 h-[34rem] w-[34rem] rounded-full bg-[hsl(32_70%_45%/0.22)] blur-[130px]" />
        <div className="animate-aurora absolute right-[-10rem] top-1/3 h-[40rem] w-[40rem] rounded-full bg-[hsl(42_70%_60%/0.14)] blur-[150px] [animation-delay:-6s]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,hsl(var(--background))_75%)]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      </div>

      <motion.div style={{ opacity: fade }} className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 md:px-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-8">
          <motion.p className="eyebrow" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
            {brandName} · Casa de selección
          </motion.p>
          <h1 className="text-[3.4rem] leading-[0.95] sm:text-7xl lg:text-[6.5rem]">
            {['El arte de', 'elegir', 'con calma.'].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-2">
                <motion.span
                  className={`block ${i === 1 ? 'text-gold italic' : ''}`}
                  initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.15 + i * 0.12, ease: EASE }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p className="max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 1 }}>
            {tagline ?? 'Propuesta de valor pendiente de configuración por la marca.'}
          </motion.p>
          <motion.div className="flex flex-wrap gap-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.8, ease: EASE }}>
            <ButtonLink href="/catalogo" size="lg">Descubrir la colección <ArrowRight className="size-4" /></ButtonLink>
            <ButtonLink href="/contacto" size="lg" variant="secondary">Hablar con un asesor</ButtonLink>
          </motion.div>
        </div>

        <HeroComposition images={images} yBack={yBack} yFront={yFront} />
      </motion.div>

      <motion.a
        href="#descubrir" aria-label="Bajar al contenido"
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground md:flex"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
      >
        Descubrir <ArrowDown className="animate-float size-4 text-primary" />
      </motion.a>
    </section>
  )
}

type MotionY = ReturnType<typeof useTransform<number, number>>

function HeroComposition({ images, yBack, yFront }: { images: HeroProps['images']; yBack: MotionY; yFront: MotionY }) {
  const [main, second, third] = images
  if (!main) return null
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md lg:max-w-none">
      <motion.div style={{ y: yBack }} className="absolute inset-[6%_10%_10%_6%]">
        <motion.div
          className="ring-gold relative h-full overflow-hidden rounded-[2.5rem] shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)]"
          initial={{ opacity: 0, scale: 0.92, rotate: -3 }} animate={{ opacity: 1, scale: 1, rotate: -2 }} transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
        >
          <Image src={main.url} alt={main.alt} fill priority unoptimized sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" />
        </motion.div>
      </motion.div>
      {second && (
        <motion.div style={{ y: yFront }} className="absolute -right-2 bottom-0 w-[44%] md:-right-6">
          <motion.div
            className="glass ring-gold animate-float relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: EASE, delay: 0.6 }}
          >
            <Image src={second.url} alt={second.alt} fill unoptimized sizes="20vw" className="object-cover" />
          </motion.div>
        </motion.div>
      )}
      {third && (
        <motion.div style={{ y: yFront }} className="absolute -left-2 top-4 w-[34%] md:-left-8">
          <motion.div
            className="glass ring-gold animate-float relative aspect-square overflow-hidden rounded-3xl shadow-2xl [animation-delay:-3s]"
            initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: EASE, delay: 0.8 }}
          >
            <Image src={third.url} alt={third.alt} fill unoptimized sizes="15vw" className="object-cover" />
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
