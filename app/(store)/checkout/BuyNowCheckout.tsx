"use client"

import { useState } from "react"

import { CheckoutForm, type CheckoutLineItem } from "@/app/(store)/checkout/CheckoutForm"

export function BuyNowCheckout({
  initialItem,
}: {
  initialItem: CheckoutLineItem
}) {
  const [item, setItem] = useState(initialItem)

  return (
    <CheckoutForm
      items={[item]}
      onQuantityChange={(_productId, _variantId, quantity) =>
        setItem((prev) => ({ ...prev, quantity: Math.max(1, quantity) }))
      }
    />
  )
}
