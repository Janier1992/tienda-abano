'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ShieldCheck } from 'lucide-react'
import type { Product } from '@/shared/types/domain'
import { ProductImage } from '../../_components/product-image'

export function Gallery({ product }: { product: Product }) {
  const images = product.product_images
  const [index, setIndex] = useState(0)
  const current = images[index]

  return (
    <div className="space-y-4">
      {/* Marco principal de la vitola (Stitch 4:3 con insignias oficiales) */}
      <div className="group relative overflow-hidden rounded border border-border bg-card shadow-sm transition hover:border-accent">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current?.id ?? 'vacio'}
            initial={{ opacity: 0, scale: 1.01 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ProductImage
              image={current}
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              className="aspect-[4/3] rounded-none object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Insignias de linaje y origen (Stitch) */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 sm:left-4 sm:top-4">
          <span className="rounded bg-ink/90 px-2.5 py-1 label-gold !text-[0.6rem] text-ink-foreground backdrop-blur-xs">
            Edición Regulada · D.O.P.
          </span>
          {product.brand && (
            <span className="rounded bg-accent px-2.5 py-1 label-gold !text-[0.6rem] text-ink shadow-xs">
              {product.brand} Oficial
            </span>
          )}
        </div>

        {/* Verificación de Precinto Holográfico */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded border border-border/80 bg-card/95 px-3 py-1 text-xs text-ink shadow-xs backdrop-blur-sm sm:bottom-4 sm:right-4">
          <ShieldCheck className="size-3.5 text-accent" />
          <span className="label-gold !text-[0.55rem] text-primary">Precinto Fiscal & Holograma Verificado</span>
        </div>
      </div>

      {/* Miniaturas de artesano (Stitch) */}
      {images.length > 1 && (
        <ul className="grid grid-cols-4 gap-3 sm:grid-cols-5" aria-label="Imágenes del producto">
          {images.map((image, i) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ver imagen ${i + 1}: ${image.alt}`}
                aria-pressed={i === index}
                className={`group block w-full overflow-hidden rounded border transition-all ${
                  i === index
                    ? 'border-accent shadow-xs'
                    : 'border-border opacity-70 hover:border-border-strong hover:opacity-100'
                }`}
              >
                <ProductImage image={image} sizes="12vw" className="aspect-[16/10] rounded-none object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
