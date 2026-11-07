// Contenido ILUSTRATIVO del modo prototipo, basado en las vistas de Stitch ("Vanguardia Habanos").
// No es información verificada: precios, fichas e imágenes son de demostración y la cinta
// "Prototipo de demostración" se muestra en toda la tienda mientras este modo está activo.
import type { BrandSettings, Category, ContentPage, Faq, Product, Service } from '@/shared/types/domain'

const UPDATED = '2026-11-07T10:00:00Z'
const NOTICE = 'Producto de tabaco. Venta exclusiva a personas mayores de edad.'
const ILLUSTRATIVE = 'Ficha ilustrativa del prototipo: la descripción oficial la aportará la marca.'

export const DEMO_SETTINGS: BrandSettings = {
  brand_name: 'Vanguardia Habanos',
  tagline: 'La tradición del puro habano, preservada con rigor y presentada con transparencia.',
  description: 'Selección, conservación y asesoría para coleccionistas y aficionados exigentes.',
  currency: 'EUR',
  min_age: 18,
  allowed_regions: ['ES-MD'],
  support_hours: 'Lunes a sábado · 10:00–20:30',
  support_email: 'concierge@ejemplo.invalid',
  support_phone: null,
  // En el prototipo se muestra el recorrido completo; el checkout termina en una simulación explícita
  sales_enabled: true,
  legal_responsible: 'Prototipo (sin validación real)',
  legal_validated_at: UPDATED,
  age_verification_provider: 'simulacion',
  payment_provider: 'simulacion',
  updated_at: UPDATED,
}

export const DEMO_CATEGORIES: Category[] = [
  { id: 'c-robustos', slug: 'robustos', name: 'Robustos', position: 1, active: true },
  { id: 'c-piramides', slug: 'piramides-figurados', name: 'Pirámides y figurados', position: 2, active: true },
  { id: 'c-julietas', slug: 'julietas-churchills', name: 'Julietas y Churchills', position: 3, active: true },
  { id: 'c-gordas', slug: 'gran-cepo', name: 'Gran cepo', position: 4, active: true },
  { id: 'c-accesorios', slug: 'conservacion', name: 'Conservación', position: 5, active: true },
]

type Spec = Pick<Product, 'brand' | 'vitola_galera' | 'ring_gauge' | 'length_mm' | 'strength' | 'tasting_notes'>
type DemoProductInput = Pick<Product, 'slug' | 'name' | 'category_id' | 'presentation' | 'price_cents' | 'stock_status'> &
  Partial<Spec> & { description?: string; images: [file: string, alt: string][] }

// UUID v4 determinista a partir del slug: el checkout valida identificadores como UUID
function demoUuid(slug: string): string {
  let hash = 0
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return `00000000-0000-4000-8000-${hash.toString(16).padStart(12, '0')}`
}

function product({ images, description, ...input }: DemoProductInput): Product {
  const isAccessory = input.category_id === 'c-accesorios'
  return {
    brand: null, vitola_galera: null, ring_gauge: null, length_mm: null, strength: null, tasting_notes: [],
    ...input,
    id: demoUuid(input.slug),
    description: description ?? ILLUSTRATIVE,
    compliance_notice: isAccessory ? null : NOTICE,
    blocked_regions: [],
    active: true,
    updated_at: UPDATED,
    product_images: images.map(([file, alt], position) => ({ id: `i-${input.slug}-${position}`, url: `/stitch/${file}`, alt, position })),
  }
}

