import Link from "next/link"
import Image from "next/image"

import type { CategoryPromoCard } from "@/lib/types/site-settings"

export function CategorySplitBanner({
  cards,
}: {
  cards: CategoryPromoCard[]
}) {
  return (
    <section className="w-full py-8">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
        {cards.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            className="group relative flex h-72 flex-col items-start justify-end overflow-hidden rounded-lg bg-muted p-6 text-white sm:h-80 sm:p-8"
          >
            <Image
              src={card.imageUrl}
              alt={card.alt}
              fill
              sizes="(min-width: 1024px) 608px, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
            <span className="relative flex max-w-xs flex-col items-start gap-2">
              <span className="text-sm font-medium uppercase text-white/90">
                {card.eyebrow}
              </span>
              <span className="text-3xl font-bold leading-tight text-white sm:text-4xl">
                {card.title}
              </span>
              <span className="text-sm font-semibold text-white underline-offset-4 group-hover:underline">
                {card.cta}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
