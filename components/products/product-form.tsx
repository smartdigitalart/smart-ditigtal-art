"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { ArrowLeftIcon, Loader2, PlusIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
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
import { SingleImageUpload } from "@/components/shared/single-image-upload"
import { CategoryDialogForm } from "@/components/categories/category-dialog-form"
import { BrandDialogForm } from "@/components/brands/brand-dialog-form"
import { EntityCombobox } from "@/components/products/entity-combobox"
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
import type { Product } from "@/lib/types/product"

export interface ProductVariantFormValue {
  label: string
  price: number
  salePrice: number | null
  image: string | null
  inStock: boolean
}

export interface ProductFormValues {
  name: string
  categoryId: string
  brandId: string
  price: number
  salePrice: number | null
  inStock: boolean
  status: Product["status"]
  featured: boolean
  description: string
  shortDescription: string
  variants: ProductVariantFormValue[]
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
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [brandDialogOpen, setBrandDialogOpen] = useState(false)

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
      categoryId: product?.categoryId ?? "",
      brandId: product?.brandId ?? "",
      price: product ? product.price : (undefined as unknown as number),
      salePrice: product?.salePrice ?? null,
      inStock: product?.inStock ?? true,
      status: product?.status ?? "ACTIVE",
      featured: product?.featured ?? false,
      description: product?.description ?? "",
      shortDescription: product?.shortDescription ?? "",
      variants: (product?.variants ?? []).map((variant) => ({
        label: variant.label,
        price: variant.price,
        salePrice: variant.salePrice,
        image: variant.image,
        inStock: variant.inStock,
      })),
    },
  })

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({ control, name: "variants" })

  const uploadVariantImage = (formData: FormData) => {
    const file = formData.get("file")
    const payload = new FormData()
    payload.append("productId", productId)
    if (file) payload.append("file", file)
    return uploadProductImageAction(payload)
  }

  const categoryId = watch("categoryId")
  const brandId = watch("brandId")

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: category.id, label: category.name })),
    [categories]
  )
  const brandOptions = useMemo(
    () => brands.map((brand) => ({ value: brand.id, label: brand.name })),
    [brands]
  )
  const selectedCategoryOption =
    categoryOptions.find((option) => option.value === categoryId) ?? null
  const selectedBrandOption =
    brandOptions.find((option) => option.value === brandId) ?? null

  useEffect(() => {
    if (!categoryId && categories[0]) {
      setValue("categoryId", categories[0].id)
    }
    if (!brandId && brands[0]) {
      setValue("brandId", brands[0].id)
    }
  }, [brandId, brands, categoryId, categories, setValue])

  const onSubmit = async (data: ProductFormValues) => {
    const payload = {
      ...(isEdit ? {} : { id: productId }),
      ...data,
      salePrice:
        data.salePrice === null || Number.isNaN(data.salePrice)
          ? null
          : data.salePrice,
      images,
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
                <CardTitle>Variants</CardTitle>
                <CardDescription>
                  Optional. Add options like sizes or editions that each have
                  their own price and, optionally, their own image (e.g.
                  &ldquo;100ml&rdquo; / &ldquo;200ml&rdquo;, or &ldquo;With
                  frame&rdquo; / &ldquo;Without frame&rdquo;). Leave empty for
                  a simple product using the price below.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {variantFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-start"
                  >
                    <SingleImageUpload
                      value={watch(`variants.${index}.image`)}
                      onChange={(url) => setValue(`variants.${index}.image`, url)}
                      uploadAction={uploadVariantImage}
                      size="size-16"
                      label="Image"
                    />
                    <div className="grid flex-1 grid-cols-2 gap-3">
                      <Field
                        className="col-span-2"
                        data-invalid={!!errors.variants?.[index]?.label}
                      >
                        <FieldLabel htmlFor={`variant-label-${index}`}>
                          Label
                        </FieldLabel>
                        <Input
                          id={`variant-label-${index}`}
                          placeholder="e.g. 100ml"
                          aria-invalid={!!errors.variants?.[index]?.label}
                          {...register(`variants.${index}.label`, {
                            required: "Label is required",
                          })}
                        />
                        <FieldError errors={[errors.variants?.[index]?.label]} />
                      </Field>
                      <Field data-invalid={!!errors.variants?.[index]?.price}>
                        <FieldLabel htmlFor={`variant-price-${index}`}>
                          Price (৳)
                        </FieldLabel>
                        <Input
                          id={`variant-price-${index}`}
                          type="number"
                          step="0.01"
                          min="0"
                          aria-invalid={!!errors.variants?.[index]?.price}
                          {...register(`variants.${index}.price`, {
                            required: "Price is required",
                            valueAsNumber: true,
                            min: { value: 0, message: "Must be positive" },
                          })}
                        />
                        <FieldError errors={[errors.variants?.[index]?.price]} />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor={`variant-sale-price-${index}`}>
                          Sale price (৳)
                        </FieldLabel>
                        <Input
                          id={`variant-sale-price-${index}`}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Optional"
                          {...register(`variants.${index}.salePrice`, {
                            setValueAs: (value) =>
                              value === "" || value === null
                                ? null
                                : Number(value),
                          })}
                        />
                      </Field>
                      <Field orientation="horizontal" className="col-span-2 justify-between">
                        <FieldLabel
                          htmlFor={`variant-in-stock-${index}`}
                          className="font-normal"
                        >
                          In stock
                        </FieldLabel>
                        <Switch
                          id={`variant-in-stock-${index}`}
                          checked={watch(`variants.${index}.inStock`)}
                          onCheckedChange={(checked) =>
                            setValue(`variants.${index}.inStock`, checked)
                          }
                        />
                      </Field>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove variant"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeVariant(index)}
                    >
                      <XIcon />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                  onClick={() =>
                    appendVariant({
                      label: "",
                      price: 0,
                      salePrice: null,
                      image: null,
                      inStock: true,
                    })
                  }
                >
                  <PlusIcon data-icon="inline-start" />
                  Add variant
                </Button>
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
                    <EntityCombobox
                      items={categoryOptions}
                      selected={selectedCategoryOption}
                      onSelect={(option) =>
                        setValue("categoryId", option?.value ?? "")
                      }
                      placeholder="Select category"
                      addLabel="Add category"
                      onAddNew={() => setCategoryDialogOpen(true)}
                    />
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
                    <EntityCombobox
                      items={brandOptions}
                      selected={selectedBrandOption}
                      onSelect={(option) =>
                        setValue("brandId", option?.value ?? "")
                      }
                      placeholder="Select brand"
                      addLabel="Add brand"
                      onAddNew={() => setBrandDialogOpen(true)}
                    />
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
                  Set the price, sale price, and visibility.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field data-invalid={!!errors.price}>
                    <FieldLabel htmlFor="price">Price (৳)</FieldLabel>
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

                  <Field data-invalid={!!errors.salePrice}>
                    <FieldLabel htmlFor="salePrice">Sale price (৳)</FieldLabel>
                    <Input
                      id="salePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Optional discount price"
                      aria-invalid={!!errors.salePrice}
                      {...register("salePrice", {
                        setValueAs: (value) =>
                          value === "" || value === null ? null : Number(value),
                        min: { value: 0, message: "Sale price must be positive" },
                      })}
                    />
                    <FieldError errors={[errors.salePrice]} />
                  </Field>

                  <Field orientation="horizontal" className="justify-between">
                    <FieldLabel htmlFor="inStock" className="font-normal">
                      In stock
                    </FieldLabel>
                    <Switch
                      id="inStock"
                      checked={watch("inStock")}
                      onCheckedChange={(checked) => setValue("inStock", checked)}
                    />
                  </Field>

                  <Field orientation="horizontal" className="justify-between">
                    <FieldLabel htmlFor="status" className="font-normal">
                      Active
                    </FieldLabel>
                    <Switch
                      id="status"
                      checked={watch("status") === "ACTIVE"}
                      onCheckedChange={(checked) =>
                        setValue("status", checked ? "ACTIVE" : "INACTIVE")
                      }
                    />
                  </Field>

                  <Field orientation="horizontal" className="justify-between">
                    <FieldLabel htmlFor="featured" className="font-normal">
                      Featured product
                    </FieldLabel>
                    <Switch
                      id="featured"
                      checked={watch("featured")}
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

      <CategoryDialogForm
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onCreated={(created) => setValue("categoryId", created.id)}
      />
      <BrandDialogForm
        open={brandDialogOpen}
        onOpenChange={setBrandDialogOpen}
        onCreated={(created) => setValue("brandId", created.id)}
      />
    </div>
  )
}
