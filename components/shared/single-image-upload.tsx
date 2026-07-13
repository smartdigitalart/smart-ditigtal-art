"use client"

import { useRef, useState } from "react"
import { ImagePlusIcon, Loader2, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { backendAssetUrl } from "@/lib/backend-url"

export function SingleImageUpload({
  value,
  onChange,
  shape = "square",
  size = "size-28",
  label = "Upload image",
  uploadAction,
  deleteAction,
  uploadId,
  uploadIdField = "id",
  originalValue = null,
}: {
  value: string | null
  onChange: (url: string | null) => void
  shape?: "square" | "circle"
  size?: string
  label?: string
  uploadAction?: (formData: FormData) => Promise<{ url: string }>
  deleteAction?: (id: string, url: string) => Promise<void>
  uploadId?: string
  uploadIdField?: string
  originalValue?: string | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File | undefined) => {
    if (!file) return

    if (!uploadAction) {
      onChange(URL.createObjectURL(file))
      return
    }

    const previousUrl = value

    setUploading(true)
    try {
      const formData = new FormData()
      if (uploadId) {
        formData.append(uploadIdField, uploadId)
      }
      formData.append("file", file)

      const data = await uploadAction(formData)
      onChange(data.url)
      if (
        deleteAction &&
        uploadId &&
        previousUrl &&
        previousUrl !== originalValue
      ) {
        void deleteAction(uploadId, previousUrl)
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
    if (deleteAction && uploadId && value && value !== originalValue) {
      void deleteAction(uploadId, value)
    }
    onChange(null)
  }

  const previewSrc = backendAssetUrl(value)

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden border border-dashed border-input bg-muted",
          shape === "circle" ? "rounded-full" : "rounded-lg",
          size
        )}
      >
        {uploading ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : previewSrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewSrc} alt="" className="size-full object-cover" />
            <Button
              type="button"
              size="icon-sm"
              variant="destructive"
              aria-label="Remove image"
              className="absolute top-1 right-1"
              onClick={handleRemove}
            >
              <XIcon />
            </Button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary"
          >
            <ImagePlusIcon className="size-5" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {value ? "Change image" : label}
        </Button>
        <p className="text-xs text-muted-foreground">PNG or JPG, up to 2MB.</p>
      </div>

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
    </div>
  )
}
