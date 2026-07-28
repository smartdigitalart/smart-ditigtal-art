"use server"

import { createClient } from "@/lib/supabase/server"

export const DELIVERY_CHARGES = {
  inside_dhaka: 70,
  outside_dhaka: 120,
} as const

export type DeliveryZone = keyof typeof DELIVERY_CHARGES

export interface CheckoutPayload {
  productId: string
  quantity: number
  name: string
  phone: string
  address: string
  deliveryZone: DeliveryZone
}

export async function createOrderAction(
  payload: CheckoutPayload
): Promise<{ orderId: string }> {
  const supabase = await createClient()

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, price, sale_price, status, in_stock")
    .eq("id", payload.productId)
    .maybeSingle()

  if (productError || !product) {
    throw new Error("Product not found")
  }
  if (product.status !== "ACTIVE" || !product.in_stock) {
    throw new Error("This product is no longer available")
  }
  if (payload.quantity < 1) {
    throw new Error("Quantity must be at least 1")
  }
  if (!payload.name.trim() || !payload.phone.trim() || !payload.address.trim()) {
    throw new Error("Name, phone, and address are required")
  }

  const unitPrice =
    product.sale_price !== null ? Number(product.sale_price) : Number(product.price)
  const deliveryCharge = DELIVERY_CHARGES[payload.deliveryZone]
  const total = unitPrice * payload.quantity + deliveryCharge

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user?.id ?? null,
      customer_name: payload.name.trim(),
      customer_phone: payload.phone.trim(),
      shipping_address: payload.address.trim(),
      delivery_zone: payload.deliveryZone,
      delivery_charge: deliveryCharge,
      status: "Pending",
      total,
    })
    .select("id")
    .single()

  if (orderError || !order) {
    throw new Error("Failed to create order")
  }

  const { error: itemError } = await supabase.from("order_items").insert({
    order_id: order.id,
    product_id: product.id,
    product_name: product.name,
    quantity: payload.quantity,
    price: unitPrice,
  })

  if (itemError) {
    throw new Error("Failed to save order items")
  }

  return { orderId: order.id as string }
}
