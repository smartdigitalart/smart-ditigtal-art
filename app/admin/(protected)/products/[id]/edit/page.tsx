import { notFound } from "next/navigation"

import { ProductForm } from "@/components/products/product-form"
import { getProductById } from "@/lib/mock-products"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = getProductById(id)

  if (!product) {
    notFound()
  }

  return <ProductForm product={product} />
}
