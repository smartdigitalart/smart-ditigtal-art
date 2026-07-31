import { notFound } from "next/navigation"

import { getProductByIdAction } from "@/app/admin/(protected)/products/actions"
import { BuyNowCheckout } from "@/app/(store)/checkout/BuyNowCheckout"
import { CartCheckout } from "@/app/(store)/checkout/CartCheckout"

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string; qty?: string; variantId?: string }>
}) {
  const { productId, qty, variantId } = await searchParams

  let buyNowItem = null
  if (productId) {
    const product = await getProductByIdAction(productId)

    if (!product || product.status !== "ACTIVE") {
      notFound()
    }

    const variant = variantId
      ? product.variants.find((v) => v.id === variantId)
      : null

    if (variant ? !variant.inStock : !product.inStock) {
      notFound()
    }

    buyNowItem = {
      productId: product.id,
      variantId: variant?.id ?? null,
      variantLabel: variant?.label ?? null,
      name: product.name,
      price: variant ? variant.price : product.price,
      salePrice: variant ? variant.salePrice : product.salePrice,
      image: variant?.image ?? product.images[0]?.url ?? null,
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
