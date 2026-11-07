'use client'
import { createContext, use, useEffect, useReducer, useState, type ReactNode } from 'react'
import { cartReducer, type CartAction, type CartLine } from './domain/cart'

// El carrito vive solo en esta pestaña (sessionStorage) mientras dura la sesión; así se informa al usuario.
const STORAGE_KEY = 'carrito'

interface CartContextValue {
  lines: CartLine[]
  dispatch: (action: CartAction) => void
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, [])
  const [drawerOpen, setDrawerOpen] = useState(false)
  // Estado (no ref): solo se guarda tras aplicar lo recuperado, evitando sobrescribirlo con un carrito vacío
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) dispatch({ type: 'hydrate', lines: JSON.parse(raw) as CartLine[] })
    } catch {
      // Almacenamiento no disponible o corrupto: se empieza con carrito vacío
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única de almacenamiento del navegador
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      // Sin almacenamiento el carrito sigue funcionando en memoria
    }
  }, [lines, hydrated])

  return <CartContext value={{ lines, dispatch, drawerOpen, setDrawerOpen }}>{children}</CartContext>
}

export function useCart() {
  const context = use(CartContext)
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider')
  return context
}
