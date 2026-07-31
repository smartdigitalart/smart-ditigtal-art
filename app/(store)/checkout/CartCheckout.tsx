"use client"

import Link from "next/link"
import { ShoppingBagIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store/cart-store"
import { CheckoutForm } from "@/app/(store)/checkout/CheckoutForm"

export function CartCheckout() {
  const items = useCartStore((state) => state.items)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const clearCart = useCartStore((state) => state.clearCart)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <ShoppingBagIcon className="size-10 text-muted-foreground" />
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button asChild>
          <Link href="/">Continue shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <CheckoutForm
      items={items}
      onQuantityChange={setQuantity}
      onRemove={removeItem}
      onOrderPlaced={clearCart}
    />
  )
}
