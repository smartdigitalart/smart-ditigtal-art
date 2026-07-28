"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  MinusIcon,
  PackageXIcon,
  PlusIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store/cart-store"

export function ProductPurchasePanel({
  productId,
  name,
  price,
  salePrice,
  image,
  inStock,
}: {
  productId: string
  name: string
  price: number
  salePrice: number | null
  image: string | null
  inStock: boolean
}) {
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    addItem({ productId, name, price, salePrice, image }, quantity)
  }

  const handleBuyNow = () => {
    router.push(`/checkout?productId=${productId}&qty=${quantity}`)
  }

  if (!inStock) {
    return (
      <Button size="lg" className="w-full sm:w-auto" disabled>
        <PackageXIcon data-icon="inline-start" />
        Out of Stock
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">Quantity</span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            <MinusIcon />
          </Button>
          <span className="w-6 text-center text-sm tabular-nums">
            {quantity}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
          >
            <PlusIcon />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          onClick={handleAddToCart}
        >
          <ShoppingCartIcon data-icon="inline-start" />
          Add to Cart
        </Button>
        <Button size="lg" className="flex-1" onClick={handleBuyNow}>
          <ShoppingBagIcon data-icon="inline-start" />
          Order Now
        </Button>
      </div>
    </div>
  )
}
