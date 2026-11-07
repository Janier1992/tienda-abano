'use client'
import { useEffect, useState, type FormEvent } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'motion/react'
import { BadgeCheck } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { checkAge } from './domain/age'

const STORAGE_KEY = 'aviso_edad_aceptado'
const INPUT = 'w-full rounded border border-border bg-card px-3 py-2.5 text-center text-sm tabular-nums focus:border-accent focus:outline-none'

type Stage = 'cargando' | 'pendiente' | 'aceptado' | 'rechazado'

// Puerta de acceso con fecha de nacimiento. Es una DECLARACIÓN: la fecha no se guarda y la compra
// exige además el proveedor de verificación de edad configurado por la marca.
export function AgeNotice({ minAge, brandName }: { minAge: number; brandName: string }) {
  const [stage, setStage] = useState<Stage>('cargando')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let accepted = false
    try {
      accepted = localStorage.getItem(STORAGE_KEY) === 'si'
    } catch {
      // Sin almacenamiento se vuelve a mostrar el aviso
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única de almacenamiento del navegador
    setStage(accepted ? 'aceptado' : 'pendiente')
  }, [])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (data.get('declaracion') !== 'on') return setError('Debes confirmar la declaración para continuar.')
    const result = checkAge(Number(data.get('dia')), Number(data.get('mes')), Number(data.get('anio')), minAge)
    if (result === 'fecha_invalida') return setError('Revisa la fecha: no es válida.')
    if (result === 'menor') return setStage('rechazado')
    try {
      localStorage.setItem(STORAGE_KEY, 'si')
    } catch {
      // Se acepta solo para esta visita
    }
    setStage('aceptado')
  }

  return (
    <AnimatePresence>
      {(stage === 'pendiente' || stage === 'rechazado') && (
        <motion.div role="dialog" aria-modal="true" aria-labelledby="aviso-edad-titulo"
          className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-ink/85 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.5 } }}>
          <motion.div className="double-gold w-full max-w-lg rounded bg-background p-7 md:p-10"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}>
            <div className="space-y-3 text-center">
              <Image src="/stitch/emblema.png" alt="" width={56} height={54} className="mx-auto mix-blend-multiply" />
              <p className="label-gold flex items-center justify-center gap-1.5"><BadgeCheck className="size-3.5" /> Control de acceso · {brandName}</p>
              <h2 id="aviso-edad-titulo" className="text-3xl md:text-[2rem]">Verificación de mayoría de edad</h2>
            </div>
            {stage === 'pendiente' ? <AgeForm minAge={minAge} error={error} onSubmit={submit} onDecline={() => setStage('rechazado')} /> : (
              <p className="mt-6 text-center text-sm text-muted-foreground">Este sitio no está dirigido a menores de edad. No es posible acceder al catálogo.</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function AgeForm({ minAge, error, onSubmit, onDecline }: { minAge: number; error: string | null; onSubmit: (e: FormEvent<HTMLFormElement>) => void; onDecline: () => void }) {
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
      <p className="text-center text-sm leading-relaxed text-muted-foreground">
        El acceso al catálogo está restringido a personas de {minAge} años o más según la legislación vigente.
      </p>
      <fieldset className="grid grid-cols-[1fr_1fr_1.4fr] gap-3">
        <legend className="sr-only">Fecha de nacimiento</legend>
        {[['dia', 'Día', 'DD', 2], ['mes', 'Mes', 'MM', 2], ['anio', 'Año', 'AAAA', 4]].map(([name, label, placeholder, max]) => (
          <label key={name} className="space-y-1.5">
            <span className="label-gold block">{label}</span>
            <input name={name as string} inputMode="numeric" maxLength={max as number} placeholder={placeholder as string} required className={INPUT} autoComplete={name === 'anio' ? 'bday-year' : name === 'mes' ? 'bday-month' : 'bday-day'} />
          </label>
        ))}
      </fieldset>
      <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
        <input type="checkbox" name="declaracion" className="mt-0.5 size-4 accent-[#775A19]" />
        Declaro que los datos son veraces. La fecha no se almacena; para comprar se pedirá una verificación de edad adicional.
      </label>
      {error && <p role="alert" className="text-center text-xs text-danger">{error}</p>}
      <div className="grid grid-cols-[1.6fr_1fr] gap-3">
        <Button type="submit">Confirmar e ingresar</Button>
        <Button type="button" variant="outline" onClick={onDecline}>Declinar</Button>
      </div>
      <p className="regulatory px-3 py-2 text-center text-[0.65rem] font-bold uppercase tracking-[0.08em]">Fumar perjudica gravemente la salud</p>
    </form>
  )
}
