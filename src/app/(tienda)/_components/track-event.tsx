'use client'
import { useEffect } from 'react'
import type { EventName } from '@/features/analitica/events'
import { useTrack } from '@/features/analitica/use-track'

// Registra un evento al mostrarse (solo con consentimiento, lo comprueba useTrack)
export function TrackEvent({ name, props }: { name: EventName; props?: Record<string, string | number> }) {
  const track = useTrack()
  const key = JSON.stringify(props ?? {})
  useEffect(() => {
    track(name, JSON.parse(key) as Record<string, string | number>)
  }, [track, name, key])
  return null
}
