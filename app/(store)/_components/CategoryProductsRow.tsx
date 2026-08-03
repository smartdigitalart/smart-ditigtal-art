import { createClient } from "@/lib/supabase/server"
import { getCategoryIdsByRootName } from "@/lib/store/categories"
import { ProductCard, type FeaturedProduct } from "@/app/(store)/_components/ProductCard"

async function getProductsForRootCategory(
  rootName: string,
  limit: number
): Promise<FeaturedProduct[]> {
  const supabase = await createClient()
  const categoryIds = await getCategoryIdsByRootName(supabase, rootName)
  if (categoryIds.length === 0) return []

  const { data } = await supabase
    .from("products")
    .select("id, slug, name, price, sale_price, images")
    .in("category_id", categoryIds)
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false })
    .limit(limit)

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

// Literal classes (not built via template strings) so Tailwind's scanner picks them up.
const LG_ORDER_CLASSES = ["lg:order-1", "lg:order-2", "lg:order-3", "lg:order-4"]

export async function CategoryProductsRow() {
  const [paintingProducts, perfumeProducts] = await Promise.all([
    getProductsForRootCategory("Painting", 2),
    getProductsForRootCategory("Perfume", 2),
  ])

  // DOM order interleaves art/perfume so the base (mobile/tablet) 2-column
  // grid reads art, perfume, art, perfume per row. At the lg breakpoint,
  // where all 4 fit in a single row, lgOrder groups art first then perfume.
  const maxLen = Math.max(paintingProducts.length, perfumeProducts.length)
  const items: { product: FeaturedProduct; lgOrder: number }[] = []
  for (let i = 0; i < maxLen; i++) {
    if (paintingProducts[i]) {
      items.push({ product: paintingProducts[i], lgOrder: i + 1 })
    }
    if (perfumeProducts[i]) {
      items.push({
        product: perfumeProducts[i],
        lgOrder: paintingProducts.length + i + 1,
      })
    }
  }

  if (items.length === 0) return null

  return (
    <section className="w-full py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Products
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {items.map(({ product, lgOrder }) => (
            <div key={product.id} className={LG_ORDER_CLASSES[lgOrder - 1]}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
