"use server"

import { createClient } from "@/lib/supabase/server"
import { extractStoragePath } from "@/lib/supabase/storage-path"
import { slugify } from "@/lib/utils"
import type { Brand, BrandPayload } from "@/lib/types/brand"

function mapBrand(row: Record<string, unknown>, productCount: number): Brand {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string) ?? "",
    logo: (row.logo as string | null) ?? null,
    status: row.status as Brand["status"],
    featured: row.featured as boolean,
    productCount,
    createdAt: row.created_at as string,
  }
}

export async function listBrandsAction(): Promise<Brand[]> {
  const supabase = await createClient()
  const { data: brands, error } = await supabase
    .from("brands")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error

  const { data: products } = await supabase.from("products").select("brand_id")
  const counts = new Map<string, number>()
  for (const p of products ?? []) {
    if (!p.brand_id) continue
    counts.set(p.brand_id, (counts.get(p.brand_id) ?? 0) + 1)
  }

  return (brands ?? []).map((b) => mapBrand(b, counts.get(b.id) ?? 0))
}

export async function getBrandByIdAction(id: string): Promise<Brand | null> {
  const supabase = await createClient()
  const { data: brand, error } = await supabase
    .from("brands")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error || !brand) return null

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("brand_id", id)

  return mapBrand(brand, count ?? 0)
}

export async function createBrandAction(payload: BrandPayload): Promise<Brand> {
  const supabase = await createClient()
  const id = payload.id ?? crypto.randomUUID()
  const { data, error } = await supabase
    .from("brands")
    .insert({
      id,
      name: payload.name,
      slug: `${slugify(payload.name)}-${id.slice(0, 8)}`,
      description: payload.description,
      logo: payload.logo,
      status: payload.status,
      featured: payload.featured,
    })
    .select()
    .single()
  if (error) throw error
  return mapBrand(data, 0)
}

export async function updateBrandAction(
  id: string,
  payload: BrandPayload
): Promise<Brand> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("brands")
    .update({
      name: payload.name,
      description: payload.description,
      logo: payload.logo,
      status: payload.status,
      featured: payload.featured,
    })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("brand_id", id)

  return mapBrand(data, count ?? 0)
}

export async function deleteBrandAction(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from("brands").delete().eq("id", id)
  if (error) throw error
}

export async function uploadBrandImageAction(
  formData: FormData
): Promise<{ url: string }> {
  const supabase = await createClient()
  const brandId = formData.get("brandId") as string
  const file = formData.get("file") as File | null
  if (!file) throw new Error("No file provided")

  const ext = file.name.split(".").pop() ?? "bin"
  const path = `brands/${brandId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from("media").upload(path, file, {
    upsert: true,
  })
  if (error) throw error

  const { data } = supabase.storage.from("media").getPublicUrl(path)
  return { url: data.publicUrl }
}

export async function deleteBrandUploadAction(
  _brandId: string,
  url: string
): Promise<void> {
  const supabase = await createClient()
  const path = extractStoragePath("media", url)
  if (!path) return
  await supabase.storage.from("media").remove([path])
}
