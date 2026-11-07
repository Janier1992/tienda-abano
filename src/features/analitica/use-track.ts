'use client'
import { useCallback } from 'react'
import { hasAnalyticsConsent } from '@/features/cumplimiento/consent-banner'
import type { EventName } from './events'
import { trackEvent } from './track'

// Registra eventos solo con consentimiento; nunca bloquea la interfaz si falla.
// La ruta se lee al enviar el evento (no al renderizar) para no suspender rutas dinámicas.
export function useTrack() {
  return useCallback((name: EventName, props?: Record<string, string | number>) => {
    if (!hasAnalyticsConsent()) return
    trackEvent({ name, path: window.location.pathname, props }).catch(() => undefined)
  }, [])
}
