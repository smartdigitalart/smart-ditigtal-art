"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const banners = [
  { title: "Banner 1", className: "bg-muted" },
  { title: "Banner 2", className: "bg-secondary" },
  { title: "Banner 3", className: "bg-muted" },
  { title: "Banner 4", className: "bg-secondary" },
]

export function Hero() {
  return (
    <section className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <Carousel className="mx-auto w-full max-w-7xl" opts={{ loop: true }}>
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.title}>
              <div
                className={`flex h-64 items-center justify-center rounded-lg sm:h-80 md:h-96 ${banner.className}`}
              >
                <span className="text-2xl font-semibold text-muted-foreground">
                  {banner.title}
                </span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </section>
  )
}
