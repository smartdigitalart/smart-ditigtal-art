"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { ArrowLeftIcon, Loader2 } from "lucide-react"

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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { RichTextEditor } from "@/components/tiptap/rich-text-editor"
import { SingleImageUpload } from "@/components/shared/single-image-upload"
import {
  deleteBrandUploadAction,
  uploadBrandImageAction,
} from "@/app/admin/(protected)/brands/actions"
import { useCreateAdminBrand, useUpdateAdminBrand } from "@/lib/api/use-admin-brands"
import { type Brand } from "@/lib/types/brand"

const STATUS_ITEMS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
]

export interface BrandFormValues {
  name: string
  description: string
  status: Brand["status"]
  featured: boolean
}

export function BrandForm({ brand }: { brand?: Brand }) {
  const router = useRouter()
  const isEdit = !!brand
  const createBrand = useCreateAdminBrand()
  const updateBrand = useUpdateAdminBrand()
  const saving = createBrand.isPending || updateBrand.isPending
  const [brandId] = useState(() => brand?.id ?? crypto.randomUUID())
  const [logo, setLogo] = useState<string | null>(brand?.logo ?? null)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<BrandFormValues>({
    defaultValues: {
      name: brand?.name ?? "",
      description: brand?.description ?? "",
      status: brand?.status ?? "ACTIVE",
      featured: brand?.featured ?? false,
    },
  })

  const description = useWatch({ control, name: "description" })
  const status = useWatch({ control, name: "status" })
  const featured = useWatch({ control, name: "featured" })

  const handleLogoChange = (url: string | null) => {
    const previousLogo = logo
    setLogo(url)
    if (previousLogo && previousLogo !== brand?.logo) {
      void deleteBrandUploadAction(brandId, previousLogo)
    }
  }

  const uploadLogo = (formData: FormData) => {
    const file = formData.get("file")
    const payload = new FormData()
    payload.append("brandId", brandId)
    if (file) payload.append("file", file)
    return uploadBrandImageAction(payload)
  }

  const onSubmit = async (data: BrandFormValues) => {
    const payload = {
      ...(isEdit ? {} : { id: brandId }),
      name: data.name,
      description: data.description,
      logo,
      status: data.status,
      featured: data.featured,
      productCount: brand?.productCount ?? 0,
    }

    try {
      if (isEdit) {
        await updateBrand.mutateAsync({ id: brand.id, payload })
      } else {
        await createBrand.mutateAsync(payload)
      }
      toast.success(isEdit ? "Brand updated" : "Brand created", {
        description: data.name,
      })
      router.push("/admin/brands")
    } catch {
      toast.error("Failed to save brand")
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-2"
          onClick={() => router.push("/admin/brands")}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Back to brands
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {isEdit ? "Edit Brand" : "Add Brand"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Update the details for this brand."
            : "Fill in the details to create a new brand."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Main column */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Brand details</CardTitle>
                <CardDescription>
                  Basic information shown in your storefront.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field data-invalid={!!errors.name}>
                    <FieldLabel htmlFor="name">Brand name</FieldLabel>
                    <Input
                      id="name"
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
                      onChange={handleLogoChange}
                      shape="circle"
                      size="size-20"
                      label="Upload logo"
                      uploadAction={uploadLogo}
                    />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
                <CardDescription>
                  Shown on the brand landing page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  value={description}
                  onChange={(html) => setValue("description", html)}
                  placeholder="Describe this brand..."
                  minHeight="min-h-40"
                  toolbar="full"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar column */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Visibility</CardTitle>
                <CardDescription>
                  Control status and storefront placement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
                    <Select
                      value={status}
                      onValueChange={(value) =>
                        value && setValue("status", value as Brand["status"])
                      }
                    >
                      <SelectTrigger id="status" className="w-full">
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
                    <FieldLabel htmlFor="featured" className="font-normal">
                      Featured brand
                    </FieldLabel>
                    <Switch
                      id="featured"
                      checked={featured}
                      onCheckedChange={(checked) =>
                        setValue("featured", checked)
                      }
                    />
                  </Field>
                </FieldGroup>
              </CardContent>
              <CardFooter className="justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/brands")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="animate-spin" />}
                  {isEdit ? "Save changes" : "Create brand"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
