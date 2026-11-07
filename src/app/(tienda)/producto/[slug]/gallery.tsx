'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Product } from '@/shared/types/domain'
import { ProductImage } from '../../_components/product-image'

// Galería con imagen principal y miniaturas; el cambio de imagen se funde suavemente
export function Gallery({ product }: { product: Product }) {
  const images = product.product_images
  const [index, setIndex] = useState(0)
  const current = images[index]

  return (
    <div className="space-y-4">
      <div className="group ring-gold relative overflow-hidden rounded-[2rem] shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={current?.id ?? 'vacio'} initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <ProductImage image={current} sizes="(min-width: 1024px) 55vw, 100vw" priority className="aspect-[4/5] rounded-none" />
          </motion.div>
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <ul className="grid grid-cols-5 gap-3" aria-label="Imágenes del producto">
          {images.map((image, i) => (
            <li key={image.id}>
              <button
                type="button" onClick={() => setIndex(i)} aria-label={`Ver imagen ${i + 1}: ${image.alt}`} aria-pressed={i === index}
                className={`group block w-full overflow-hidden rounded-xl border-2 transition-all ${i === index ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <ProductImage image={image} sizes="10vw" className="aspect-square rounded-none" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
