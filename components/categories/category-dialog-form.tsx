"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { RichTextEditor } from "@/components/tiptap/rich-text-editor"
import { SingleImageUpload } from "@/components/shared/single-image-upload"
import {
  uploadCategoryImageAction,
  deleteCategoryUploadAction,
} from "@/app/admin/(protected)/categories/actions"
import {
  useAdminCategories,
  useCreateAdminCategory,
} from "@/lib/api/use-admin-categories"
import type { Category } from "@/lib/types/category"

const STATUS_ITEMS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
]

interface CategoryDialogFormValues {
  name: string
  description: string
  parentId: string
  status: Category["status"]
  image: string | null
}

export function CategoryDialogForm({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (category: Category) => void
}) {
  const { data } = useAdminCategories()
  const createCategory = useCreateAdminCategory()
  const categories = data?.items ?? []
  const [categoryId, setCategoryId] = useState(() => crypto.randomUUID())
  const parentItems = [
    { label: "None (top-level category)", value: "none" },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryDialogFormValues>({
    defaultValues: {
      name: "",
      description: "",
      parentId: "none",
      status: "ACTIVE",
      image: null,
    },
  })

  const onSubmit = async (values: CategoryDialogFormValues) => {
    try {
      const created = await createCategory.mutateAsync({
        id: categoryId,
        name: values.name,
        description: values.description,
        parentId: values.parentId === "none" ? null : values.parentId,
        status: values.status,
        image: values.image,
      })
      toast.success("Category created", { description: created.name })
      onCreated(created)
      reset()
      setCategoryId(crypto.randomUUID())
      onOpenChange(false)
    } catch {
      toast.error("Failed to create category")
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          reset()
          setCategoryId(crypto.randomUUID())
        }
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="dialog-category-name">Category name</FieldLabel>
              <Input
                id="dialog-category-name"
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
              />
            </Field>

            <Field>
              <FieldLabel>Description</FieldLabel>
              <RichTextEditor
                value={watch("description")}
                onChange={(html) => setValue("description", html)}
                placeholder="Describe this category..."
                minHeight="min-h-28"
                toolbar="minimal"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="dialog-category-parent">Parent category</FieldLabel>
              <Select
                value={watch("parentId")}
                onValueChange={(value) => value && setValue("parentId", value)}
              >
                <SelectTrigger id="dialog-category-parent" className="w-full">
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
              <FieldLabel htmlFor="dialog-category-status">Status</FieldLabel>
              <Select
                value={watch("status")}
                onValueChange={(value) =>
                  value && setValue("status", value as Category["status"])
                }
              >
                <SelectTrigger id="dialog-category-status" className="w-full">
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

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createCategory.isPending}>
              {createCategory.isPending && <Loader2 className="animate-spin" />}
              Create category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
