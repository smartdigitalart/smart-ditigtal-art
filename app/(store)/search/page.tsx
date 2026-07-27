import { createClient } from "@/lib/supabase/server"
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
    }
  })
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q ?? "").trim()
  const products = query ? await searchProducts(query) : []

  return (
    <section className="w-full py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {query ? `Search results for "${query}"` : "Search"}
        </h1>

        {query && products.length === 0 && (
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
