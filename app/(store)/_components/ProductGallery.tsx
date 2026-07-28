"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { PackageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"

export function ProductGallery({
  images,
  name,
}: {
  images: { id: string; url: string }[]
  name: string
}) {
  const [api, setApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!api) return
    setActiveIndex(api.selectedScrollSnap())
    api.on("select", () => setActiveIndex(api.selectedScrollSnap()))
  }, [api])

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <PackageIcon className="size-12" />
      </div>
    )
  }

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-x-hidden sm:overflow-y-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden rounded-md bg-muted ring-2 ring-transparent transition-all sm:w-full",
                index === activeIndex && "ring-primary"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <Carousel
        setApi={setApi}
        opts={{ loop: images.length > 1 }}
        className="w-full"
      >
        <CarouselContent>
          {images.map((image) => (
            <CarouselItem key={image.id}>
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={image.url}
                  alt={name}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  priority
                  className="object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
