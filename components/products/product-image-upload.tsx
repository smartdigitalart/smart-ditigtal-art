"use client"

import { useRef, useState } from "react"
import { ImagePlusIcon, Loader2Icon, StarIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { backendAssetUrl } from "@/lib/backend-url"

export interface ProductImage {
  id: string
  url: string
  file?: File
}

export function ProductImageUpload({
  images,
  onChange,
  uploadAction,
  deleteAction,
  productId,
  originalImages = [],
}: {
  images: ProductImage[]
  onChange: (images: ProductImage[]) => void
  uploadAction: (formData: FormData) => Promise<{ url: string }>
  deleteAction: (productId: string, url: string) => Promise<void>
  productId: string
  originalImages?: ProductImage[]
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return

    setUploading(true)
    try {
      const uploaded = await Promise.all(
        Array.from(fileList).map(async (file) => {
          const formData = new FormData()
          formData.append("productId", productId)
          formData.append("file", file)
          const data = await uploadAction(formData)
          return {
            id: crypto.randomUUID(),
            url: data.url,
          }
        })
      )
      onChange([...images, ...uploaded])
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image"
      )
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (id: string) => {
    const image = images.find((item) => item.id === id)
    const isOriginal = originalImages.some((item) => item.url === image?.url)

    if (image && !isOriginal) {
      void deleteAction(productId, image.url)
    }

    onChange(images.filter((item) => item.id !== id))
  }

  const makeCover = (id: string) => {
    const target = images.find((image) => image.id === id)
    if (!target) return
    onChange([target, ...images.filter((image) => image.id !== id)])
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted",
              index === 0 && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backendAssetUrl(image.url) ?? image.url}
              alt=""
              className="size-full object-cover"
            />
            {index === 0 && (
              <span className="absolute top-1 left-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                Cover
              </span>
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              {index !== 0 && (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="secondary"
                  aria-label="Make cover image"
                  onClick={() => makeCover(image.id)}
                >
                  <StarIcon />
                </Button>
              )}
              <Button
                type="button"
                size="icon-sm"
                variant="destructive"
                aria-label="Remove image"
                onClick={() => removeImage(image.id)}
              >
                <XIcon />
              </Button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-input text-muted-foreground hover:border-primary hover:text-primary"
        >
          {uploading ? (
            <Loader2Icon className="size-5 animate-spin" />
          ) : (
            <ImagePlusIcon className="size-5" />
          )}
          <span className="text-xs font-medium">
            {uploading ? "Uploading..." : "Add images"}
          </span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(event) => {
          void handleFiles(event.target.files)
          event.target.value = ""
        }}
      />

      <p className="text-xs text-muted-foreground">
        Upload multiple images. The first image is used as the cover — hover
        any other image and click the star to make it the cover.
      </p>
    </div>
  )
}
