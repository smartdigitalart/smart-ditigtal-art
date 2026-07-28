import { notFound } from "next/navigation"

import { getProductByIdAction } from "@/app/admin/(protected)/products/actions"
import { BuyNowCheckout } from "@/app/(store)/checkout/BuyNowCheckout"
import { CartCheckout } from "@/app/(store)/checkout/CartCheckout"

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string; qty?: string }>
}) {
  const { productId, qty } = await searchParams

  let buyNowItem = null
  if (productId) {
    const product = await getProductByIdAction(productId)

    if (!product || product.status !== "ACTIVE" || !product.inStock) {
      notFound()
    }

    buyNowItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images[0]?.url ?? null,
      quantity: Math.max(1, Number(qty) || 1),
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">
        Checkout
      </h1>
      {buyNowItem ? (
        <BuyNowCheckout initialItem={buyNowItem} />
      ) : (
        <CartCheckout />
      )}
    </div>
  )
}
