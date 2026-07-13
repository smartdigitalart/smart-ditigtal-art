"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  ArrowLeftIcon,
  Loader2,
  PlusIcon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react"

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
import {
  ProductImageUpload,
  type ProductImage,
} from "@/components/products/product-image-upload"
import {
  deleteProductUploadAction,
  uploadProductImageAction,
} from "@/app/admin/(protected)/products/actions"
import {
  useCreateAdminProduct,
  useUpdateAdminProduct,
} from "@/lib/api/use-admin-products"
import { useAdminBrands } from "@/lib/api/use-admin-brands"
import { useAdminCategories } from "@/lib/api/use-admin-categories"
import { PRODUCT_STATUSES, type Product } from "@/lib/types/product"

const STATUS_LABELS: Record<Product["status"], string> = {
  ACTIVE: "Active",
  DRAFT: "Draft",
  OUT_OF_STOCK: "Out of stock",
}

const STATUS_ITEMS = PRODUCT_STATUSES.map((status) => ({
  label: STATUS_LABELS[status],
  value: status,
}))

function generateSku(brand: string, category: string) {
  const prefix = (value: string) =>
    value.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "GEN"
  const random = Math.floor(1000 + Math.random() * 9000)
  return `${prefix(brand)}-${prefix(category)}-${random}`
}

export interface ProductFormValues {
  name: string
  sku: string
  categoryId: string
  brandId: string
  price: number
  stock: number
  status: Product["status"]
  description: string
  shortDescription: string
  specifications: { name: string; value: string }[]
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter()
  const isEdit = !!product
  const createProduct = useCreateAdminProduct()
  const updateProduct = useUpdateAdminProduct()
  const saving = createProduct.isPending || updateProduct.isPending
  const { data: categoriesData } = useAdminCategories()
  const { data: brandsData } = useAdminBrands()
  const categories = categoriesData?.items ?? []
  const brands = brandsData?.items ?? []
  const [productId] = useState(() => product?.id ?? crypto.randomUUID())
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      categoryId: product?.categoryId ?? "",
      brandId: product?.brandId ?? "",
      price: product?.price ?? 0,
      stock: product?.stock ?? 0,
      status: product?.status ?? "ACTIVE",
      description: product?.description ?? "",
      shortDescription: product?.shortDescription ?? "",
      specifications:
        product?.specifications.length ? product.specifications : [{ name: "", value: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "specifications",
  })

  const skuTouchedRef = useRef(isEdit)
  const categoryId = watch("categoryId")
  const brandId = watch("brandId")
  const selectedCategory = categories.find((item) => item.id === categoryId)
  const selectedBrand = brands.find((item) => item.id === brandId)

  useEffect(() => {
    if (!categoryId && categories[0]) {
      setValue("categoryId", categories[0].id)
    }
    if (!brandId && brands[0]) {
      setValue("brandId", brands[0].id)
    }
  }, [brandId, brands, categoryId, categories, setValue])

