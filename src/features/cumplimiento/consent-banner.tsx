'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/shared/components/ui/button'

export const CONSENT_KEY = 'consentimiento_analitica'

export function hasAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'aceptado'
  } catch {
    return false
  }
}

// Medición solo con consentimiento explícito; rechazar es tan fácil como aceptar
export function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let decided = false
    try {
      decided = localStorage.getItem(CONSENT_KEY) !== null
    } catch {
      decided = false
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única de almacenamiento del navegador
    setVisible(!decided)
  }, [])

  // Marca el documento para que los elementos flotantes (asistente) no queden tapados por el aviso
  useEffect(() => {
    document.documentElement.toggleAttribute('data-aviso-privacidad', visible)
  }, [visible])

  if (!visible) return null

  const decide = (value: 'aceptado' | 'rechazado') => {
    try {
      localStorage.setItem(CONSENT_KEY, value)
    } catch {
      // Sin almacenamiento se trata como rechazado
    }
    setVisible(false)
  }

  return (
    <div role="region" aria-label="Preferencias de privacidad" className="fixed inset-x-3 bottom-3 z-40 md:inset-x-auto md:bottom-6 md:left-6 md:max-w-md">
      <div className="glass ring-gold space-y-4 rounded-3xl p-5 text-sm shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
        <p className="eyebrow">Tu privacidad</p>
        <p className="leading-relaxed text-muted-foreground">
          Usamos medición anónima de navegación solo si lo aceptas. No usamos datos personales para publicidad.{' '}
          <Link href="/politicas/privacidad" className="text-foreground underline underline-offset-4">Política de privacidad</Link>
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" onClick={() => decide('rechazado')}>Rechazar</Button>
          <Button size="sm" onClick={() => decide('aceptado')}>Aceptar</Button>
        </div>
      </div>
    </div>
  )
}
