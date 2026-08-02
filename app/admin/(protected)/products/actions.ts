"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdminProfile } from "@/lib/supabase/require-admin"
import { extractStoragePath } from "@/lib/supabase/storage-path"
import {
  uploadImageToMediaBucket,
  type ImageUploadResult,
} from "@/lib/supabase/upload-image"
import type { Product, ProductPayload, ProductVariant } from "@/lib/types/product"

function mapVariant(row: Record<string, unknown>): ProductVariant {
  return {
    id: row.id as string,
    label: row.label as string,
    price: Number(row.price),
    salePrice: row.sale_price !== null && row.sale_price !== undefined ? Number(row.sale_price) : null,
    image: (row.image as string | null) ?? null,
    inStock: Boolean(row.in_stock),
  }
}

function mapProduct(
  row: Record<string, unknown>,
  variants: ProductVariant[] = []
): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    categoryId: (row.category_id as string) ?? "",
    brandId: (row.brand_id as string) ?? "",
    price: Number(row.price),
    salePrice: row.sale_price !== null && row.sale_price !== undefined ? Number(row.sale_price) : null,
    inStock: Boolean(row.in_stock),
    status: row.status as Product["status"],
    featured: Boolean(row.featured),
    description: (row.description as string) ?? "",
    shortDescription: (row.short_description as string) ?? "",
    images: (row.images as Product["images"]) ?? [],
    variants,
    createdAt: row.created_at as string,
  }
}

export async function listProductsAction(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error

  const { data: variantRows } = await supabase
    .from("product_variants")
    .select("*")
    .order("sort_order", { ascending: true })

  const variantsByProduct = new Map<string, ProductVariant[]>()
  for (const row of variantRows ?? []) {
    const list = variantsByProduct.get(row.product_id) ?? []
    list.push(mapVariant(row))
    variantsByProduct.set(row.product_id, list)
  }

  return (data ?? []).map((row) =>
    mapProduct(row, variantsByProduct.get(row.id as string) ?? [])
  )
}

export async function getProductByIdAction(id: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error || !data) return null

  const { data: variantRows } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .order("sort_order", { ascending: true })

  return mapProduct(data, (variantRows ?? []).map(mapVariant))
}

export async function getProductBySlugAction(slug: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()
  if (error || !data) return null

  const { data: variantRows } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", data.id)
    .order("sort_order", { ascending: true })

  return mapProduct(data, (variantRows ?? []).map(mapVariant))
}

function slugFromName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function generateUniqueSlug(
  supabase: ReturnType<typeof createAdminClient>,
  name: string,
  excludeId?: string
): Promise<string> {
  const base = slugFromName(name)
  let slug = base
  let attempt = 2

  for (;;) {
    let query = supabase.from("products").select("id").eq("slug", slug)
    if (excludeId) query = query.neq("id", excludeId)
    const { data } = await query.maybeSingle()
    if (!data) return slug
    slug = `${base}-${attempt}`
    attempt += 1
  }
}

async function replaceVariants(
  supabase: ReturnType<typeof createAdminClient>,
  productId: string,
  variants: ProductVariant[]
) {
  await supabase.from("product_variants").delete().eq("product_id", productId)
  if (variants.length === 0) return

  const { error } = await supabase.from("product_variants").insert(
    variants.map((variant, index) => ({
      product_id: productId,
      label: variant.label,
      price: variant.price,
      sale_price: variant.salePrice,
      image: variant.image,
      in_stock: variant.inStock,
      sort_order: index,
    }))
  )
  if (error) throw error
}

export async function createProductAction(
  payload: ProductPayload
): Promise<Product> {
  await requireAdminProfile()
  const supabase = createAdminClient()
  const slug = await generateUniqueSlug(supabase, payload.name)
  const { data, error } = await supabase
    .from("products")
    .insert({
      id: payload.id,
      name: payload.name,
      slug,
      category_id: payload.categoryId,
      brand_id: payload.brandId,
      price: payload.price,
      sale_price: payload.salePrice,
      in_stock: payload.inStock,
      status: payload.status,
      featured: payload.featured,
      description: payload.description,
      short_description: payload.shortDescription,
      images: payload.images,
    })
    .select()
    .single()
  if (error) throw error

  await replaceVariants(supabase, data.id, payload.variants)
  return mapProduct(data, payload.variants)
}

export async function updateProductAction(
  id: string,
  payload: ProductPayload
): Promise<Product> {
  await requireAdminProfile()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("products")
    .update({
      name: payload.name,
      category_id: payload.categoryId,
      brand_id: payload.brandId,
      price: payload.price,
      sale_price: payload.salePrice,
      in_stock: payload.inStock,
      status: payload.status,
      featured: payload.featured,
      description: payload.description,
      short_description: payload.shortDescription,
      images: payload.images,
    })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error

  await replaceVariants(supabase, id, payload.variants)
  return mapProduct(data, payload.variants)
}

export async function deleteProductAction(id: string): Promise<void> {
  await requireAdminProfile()
  const supabase = createAdminClient()
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) throw error
}

export async function uploadProductImageAction(
  formData: FormData
): Promise<ImageUploadResult> {
  await requireAdminProfile()
  return uploadImageToMediaBucket(formData, "productId", "products")
}

export async function deleteProductUploadAction(
  _productId: string,
  url: string
): Promise<void> {
  await requireAdminProfile()
  const supabase = createAdminClient()
  const path = extractStoragePath("media", url)
  if (!path) return
  await supabase.storage.from("media").remove([path])
}
