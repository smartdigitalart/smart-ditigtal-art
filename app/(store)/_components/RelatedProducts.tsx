import { createClient } from "@/lib/supabase/server"
import { ProductCard, type FeaturedProduct } from "@/app/(store)/_components/ProductCard"

async function getRelatedProducts(
  categoryId: string,
  excludeProductId: string
): Promise<FeaturedProduct[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("id, slug, name, price, sale_price, images")
    .eq("category_id", categoryId)
    .eq("status", "ACTIVE")
    .neq("id", excludeProductId)
    .order("created_at", { ascending: false })
    .limit(4)

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

export async function RelatedProducts({
  categoryId,
  excludeProductId,
}: {
  categoryId: string
  excludeProductId: string
}) {
  const products = await getRelatedProducts(categoryId, excludeProductId)

  if (products.length === 0) return null

  return (
    <section className="w-full py-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Related Products
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
