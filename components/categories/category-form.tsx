"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { ArrowLeftIcon, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  uploadCategoryImageAction,
  deleteCategoryUploadAction,
} from "@/app/admin/(protected)/categories/actions"
import {
  useAdminCategories,
  useCreateAdminCategory,
  useUpdateAdminCategory,
} from "@/lib/api/use-admin-categories"
import { type Category } from "@/lib/types/category"

const STATUS_ITEMS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
]

export interface CategoryFormValues {
  name: string
  description: string
  parentId: string
  status: Category["status"]
  image: string | null
}

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter()
  const isEdit = !!category
  const createCategory = useCreateAdminCategory()
  const updateCategory = useUpdateAdminCategory()
  const saving = createCategory.isPending || updateCategory.isPending
  const { data } = useAdminCategories()

  const [categoryId] = useState(() => category?.id ?? crypto.randomUUID())

  const allCategories = (data?.items ?? []).filter(
    (c) => c.id !== category?.id
  )
  const parentItems = [
    { label: "None (top-level category)", value: "none" },
    ...allCategories.map((c) => ({ label: c.name, value: c.id })),
  ]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
      parentId: category?.parentId ?? "none",
      status: category?.status ?? "ACTIVE",
      image: category?.image ?? null,
    },
  })

  const onSubmit = async (data: CategoryFormValues) => {
    const payload = {
      ...(isEdit ? {} : { id: categoryId }),
      name: data.name,
      description: data.description,
      parentId: data.parentId === "none" ? null : data.parentId,
      status: data.status,
      image: data.image,
    }

    try {
      if (isEdit) {
        await updateCategory.mutateAsync({ id: category.id, payload })
      } else {
        await createCategory.mutateAsync(payload)
      }

      toast.success(isEdit ? "Category updated" : "Category created", {
        description: data.name,
      })
      router.push("/admin/categories")
    } catch {
      toast.error("Failed to save category")
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-2"
          onClick={() => router.push("/admin/categories")}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Back to categories
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {isEdit ? "Edit Category" : "Add Category"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Update the details for this category."
            : "Fill in the details to create a new category."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Main column */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Category details</CardTitle>
                <CardDescription>
                  Basic information shown in your storefront navigation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field data-invalid={!!errors.name}>
                    <FieldLabel htmlFor="name">Category name</FieldLabel>
                    <Input
                      id="name"
                      placeholder="e.g. PLC"
                      aria-invalid={!!errors.name}
                      {...register("name", { required: "Name is required" })}
                    />
                    <FieldError errors={[errors.name]} />
                  </Field>

                  <Field>
                    <FieldLabel>Category image</FieldLabel>
                    <SingleImageUpload
                      value={watch("image")}
                      onChange={(url) => setValue("image", url)}
                      uploadAction={uploadCategoryImageAction}
                      deleteAction={deleteCategoryUploadAction}
                      uploadId={categoryId}
                      uploadIdField="categoryId"
                      originalValue={category?.image ?? null}
                    />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
                <CardDescription>
                  Shown on the category landing page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  value={watch("description")}
                  onChange={(html) => setValue("description", html)}
                  placeholder="Describe this category..."
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
                <CardTitle>Organization</CardTitle>
                <CardDescription>
                  Control hierarchy and visibility.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="parentId">Parent category</FieldLabel>
                    <Select
                      value={watch("parentId")}
                      onValueChange={(value) =>
                        value && setValue("parentId", value)
                      }
                    >
                      <SelectTrigger id="parentId" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {parentItems.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
                    <Select
                      value={watch("status")}
                      onValueChange={(value) =>
                        value &&
                        setValue("status", value as Category["status"])
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
                </FieldGroup>
              </CardContent>
              <CardFooter className="justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/categories")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="animate-spin" />}
                  {isEdit ? "Save changes" : "Create category"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
