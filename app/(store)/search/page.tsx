import { createClient } from "@/lib/supabase/server"
import { getCategoryIdsByRootName } from "@/lib/store/categories"
import { ProductCard, type FeaturedProduct } from "@/app/(store)/_components/ProductCard"

async function searchProducts(query: string): Promise<FeaturedProduct[]> {
  if (!query) return []

  const supabase = await createClient()
  const escaped = query.replace(/[%,()]/g, (char) => `\\${char}`)
  const { data } = await supabase
    .from("products")
    .select("id, name, price, sale_price, images")
    .eq("status", "ACTIVE")
    .or(`name.ilike.%${escaped}%,description.ilike.%${escaped}%`)
    .order("created_at", { ascending: false })

  return (data ?? []).map((row) => {
    const images = row.images as { id: string; url: string }[] | null
    return {
      id: row.id as string,
      name: row.name as string,
      price: Number(row.price),
      salePrice: row.sale_price !== null ? Number(row.sale_price) : null,
      image: images?.[0]?.url ?? null,
      hoverImage: images?.[1]?.url ?? null,
    }
  })
}

async function categoryProducts(rootName: string): Promise<FeaturedProduct[]> {
  const supabase = await createClient()
  const categoryIds = await getCategoryIdsByRootName(supabase, rootName)
  if (categoryIds.length === 0) return []

  const { data } = await supabase
    .from("products")
    .select("id, name, price, sale_price, images")
    .in("category_id", categoryIds)
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false })

  return (data ?? []).map((row) => {
    const images = row.images as { id: string; url: string }[] | null
    return {
      id: row.id as string,
      name: row.name as string,
      price: Number(row.price),
      salePrice: row.sale_price !== null ? Number(row.sale_price) : null,
      image: images?.[0]?.url ?? null,
      hoverImage: images?.[1]?.url ?? null,
    }
  })
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const { q, category } = await searchParams
  const query = (q ?? "").trim()
  const products = query
    ? await searchProducts(query)
    : category
      ? await categoryProducts(category)
      : []

  const heading = query
    ? `Search results for "${query}"`
    : category
      ? `${category[0].toUpperCase()}${category.slice(1)} Collection`
      : "Search"

  return (
    <section className="w-full py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {heading}
        </h1>

        {(query || category) && products.length === 0 && (
          <p className="mt-6 text-muted-foreground">
            No products found matching your search.
          </p>
        )}

        {products.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
