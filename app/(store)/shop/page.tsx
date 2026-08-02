import { Suspense } from "react"

import { createClient } from "@/lib/supabase/server"
import { getDescendantCategoryIds, type CategoryNode } from "@/lib/store/categories"
import { ProductCard, type FeaturedProduct } from "@/app/(store)/_components/ProductCard"
import { ShopFilters, type BrandOption } from "@/app/(store)/shop/ShopFilters"

interface ShopSearchParams {
  q?: string
  category?: string
  brand?: string
  min?: string
  max?: string
  stock?: string
}

async function getFilterOptions() {
  const supabase = await createClient()

  const [{ data: categoryRows }, { data: brandRows }, { data: priceRows }] = await Promise.all([
    supabase.from("categories").select("id, name, slug, parent_id").eq("status", "ACTIVE"),
    supabase.from("brands").select("id, name, slug").eq("status", "ACTIVE").order("name"),
    supabase.from("products").select("price").eq("status", "ACTIVE"),
  ])

  const categories: CategoryNode[] = (categoryRows ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    parentId: row.parent_id as string | null,
  }))

  const brands: BrandOption[] = (brandRows ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
  }))

  const prices = (priceRows ?? []).map((row) => Number(row.price))
  const priceBounds = {
    min: prices.length > 0 ? Math.floor(Math.min(...prices)) : 0,
    max: prices.length > 0 ? Math.ceil(Math.max(...prices)) : 0,
  }

  return { categories, brands, priceBounds }
}

async function getProducts(
  params: ShopSearchParams,
  categories: CategoryNode[],
  brands: BrandOption[]
): Promise<FeaturedProduct[]> {
  const supabase = await createClient()
  let query = supabase
    .from("products")
    .select("id, slug, name, price, sale_price, images")
    .eq("status", "ACTIVE")

  const q = (params.q ?? "").trim()
  if (q) {
    const escaped = q.replace(/[%,()]/g, (char) => `\\${char}`)
    query = query.or(`name.ilike.%${escaped}%,description.ilike.%${escaped}%`)
  }

  const categorySlugs = (params.category ?? "").split(",").filter(Boolean)
  if (categorySlugs.length > 0) {
    const categoryIds = categorySlugs.flatMap((slug) => {
      const match =
        categories.find((c) => c.slug === slug) ??
        categories.find(
          (c) => c.parentId === null && c.name.toLowerCase() === slug.toLowerCase()
        )
      return match ? getDescendantCategoryIds(categories, match.id) : []
    })
    if (categoryIds.length > 0) query = query.in("category_id", categoryIds)
  }

  const brandSlugs = (params.brand ?? "").split(",").filter(Boolean)
  if (brandSlugs.length > 0) {
    const brandIds = brandSlugs
      .map((slug) => brands.find((b) => b.slug === slug)?.id)
      .filter((id): id is string => Boolean(id))
    if (brandIds.length > 0) query = query.in("brand_id", brandIds)
  }

  if (params.min) query = query.gte("price", Number(params.min))
  if (params.max) query = query.lte("price", Number(params.max))
  if (params.stock === "1") query = query.eq("in_stock", true)

  const { data } = await query.order("created_at", { ascending: false })

  return (data ?? []).map((row) => {
    const images = row.images as { id: string; url: string }[] | null
    return {
      id: row.id as string,
      slug: row.slug as string,
      name: row.name as string,
      price: Number(row.price),
      salePrice: row.sale_price !== null ? Number(row.sale_price) : null,
      image: images?.[0]?.url ?? null,
      hoverImage: images?.[1]?.url ?? null,
    }
  })
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>
}) {
  const params = await searchParams
  const { categories, brands, priceBounds } = await getFilterOptions()
  const products = await getProducts(params, categories, brands)

  const heading = params.q ? `Search results for "${params.q}"` : "Shop"

  return (
    <section className="w-full py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{heading}</h1>

        <div className="mt-6 flex flex-col gap-8 lg:flex-row">
          <Suspense fallback={<div className="w-full shrink-0 lg:w-64" />}>
            <ShopFilters categories={categories} brands={brands} priceBounds={priceBounds} />
          </Suspense>

          <div className="flex-1">
            {products.length === 0 ? (
              <p className="text-muted-foreground">No products found matching your filters.</p>
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
