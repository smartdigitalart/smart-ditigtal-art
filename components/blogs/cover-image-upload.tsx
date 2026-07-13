"use client"

import { useRef, useState } from "react"
import { ImagePlusIcon, Loader2, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { backendAssetUrl } from "@/lib/backend-url"

const MAX_FILE_SIZE = 5 * 1024 * 1024

export function CoverImageUpload({
  value,
  onChange,
  uploadAction,
  deleteAction,
  blogId,
  originalValue = null,
}: {
  value: string | null
  onChange: (url: string | null) => void
  uploadAction: (formData: FormData) => Promise<{ url: string }>
  deleteAction: (blogId: string, url: string) => Promise<void>
  blogId: string
  /**
   * The post's already-saved cover image, if any. Removing/replacing this
   * one is left to the save-time cleanup on the backend, so that cancelling
   * without saving doesn't leave the DB pointing at a deleted file. Only
   * fresh uploads made during this editing session are deleted immediately.
   */
  originalValue?: string | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFile = async (file: File | undefined) => {
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image is too large. Max size is 5MB.")
      return
    }

    const previousUrl = value

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("blogId", blogId)
      formData.append("file", file)
      const data = await uploadAction(formData)
      onChange(data.url)
      if (previousUrl && previousUrl !== originalValue) {
        void deleteAction(blogId, previousUrl)
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image"
      )
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    if (value && value !== originalValue) {
      void deleteAction(blogId, value)
    }
    onChange(null)
  }

  const previewSrc = backendAssetUrl(value)

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      aria-label={previewSrc ? "Change cover image" : "Add cover image"}
      className={cn(
        "relative flex aspect-[3/1] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed bg-muted/40 text-muted-foreground transition-colors",
        !previewSrc && "hover:border-primary hover:text-primary",
        dragActive ? "border-primary bg-primary/5" : "border-input"
      )}
      onDragOver={(event) => {
        event.preventDefault()
        setDragActive(true)
      }}
      onDragLeave={(event) => {
        event.preventDefault()
        setDragActive(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setDragActive(false)
        void handleFile(event.dataTransfer.files?.[0])
      }}
    >
      {uploading ? (
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      ) : previewSrc ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewSrc} alt="" className="size-full object-cover" />
          <Button
            type="button"
            size="icon-sm"
            variant="destructive"
            aria-label="Remove image"
            className="absolute top-2 right-2"
            onClick={(event) => {
              event.stopPropagation()
              handleRemove()
            }}
          >
            <XIcon />
          </Button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <ImagePlusIcon className="size-6" />
          <span className="text-sm font-medium">
            Add cover image or drag and drop
          </span>
          <span className="text-xs text-muted-foreground">Max: 5MB</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          void handleFile(event.target.files?.[0])
          event.target.value = ""
        }}
      />
    </button>
  )
}
