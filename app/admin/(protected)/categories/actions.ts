"use server"

import { createClient } from "@/lib/supabase/server"
import { extractStoragePath } from "@/lib/supabase/storage-path"
import type { Category, CategoryPayload } from "@/lib/types/category"

function mapCategory(
  row: Record<string, unknown>,
  productCount: number
): Category {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string) ?? "",
    image: (row.image as string | null) ?? null,
    parentId: (row.parent_id as string | null) ?? null,
    status: row.status as Category["status"],
    productCount,
    createdAt: row.created_at as string,
  }
}

export async function listCategoriesAction(): Promise<Category[]> {
  const supabase = await createClient()
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error

  const { data: products } = await supabase.from("products").select("category_id")
  const counts = new Map<string, number>()
  for (const p of products ?? []) {
    if (!p.category_id) continue
    counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1)
  }

  return (categories ?? []).map((c) => mapCategory(c, counts.get(c.id) ?? 0))
}

export async function getCategoryByIdAction(id: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data: category, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error || !category) return null

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id)

  return mapCategory(category, count ?? 0)
}

export async function createCategoryAction(
  payload: CategoryPayload
): Promise<Category> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .insert({
      id: payload.id,
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      image: payload.image,
      parent_id: payload.parentId,
      status: payload.status,
    })
    .select()
    .single()
  if (error) throw error
  return mapCategory(data, 0)
}

export async function updateCategoryAction(
  id: string,
  payload: CategoryPayload
): Promise<Category> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .update({
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      image: payload.image,
      parent_id: payload.parentId,
      status: payload.status,
    })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id)

  return mapCategory(data, count ?? 0)
}

export async function deleteCategoryAction(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from("categories").delete().eq("id", id)
  if (error) throw error
}

export async function uploadCategoryImageAction(
  formData: FormData
): Promise<{ url: string }> {
  const supabase = await createClient()
  const categoryId = formData.get("categoryId") as string
  const file = formData.get("file") as File | null
  if (!file) throw new Error("No file provided")

  const ext = file.name.split(".").pop() ?? "bin"
  const path = `categories/${categoryId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from("media").upload(path, file, {
    upsert: true,
  })
  if (error) throw error

  const { data } = supabase.storage.from("media").getPublicUrl(path)
  return { url: data.publicUrl }
}

export async function deleteCategoryUploadAction(
  _categoryId: string,
  url: string
): Promise<void> {
  const supabase = await createClient()
  const path = extractStoragePath("media", url)
  if (!path) return
  await supabase.storage.from("media").remove([path])
}
