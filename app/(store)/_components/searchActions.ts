"use server"

import { createClient } from "@/lib/supabase/server"

export interface SearchSuggestion {
  id: string
  slug: string
  name: string
  price: number
  salePrice: number | null
  image: string | null
}

export async function searchProductsAction(query: string): Promise<SearchSuggestion[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const supabase = await createClient()
  const escaped = trimmed.replace(/[%,()]/g, (char) => `\\${char}`)

  const { data } = await supabase
    .from("products")
    .select("id, slug, name, price, sale_price, images")
    .eq("status", "ACTIVE")
    .or(`name.ilike.%${escaped}%,description.ilike.%${escaped}%`)
    .order("created_at", { ascending: false })
    .limit(6)

  return (data ?? []).map((row) => {
    const images = row.images as { id: string; url: string }[] | null
    return {
      id: row.id as string,
      slug: row.slug as string,
      name: row.name as string,
      price: Number(row.price),
      salePrice: row.sale_price !== null ? Number(row.sale_price) : null,
      image: images?.[0]?.url ?? null,
    }
  })
}
