"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function ProductImagePreview({
  images,
  name,
  open,
  onOpenChange,
  initialIndex,
}: {
  images: { id: string; url: string }[]
  name: string
  open: boolean
  onOpenChange: (open: boolean) => void
  initialIndex: number
}) {
  const [index, setIndex] = useState(initialIndex)

  useEffect(() => {
    if (open) setIndex(initialIndex)
  }, [open, initialIndex])

  const goPrev = () => setIndex((i) => (i - 1 + images.length) % images.length)
  const goNext = () => setIndex((i) => (i + 1) % images.length)

  const active = images[index]
  if (!active) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex h-[90vh] w-[95vw] max-w-5xl flex-col gap-3 bg-background p-3 sm:p-4"
      >
        <DialogTitle className="sr-only">{name}</DialogTitle>

        <div className="relative flex-1 overflow-hidden rounded-lg bg-muted">
          <Image
            src={active.url}
            alt={name}
            fill
            sizes="95vw"
            className="object-contain"
            priority
          />

          {images.length > 1 && (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={goPrev}
                aria-label="Previous image"
                className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full"
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={goNext}
                aria-label="Next image"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full"
              >
                <ChevronRightIcon />
              </Button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex justify-center gap-2 overflow-x-auto">
            {images.map((image, i) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "relative size-14 shrink-0 overflow-hidden rounded-md bg-muted ring-2 ring-transparent transition-all",
                  i === index && "ring-primary"
                )}
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
