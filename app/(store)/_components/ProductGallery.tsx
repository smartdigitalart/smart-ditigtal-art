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
import { ProductImagePreview } from "@/app/(store)/_components/ProductImagePreview"
import { Lens } from "@/components/ui/lens"

export function ProductGallery({
  images,
  name,
  focusImageId,
}: {
  images: { id: string; url: string }[]
  name: string
  focusImageId?: string | null
}) {
  const [api, setApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    if (!api) return
    const updateActiveIndex = () => setActiveIndex(api.selectedScrollSnap())
    api.on("select", updateActiveIndex)

    return () => {
      api.off("select", updateActiveIndex)
    }
  }, [api])

  useEffect(() => {
    if (!api || !focusImageId) return
    const index = images.findIndex((image) => image.id === focusImageId)
    if (index >= 0) api.scrollTo(index)
  }, [api, focusImageId, images])

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <PackageIcon className="size-12" />
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-full min-w-0 flex-col-reverse gap-3 overflow-hidden sm:flex-row">
      {images.length > 1 && (
        <div className="flex max-w-full min-w-0 gap-2 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-x-hidden sm:overflow-y-auto">
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
        className="w-full min-w-0 flex-1 overflow-hidden"
      >
        <CarouselContent>
          {images.map((image) => (
            <CarouselItem key={image.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setPreviewOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    setPreviewOpen(true)
                  }
                }}
                className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-lg bg-muted"
                aria-label="View full image"
              >
                <Lens zoomFactor={1.8} lensSize={190} className="absolute inset-0">
                  <Image
                    src={image.url}
                    alt={name}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    priority
                    className="object-cover"
                  />
                </Lens>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <ProductImagePreview
        images={images}
        name={name}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        initialIndex={activeIndex}
      />
    </div>
  )
}
