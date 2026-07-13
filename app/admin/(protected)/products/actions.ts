"use server"

import { createClient } from "@/lib/supabase/server"
import { extractStoragePath } from "@/lib/supabase/storage-path"
import type { Product, ProductPayload } from "@/lib/types/product"

function mapProduct(row: Record<string, unknown>): Product {
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
    description: (row.description as string) ?? "",
    shortDescription: (row.short_description as string) ?? "",
    images: (row.images as Product["images"]) ?? [],
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
  return (data ?? []).map(mapProduct)
}

export async function getProductByIdAction(id: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error || !data) return null
  return mapProduct(data)
}

function slugFromName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function createProductAction(
  payload: ProductPayload
): Promise<Product> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .insert({
      id: payload.id,
      name: payload.name,
      slug: `${slugFromName(payload.name)}-${(payload.id ?? crypto.randomUUID()).slice(0, 8)}`,
      category_id: payload.categoryId,
      brand_id: payload.brandId,
      price: payload.price,
      sale_price: payload.salePrice,
      in_stock: payload.inStock,
      status: payload.status,
      description: payload.description,
      short_description: payload.shortDescription,
      images: payload.images,
    })
    .select()
    .single()
  if (error) throw error
  return mapProduct(data)
}

export async function updateProductAction(
  id: string,
  payload: ProductPayload
): Promise<Product> {
  const supabase = await createClient()
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
      description: payload.description,
      short_description: payload.shortDescription,
      images: payload.images,
    })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return mapProduct(data)
}

export async function deleteProductAction(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) throw error
}

export async function uploadProductImageAction(
  formData: FormData
): Promise<{ url: string }> {
  const supabase = await createClient()
  const productId = formData.get("productId") as string
  const file = formData.get("file") as File | null
  if (!file) throw new Error("No file provided")

  const ext = file.name.split(".").pop() ?? "bin"
  const path = `products/${productId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from("media").upload(path, file, {
    upsert: true,
  })
  if (error) throw error

  const { data } = supabase.storage.from("media").getPublicUrl(path)
  return { url: data.publicUrl }
}

export async function deleteProductUploadAction(
  _productId: string,
  url: string
): Promise<void> {
  const supabase = await createClient()
  const path = extractStoragePath("media", url)
  if (!path) return
  await supabase.storage.from("media").remove([path])
}
