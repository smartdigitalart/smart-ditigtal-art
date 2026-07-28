"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const ZOOM_SCALE = 2.2
const DRAG_THRESHOLD = 4

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
  const [zoomed, setZoomed] = useState(false)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragState = useRef<{
    startX: number
    startY: number
    panX: number
    panY: number
    moved: boolean
  } | null>(null)

  useEffect(() => {
    if (open) setIndex(initialIndex)
  }, [open, initialIndex])

  useEffect(() => {
    setZoomed(false)
    setPan({ x: 0, y: 0 })
  }, [index, open])

  const goPrev = () => setIndex((i) => (i - 1 + images.length) % images.length)
  const goNext = () => setIndex((i) => (i + 1) % images.length)

  const zoomIn = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const dx = clientX - (rect.left + rect.width / 2)
    const dy = clientY - (rect.top + rect.height / 2)
    setPan({ x: -ZOOM_SCALE * dx, y: -ZOOM_SCALE * dy })
    setZoomed(true)
  }

  const zoomOut = () => {
    setZoomed(false)
    setPan({ x: 0, y: 0 })
  }

  const handlePointerDown = (event: React.PointerEvent) => {
    if (!zoomed) return
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      panX: pan.x,
      panY: pan.y,
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!zoomed || !dragState.current) return
    const dx = event.clientX - dragState.current.startX
    const dy = event.clientY - dragState.current.startY
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      dragState.current.moved = true
      setDragging(true)
    }
    setPan({ x: dragState.current.panX + dx, y: dragState.current.panY + dy })
  }

  const handlePointerUp = (event: React.PointerEvent) => {
    const moved = dragState.current?.moved
    dragState.current = null
    setDragging(false)

    if (zoomed) {
      if (!moved) zoomOut()
    } else {
      zoomIn(event.clientX, event.clientY)
    }
  }

  const active = images[index]
  if (!active) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex h-[92vh] w-[95vw] max-w-[1600px] flex-col gap-3 bg-background p-3 sm:p-4"
      >
        <DialogTitle className="sr-only">{name}</DialogTitle>

        <div
          ref={containerRef}
          className={cn(
            "relative flex-1 touch-none overflow-hidden rounded-lg bg-muted select-none",
            zoomed
              ? dragging
                ? "cursor-grabbing"
                : "cursor-zoom-out"
              : "cursor-zoom-in"
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div
            className="size-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomed ? ZOOM_SCALE : 1})`,
              transition: dragging ? "none" : "transform 200ms ease-out",
            }}
          >
            <Image
              src={active.url}
              alt={name}
              fill
              sizes="95vw"
              className="object-contain"
              priority
              draggable={false}
            />
          </div>

          {images.length > 1 && (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={(event) => {
                  event.stopPropagation()
                  goPrev()
                }}
                aria-label="Previous image"
                className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full"
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={(event) => {
                  event.stopPropagation()
                  goNext()
                }}
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
