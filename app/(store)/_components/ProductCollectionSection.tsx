import Link from "next/link"

import { ProductCard, type FeaturedProduct } from "@/app/(store)/_components/ProductCard"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

type ProductCollection = "flash-deal" | "new-arrival"

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

async function getCollectionProducts(collection: ProductCollection): Promise<FeaturedProduct[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("id, slug, name, price, sale_price, images")
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false })
    .limit(collection === "flash-deal" ? 12 : 4)

  const products = (data ?? []).map(toProduct)

  if (collection === "flash-deal") {
    return products
      .filter((product) => product.salePrice !== null && product.salePrice < product.price)
      .slice(0, 4)
  }

  return products.slice(0, 4)
}

const collectionCopy = {
  "flash-deal": {
    title: "Special Flash Deal Offer",
    href: "/shop?collection=flash-deal",
    action: "View Flash Deals",
  },
  "new-arrival": {
    title: "New Arrival",
    href: "/shop?collection=new-arrival",
    action: "View New Arrivals",
  },
} satisfies Record<ProductCollection, { title: string; href: string; action: string }>

export async function ProductCollectionSection({
  collection,
}: {
  collection: ProductCollection
}) {
  const products = await getCollectionProducts(collection)

  if (products.length === 0) return null

  const copy = collectionCopy[collection]

  return (
    <section className="w-full py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {copy.title}
          </h2>
          <Button variant="outline" size="sm" asChild>
            <Link href={copy.href}>{copy.action}</Link>
          </Button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