export const DEMO_PRODUCTS: Product[] = [
  product({
    slug: 'cohiba-behike-54', name: 'Behike BHK 54', brand: 'Cohiba', category_id: 'c-robustos', vitola_galera: 'Laguito No. 5',
    ring_gauge: 54, length_mm: 144, strength: 4, tasting_notes: ['Cedro añejo', 'Cacao tostado', 'Toffee'],
    presentation: 'Estuche lacado · 10 unidades', price_cents: 185000, stock_status: 'disponible',
    images: [
      ['behike-54-estuche.jpg', 'Puro en estuche de madera lacada negra abierto'],
      ['armario-cedro.jpg', 'Armario de cedro con puros ordenados en bandejas'],
      ['macro-capa.jpg', 'Detalle macro de la capa del puro'],
      ['macro-anilla.jpg', 'Detalle macro de la anilla'],
    ],
  }),
  product({
    slug: 'cohiba-behike-56', name: 'Behike BHK 56', brand: 'Cohiba', category_id: 'c-gordas', vitola_galera: 'Laguito No. 6',
    ring_gauge: 56, length_mm: 166, strength: 4, tasting_notes: ['Cedro', 'Cacao', 'Cuero noble'],
    presentation: 'Unidad · capa colorado', price_cents: 19500, stock_status: 'disponible',
    images: [['behike-56.jpg', 'Puro de gran cepo sobre madera de cedro'], ['behike-56-cedro.jpg', 'Puro apoyado en una caja de cedro']],
  }),
  product({
    slug: 'cohiba-esplendidos', name: 'Espléndidos', brand: 'Cohiba', category_id: 'c-julietas', vitola_galera: 'Julieta No. 2',
    ring_gauge: 47, length_mm: 178, strength: 4, tasting_notes: ['Miel', 'Madera', 'Café'],
    presentation: 'Unidad', price_cents: 6850, stock_status: 'disponible',
    images: [['cohiba-esplendidos.jpg', 'Puro largo de anilla amarilla sobre fondo claro']],
  }),
  product({
    slug: 'montecristo-no-2', name: 'Montecristo No. 2', brand: 'Montecristo', category_id: 'c-piramides', vitola_galera: 'Pirámides',
    ring_gauge: 52, length_mm: 156, strength: 4, tasting_notes: ['Café espresso', 'Madera terrosa', 'Nuez moscada'],
    presentation: 'Unidad', price_cents: 2650, stock_status: 'disponible',
    images: [['montecristo-2.jpg', 'Puro de formato pirámide sobre madera oscura'], ['montecristo-2-pergamino.jpg', 'Puro de formato pirámide sobre fondo claro']],
  }),
  product({
    slug: 'partagas-serie-d-4', name: 'Serie D No. 4', brand: 'Partagás', category_id: 'c-robustos', vitola_galera: 'Robustos',
    ring_gauge: 50, length_mm: 124, strength: 5, tasting_notes: ['Tierra húmeda', 'Cuero oscuro', 'Especias'],
    presentation: 'Unidad', price_cents: 1980, stock_status: 'disponible',
    images: [['partagas-d4.jpg', 'Puro robusto de anilla roja sobre madera clara'], ['partagas-caja.jpg', 'Caja de madera cerrada']],
  }),
  product({
    slug: 'romeo-y-julieta-churchills', name: 'Churchills', brand: 'Romeo y Julieta', category_id: 'c-julietas', vitola_galera: 'Julieta No. 2',
    ring_gauge: 47, length_mm: 178, strength: 3, tasting_notes: ['Cedro', 'Floral suave'],
    presentation: 'Tubo individual de aluminio', price_cents: 2600, stock_status: 'consultar',
    images: [['romeo-churchill-tubo.jpg', 'Puro junto a su tubo de aluminio']],
  }),
  product({
    slug: 'hoyo-de-monterrey-epicure-2', name: 'Epicure No. 2', brand: 'Hoyo de Monterrey', category_id: 'c-robustos', vitola_galera: 'Robustos',
    ring_gauge: 50, length_mm: 124, strength: 2, tasting_notes: ['Vainilla', 'Crema', 'Frutos secos'],
    presentation: 'Unidad', price_cents: 1850, stock_status: 'disponible',
    images: [['hoyo-epicure-2.jpg', 'Puro robusto con doble anilla sobre cedro']],
  }),
  product({
    slug: 'trinidad-vigia', name: 'Vigía', brand: 'Trinidad', category_id: 'c-gordas', vitola_galera: 'Torres',
    ring_gauge: 54, length_mm: 110, strength: 3, tasting_notes: ['Vainilla', 'Frutos secos', 'Miel'],
    presentation: 'Unidad', price_cents: 3800, stock_status: 'agotado',
    images: [['trinidad-vigia.jpg', 'Puro corto de gran cepo sobre piedra']],
  }),
  product({
    slug: 'armario-humidor-cedro', name: 'Armario humidor de cedro', category_id: 'c-accesorios',
    presentation: 'Cedro español · bandejas extraíbles', price_cents: 245000, stock_status: 'consultar',
    description: 'Armario de conservación en cedro con bandejas extraíbles e iluminación interior. Ficha ilustrativa del prototipo.',
    images: [['armario-cedro.jpg', 'Armario humidor de cedro abierto con bandejas']],
  }),
]

export const DEMO_FAQS: Faq[] = [
  { id: 'f1', question: '¿Puedo comprar online?', answer: 'La compra online se activará cuando la marca complete la validación legal. Mientras tanto puedes dejar tu solicitud y un asesor te atenderá.', position: 1, published: true, responsible: 'Prototipo', updated_at: UPDATED },
  { id: 'f2', question: '¿Cómo hablo con una persona?', answer: 'Desde el formulario de contacto, desde cualquier ficha de producto o pidiéndoselo al sommelier virtual.', position: 2, published: true, responsible: 'Prototipo', updated_at: UPDATED },
  { id: 'f3', question: '¿Por qué me piden confirmar mi edad?', answer: 'Los productos de tabaco solo pueden ofrecerse a personas adultas. Para comprar se pedirá además una verificación de edad.', position: 3, published: true, responsible: 'Prototipo', updated_at: UPDATED },
  { id: 'f4', question: '¿Qué significan cepo y longitud?', answer: 'El cepo es el diámetro del puro en 64avos de pulgada y la longitud se indica en milímetros. Ambos definen la vitola.', position: 4, published: true, responsible: 'Prototipo', updated_at: UPDATED },
]

export const DEMO_SERVICES: Service[] = [
  { id: 's1', name: 'Catas privadas', description: 'Sesiones guiadas por especialistas en la cava o en espacios privados, centradas en el origen, la elaboración y las vitolas.', conditions: 'Reserva previa · grupos reducidos.', availability: 'Bajo solicitud', published: true, responsible: 'Prototipo', updated_at: UPDATED },
  { id: 's2', name: 'Humidificación a medida', description: 'Asesoría para el diseño y mantenimiento de armarios humidores de colección.', conditions: 'Visita técnica con presupuesto previo.', availability: 'Lunes a viernes', published: true, responsible: 'Prototipo', updated_at: UPDATED },
  { id: 's3', name: 'Peritaje de colecciones', description: 'Revisión del estado de conservación y catalogación de colecciones particulares.', conditions: 'Presupuesto según volumen.', availability: 'Con cita previa', published: true, responsible: 'Prototipo', updated_at: UPDATED },
]

export const DEMO_PAGES: ContentPage[] = [
  { slug: 'privacidad', title: 'Política de privacidad', body: 'Texto ilustrativo del prototipo. La política oficial debe redactarla la marca con asesoría legal.', published: true, responsible: 'Prototipo', updated_at: UPDATED },
  { slug: 'condiciones', title: 'Condiciones de compra', body: 'Texto ilustrativo del prototipo pendiente de revisión legal.', published: true, responsible: 'Prototipo', updated_at: UPDATED },
]
