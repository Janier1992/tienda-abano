import Image from 'next/image'
import { ImageOff } from 'lucide-react'
import { publicEnv } from '@/shared/lib/env'
import type { ProductImage as ProductImageType } from '@/shared/types/domain'

// Se optimizan las imágenes propias (public/) y las del bucket de Supabase; los SVG se sirven tal cual
function isOptimizable(url: string): boolean {
  if (url.endsWith('.svg')) return false
  if (url.startsWith('/')) return true
  return Boolean(publicEnv.supabaseUrl) && url.startsWith(`${publicEnv.supabaseUrl}/storage/v1/object/public/`)
}

interface Props {
  image: ProductImageType | undefined
  sizes: string
  priority?: boolean
  className?: string
}

// Imagen con zoom suave al pasar el cursor sobre el elemento padre `.group`
export function ProductImage({ image, sizes, priority = false, className = 'aspect-[4/3]' }: Props) {
  if (!image) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 rounded bg-surface text-xs text-muted-foreground ${className}`}>
        <ImageOff aria-hidden className="size-6 opacity-60" />
        Fotografía oficial pendiente
      </div>
    )
  }
  return (
    <div className={`relative overflow-hidden rounded bg-surface ${className}`}>
      <Image
        src={image.url} alt={image.alt} fill sizes={sizes} priority={priority} unoptimized={!isOptimizable(image.url)}
        className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
      />
    </div>
  )
}
