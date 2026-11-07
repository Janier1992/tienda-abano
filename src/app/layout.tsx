import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google'
import { CartProvider } from '@/features/carrito/cart-provider'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })
const playfair = Playfair_Display({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: { default: 'Tienda oficial', template: '%s · Tienda oficial' },
  description: 'Catálogo, atención y pedidos de la marca. Sitio exclusivo para personas adultas.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { themeColor: '#FBF9F5' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${jakarta.variable} ${playfair.variable}`}>
      <body className="min-h-screen overflow-x-hidden">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
