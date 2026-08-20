"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import type { HeroBanner } from "@/lib/types/site-settings"

export function Hero({ banners }: { banners: HeroBanner[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(0)
  const autoplay = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false })
  )

  useEffect(() => {
    if (!api) return
    const updateActiveIndex = () => setActiveIndex(api.selectedScrollSnap())
    queueMicrotask(updateActiveIndex)
    api.on("select", updateActiveIndex)

    return () => {
      api.off("select", updateActiveIndex)
    }
  }, [api])

  return (
    <section className="w-full py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Carousel
          setApi={setApi}
          opts={{ loop: true }}
          plugins={[autoplay.current]}
        >
          <CarouselContent>
            {banners.map((banner, index) => (
              <CarouselItem key={banner.id}>
                <div className="relative aspect-[1376/768] w-full overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.alt}
                    fill
                    sizes="(min-width: 1280px) 1280px, 100vw"
                    priority={index === 0}
                    className="object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {banners.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === activeIndex
                    ? "w-6 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
