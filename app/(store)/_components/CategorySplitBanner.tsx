import Link from "next/link"

export function CategorySplitBanner() {
  return (
    <section className="w-full py-8">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
        <Link
          href="/search?category=painting"
          className="group relative flex h-64 flex-col items-start justify-end overflow-hidden rounded-lg bg-muted p-8 transition-colors hover:bg-muted/80 sm:h-80"
        >
          <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Handmade & Digital
          </span>
          <h2 className="mt-1 text-3xl font-bold text-foreground sm:text-4xl">
            Art
          </h2>
          <span className="mt-3 text-sm font-semibold text-foreground underline-offset-4 group-hover:underline">
            Shop Art Collection
          </span>
        </Link>

        <Link
          href="/search?category=perfume"
          className="group relative flex h-64 flex-col items-start justify-end overflow-hidden rounded-lg bg-secondary p-8 transition-colors hover:bg-secondary/80 sm:h-80"
        >
          <span className="text-sm font-medium uppercase tracking-wide text-secondary-foreground/70">
            Signature Scents
          </span>
          <h2 className="mt-1 text-3xl font-bold text-secondary-foreground sm:text-4xl">
            Perfume
          </h2>
          <span className="mt-3 text-sm font-semibold text-secondary-foreground underline-offset-4 group-hover:underline">
            Shop Perfume Collection
          </span>
        </Link>
      </div>
    </section>
  )
}
