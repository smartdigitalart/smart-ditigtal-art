import { notFound } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import {
  ProductDetailView,
  type ProductDetailData,
} from "@/app/(store)/_components/ProductDetailView"

async function getProductBySlug(slug: string): Promise<ProductDetailData | null> {
  const supabase = await createClient()
  const { data: product } = await supabase
    .from("products")
    .select("id, name, description, images, price, sale_price, in_stock")
    .eq("slug", slug)
    .eq("status", "ACTIVE")
    .maybeSingle()

  if (!product) return null

  const { data: variantRows } = await supabase
    .from("product_variants")
    .select("id, label, price, sale_price, image, in_stock")
    .eq("product_id", product.id)
    .order("sort_order", { ascending: true })

  return {
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    images: (product.images as { id: string; url: string }[] | null) ?? [],
    price: Number(product.price),
    salePrice: product.sale_price !== null ? Number(product.sale_price) : null,
    inStock: Boolean(product.in_stock),
    variants: (variantRows ?? []).map((row) => ({
      id: row.id,
      label: row.label,
      price: Number(row.price),
      salePrice: row.sale_price !== null ? Number(row.sale_price) : null,
      image: row.image,
      inStock: Boolean(row.in_stock),
    })),
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  return <ProductDetailView product={product} />
}
