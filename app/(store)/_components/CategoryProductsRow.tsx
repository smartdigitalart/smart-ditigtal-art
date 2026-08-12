import { createClient } from "@/lib/supabase/server"
import { ProductCard, type FeaturedProduct } from "@/app/(store)/_components/ProductCard"
import { getDescendantCategoryIds, type CategoryNode } from "@/lib/store/categories"

// Grid item order per position within a 4-item block (art, art, perfume, perfume).
// Mobile is 2 cols, so each row must read art/perfume; desktop is 4 cols, so
// each row must read art, art, perfume, perfume.
const ORDER_CLASSES = [
  "order-1 lg:order-1", // art #1
  "order-3 lg:order-2", // art #2
  "order-2 lg:order-3", // perfume #1
  "order-4 lg:order-4", // perfume #2
]

function toProduct(row: Record<string, unknown>): FeaturedProduct {
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
}

async function getArtAndPerfumeProducts(): Promise<FeaturedProduct[]> {
  const supabase = await createClient()

  const [{ data: categoryRows }, { data: productRows }] = await Promise.all([
    supabase.from("categories").select("id, name, slug, parent_id"),
    supabase
      .from("products")
      .select("id, slug, name, price, sale_price, images, category_id")
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false }),
  ])

  const categories: CategoryNode[] = (categoryRows ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    parentId: row.parent_id as string | null,
  }))

  const artRoot = categories.find((c) => c.parentId === null && c.name.toLowerCase() === "art")
  const perfumeRoot = categories.find(
    (c) => c.parentId === null && c.name.toLowerCase() === "perfume"
  )
  const artIds = new Set(artRoot ? getDescendantCategoryIds(categories, artRoot.id) : [])
  const perfumeIds = new Set(
    perfumeRoot ? getDescendantCategoryIds(categories, perfumeRoot.id) : []
  )

  const artProducts = (productRows ?? [])
    .filter((row) => artIds.has(row.category_id as string))
    .map(toProduct)
  const perfumeProducts = (productRows ?? [])
    .filter((row) => perfumeIds.has(row.category_id as string))
    .map(toProduct)

  const blockCount = Math.max(Math.ceil(artProducts.length / 2), Math.ceil(perfumeProducts.length / 2))
  const merged: FeaturedProduct[] = []
  for (let i = 0; i < blockCount; i++) {
    merged.push(...artProducts.slice(i * 2, i * 2 + 2))
    merged.push(...perfumeProducts.slice(i * 2, i * 2 + 2))
  }

  return merged
}

export async function CategoryProductsRow() {
  const products = await getArtAndPerfumeProducts()

  if (products.length === 0) return null

  return (
    <section className="w-full py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Products
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} className={ORDER_CLASSES[index % 4]} />
          ))}
        </div>
      </div>
    </section>
  )
}
