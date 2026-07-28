import { notFound } from "next/navigation"

import { getProductByIdAction } from "@/app/admin/(protected)/products/actions"
import { CheckoutForm } from "@/app/(store)/checkout/CheckoutForm"

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string; qty?: string }>
}) {
  const { productId, qty } = await searchParams

  if (!productId) {
    notFound()
  }

  const product = await getProductByIdAction(productId)

  if (!product || product.status !== "ACTIVE" || !product.inStock) {
    notFound()
  }

  const initialQuantity = Math.max(1, Number(qty) || 1)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">
        Checkout
      </h1>
      <CheckoutForm product={product} initialQuantity={initialQuantity} />
    </div>
  )
}
