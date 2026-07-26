"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { RichTextEditor } from "@/components/tiptap/rich-text-editor"
import { SingleImageUpload } from "@/components/shared/single-image-upload"
import { uploadBrandImageAction } from "@/app/admin/(protected)/brands/actions"
import { useCreateAdminBrand } from "@/lib/api/use-admin-brands"
import type { Brand } from "@/lib/types/brand"

const STATUS_ITEMS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
]

interface BrandDialogFormValues {
  name: string
  description: string
  status: Brand["status"]
  featured: boolean
}

export function BrandDialogForm({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (brand: Brand) => void
}) {
  const createBrand = useCreateAdminBrand()
  const [brandId, setBrandId] = useState(() => crypto.randomUUID())
  const [logo, setLogo] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BrandDialogFormValues>({
    defaultValues: {
      name: "",
      description: "",
      status: "ACTIVE",
      featured: false,
    },
  })

  const uploadLogo = (formData: FormData) => {
    const file = formData.get("file")
    const payload = new FormData()
    payload.append("brandId", brandId)
    if (file) payload.append("file", file)
    return uploadBrandImageAction(payload)
  }

  const resetForm = () => {
    reset()
    setLogo(null)
    setBrandId(crypto.randomUUID())
  }

  const onSubmit = async (values: BrandDialogFormValues) => {
    try {
      const created = await createBrand.mutateAsync({
        id: brandId,
        name: values.name,
        description: values.description,
        logo,
        status: values.status,
        featured: values.featured,
      })
      toast.success("Brand created", { description: created.name })
      onCreated(created)
      resetForm()
      onOpenChange(false)
    } catch {
      toast.error("Failed to create brand")
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm()
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Brand</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="dialog-brand-name">Brand name</FieldLabel>
              <Input
                id="dialog-brand-name"
                placeholder="e.g. Siemens"
                aria-invalid={!!errors.name}
                {...register("name", { required: "Name is required" })}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field>
              <FieldLabel>Brand logo</FieldLabel>
              <SingleImageUpload
                value={logo}
                onChange={setLogo}
                shape="circle"
                size="size-20"
                label="Upload logo"
                uploadAction={uploadLogo}
              />
            </Field>

            <Field>
              <FieldLabel>Description</FieldLabel>
              <RichTextEditor
                value={watch("description")}
                onChange={(html) => setValue("description", html)}
                placeholder="Describe this brand..."
                minHeight="min-h-28"
                toolbar="minimal"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="dialog-brand-status">Status</FieldLabel>
              <Select
                value={watch("status")}
                onValueChange={(value) =>
                  value && setValue("status", value as Brand["status"])
                }
              >
                <SelectTrigger id="dialog-brand-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {STATUS_ITEMS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field orientation="horizontal" className="justify-between">
              <FieldLabel htmlFor="dialog-brand-featured" className="font-normal">
                Featured brand
              </FieldLabel>
              <Switch
                id="dialog-brand-featured"
                checked={watch("featured")}
                onCheckedChange={(checked) => setValue("featured", checked)}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createBrand.isPending}>
              {createBrand.isPending && <Loader2 className="animate-spin" />}
              Create brand
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