  useEffect(() => {
    if (skuTouchedRef.current) return
    setValue(
      "sku",
      generateSku(selectedBrand?.name ?? "GEN", selectedCategory?.name ?? "GEN")
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand?.name, selectedCategory?.name])

  const regenerateSku = () => {
    skuTouchedRef.current = false
    setValue(
      "sku",
      generateSku(selectedBrand?.name ?? "GEN", selectedCategory?.name ?? "GEN")
    )
  }

  const onSubmit = async (data: ProductFormValues) => {
    const payload = {
      ...(isEdit ? {} : { id: productId }),
      ...data,
      images,
      specifications: data.specifications.filter(
        (item) => item.name.trim() || item.value.trim()
      ),
    }

    try {
      if (isEdit) {
        await updateProduct.mutateAsync({ id: product.id, payload })
      } else {
        await createProduct.mutateAsync(payload)
      }

      toast.success(isEdit ? "Product updated" : "Product created", {
        description: data.name,
      })
      router.push("/admin/products")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save product")
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-2"
          onClick={() => router.push("/admin/products")}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Back to products
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {isEdit ? "Edit Product" : "Add Product"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Update the details for this product."
            : "Fill in the details to create a new product."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Main column */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Product details</CardTitle>
                <CardDescription>
                  Basic information shown to customers and in your catalog.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field data-invalid={!!errors.name}>
                      <FieldLabel htmlFor="name">Product name</FieldLabel>
                      <Input
                        id="name"
                        placeholder="e.g. Siemens PLC Unlock Tool"
                        aria-invalid={!!errors.name}
                        {...register("name", { required: "Name is required" })}
                      />
                      <FieldError errors={[errors.name]} />
                    </Field>

                    <Field data-invalid={!!errors.sku}>
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="sku">SKU</FieldLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Auto-generate SKU"
                          className="text-muted-foreground hover:text-primary"
                          onClick={regenerateSku}
                        >
                          <RefreshCwIcon />
                        </Button>
                      </div>
                      <Input
                        id="sku"
                        placeholder="e.g. SKU-0001"
                        aria-invalid={!!errors.sku}
                        {...register("sku", {
                          required: "SKU is required",
                          onChange: () => {
                            skuTouchedRef.current = true
                          },
                        })}
                      />
                      <FieldError errors={[errors.sku]} />
                    </Field>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
                <CardDescription>
                  Upload one or more product images.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductImageUpload
                  images={images}
                  onChange={setImages}
                  uploadAction={uploadProductImageAction}
                  deleteAction={deleteProductUploadAction}
                  productId={productId}
                  originalImages={product?.images ?? []}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Short description</CardTitle>
                <CardDescription>
                  A brief summary shown in listings and search results.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  value={watch("shortDescription")}
                  onChange={(html) => setValue("shortDescription", html)}
                  placeholder="A short, punchy summary of the product..."
                  minHeight="min-h-20"
                  toolbar="minimal"
                  characterLimit={200}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
                <CardDescription>
                  Full product description shown on the product page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  value={watch("description")}
                  onChange={(html) => setValue("description", html)}
                  placeholder="Write a detailed description..."
                  minHeight="min-h-56"
                  toolbar="full"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
                <CardDescription>
                  Add as many technical specifications as needed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2">
                      <Input
                        placeholder="Specification name (e.g. Weight)"
                        {...register(`specifications.${index}.name` as const)}
                      />
                      <Input
                        placeholder="Value (e.g. 1.2 kg)"
                        {...register(`specifications.${index}.value` as const)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="mt-0.5 shrink-0 text-muted-foreground hover:text-destructive"
                        aria-label="Remove specification"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="self-start"
                    onClick={() => append({ name: "", value: "" })}
                  >
                    <PlusIcon data-icon="inline-start" />
                    Add specification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar column */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
                <CardDescription>
                  Group this product for easier browsing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field data-invalid={!!errors.categoryId}>
                    <FieldLabel htmlFor="categoryId">Category</FieldLabel>
                    <Select
                      items={categories.map((category) => ({
                        label: category.name,
                        value: category.id,
                      }))}
                      value={watch("categoryId")}
                      onValueChange={(value) =>
                        value && setValue("categoryId", value)
                      }
                    >
                      <SelectTrigger id="categoryId" className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <input
                      type="hidden"
                      {...register("categoryId", {
                        required: "Category is required",
                      })}
                    />
                    <FieldError errors={[errors.categoryId]} />
                  </Field>

                  <Field data-invalid={!!errors.brandId}>
                    <FieldLabel htmlFor="brandId">Brand</FieldLabel>
                    <Select
                      items={brands.map((brand) => ({
                        label: brand.name,
                        value: brand.id,
                      }))}
                      value={watch("brandId")}
                      onValueChange={(value) =>
                        value && setValue("brandId", value)
                      }
                    >
                      <SelectTrigger id="brandId" className="w-full">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <input
                      type="hidden"
                      {...register("brandId", {
                        required: "Brand is required",
                      })}
                    />
                    <FieldError errors={[errors.brandId]} />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing & inventory</CardTitle>
                <CardDescription>
                  Set the price, stock, and visibility.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field data-invalid={!!errors.price}>
                    <FieldLabel htmlFor="price">Price ($)</FieldLabel>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      aria-invalid={!!errors.price}
                      {...register("price", {
                        required: "Price is required",
                        valueAsNumber: true,
                        min: { value: 0, message: "Price must be positive" },
                      })}
                    />
                    <FieldError errors={[errors.price]} />
                  </Field>

                  <Field data-invalid={!!errors.stock}>
                    <FieldLabel htmlFor="stock">Stock quantity</FieldLabel>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      aria-invalid={!!errors.stock}
                      {...register("stock", {
                        required: "Stock is required",
                        valueAsNumber: true,
                        min: { value: 0, message: "Stock must be positive" },
                      })}
                    />
                    <FieldError errors={[errors.stock]} />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
                    <Select
                      items={STATUS_ITEMS}
                      value={watch("status")}
                      onValueChange={(value) =>
                        value && setValue("status", value as Product["status"])
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
                  onClick={() => router.push("/admin/products")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="animate-spin" />}
                  {isEdit ? "Save changes" : "Create product"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
