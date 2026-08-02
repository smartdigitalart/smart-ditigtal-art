import { Skeleton } from "@/components/ui/skeleton"

export default function ProductDetailLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-4 w-64" />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: gallery skeleton */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <div className="flex gap-2 sm:w-20 sm:flex-col">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="aspect-square w-16 shrink-0 rounded-md sm:w-full"
                />
              ))}
            </div>
            <Skeleton className="aspect-square w-full rounded-lg" />
          </div>

          {/* Right: info skeleton */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-3/4" />
            </div>
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-16 w-full" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-5 w-32" />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Skeleton className="h-11 flex-1" />
                <Skeleton className="h-11 flex-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
