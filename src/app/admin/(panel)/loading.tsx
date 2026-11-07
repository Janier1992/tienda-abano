import { Skeleton } from '@/shared/components/data-state'

export default function Loading() {
  return (
    <div className="space-y-3" aria-label="Cargando">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}
