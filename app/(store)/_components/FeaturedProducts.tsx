import { createClient } from "@/lib/supabase/server"
import { ProductCard, type FeaturedProduct } from "@/app/(store)/_components/ProductCard"

async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from("products")
    .select("id, slug, name, price, sale_price, images")
    .eq("featured", true)
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false })
    .limit(4)

  if (!products || products.length === 0) return []

  const { data: variantRows } = await supabase
    .from("product_variants")
    .select("product_id, price, sale_price")
    .in(
      "product_id",
      products.map((p) => p.id)
    )

  const minVariantPriceByProduct = new Map<string, number>()
  for (const row of variantRows ?? []) {
    const effective = row.sale_price !== null ? Number(row.sale_price) : Number(row.price)
    const current = minVariantPriceByProduct.get(row.product_id)
    if (current === undefined || effective < current) {
      minVariantPriceByProduct.set(row.product_id, effective)
    }
  }

  return products.map((row) => {
    const images = row.images as { id: string; url: string }[] | null
    const price = Number(row.price)
    const salePrice = row.sale_price !== null ? Number(row.sale_price) : null
    const minVariantPrice = minVariantPriceByProduct.get(row.id)

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      image: images?.[0]?.url ?? null,
      hoverImage: images?.[1]?.url ?? null,
      price: minVariantPrice ?? price,
      salePrice: minVariantPrice !== undefined ? null : salePrice,
      isFromPrice: minVariantPrice !== undefined,
    }
  })
}

export async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  if (products.length === 0) return null

  return (
    <section className="w-full py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Featured Products
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
