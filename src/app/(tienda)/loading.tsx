import { Skeleton } from '@/shared/components/data-state'
import { Container } from '@/shared/components/layout'

export default function Loading() {
  return (
    <Container className="space-y-10 py-16">
      <div className="space-y-4" aria-busy="true" aria-label="Cargando">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="h-16 w-2/3 md:w-1/2" />
        <Skeleton className="h-5 w-full max-w-xl rounded-full" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-3xl" />)}
      </div>
    </Container>
  )
}
