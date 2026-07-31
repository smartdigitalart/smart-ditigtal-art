"use server"

import { createClient } from "@/lib/supabase/server"
import { DELIVERY_CHARGES, type DeliveryZone } from "@/lib/checkout/delivery"

export interface CheckoutLineItem {
  productId: string
  variantId: string | null
  quantity: number
}

export interface CheckoutPayload {
  items: CheckoutLineItem[]
  name: string
  phone: string
  address: string
  deliveryZone: DeliveryZone
}

export async function createOrderAction(
  payload: CheckoutPayload
): Promise<{ orderId: string }> {
  if (payload.items.length === 0) {
    throw new Error("Your cart is empty")
  }
  if (!payload.name.trim() || !payload.phone.trim() || !payload.address.trim()) {
    throw new Error("Name, phone, and address are required")
  }
  if (payload.items.some((item) => item.quantity < 1)) {
    throw new Error("Quantity must be at least 1")
  }

  const supabase = await createClient()

  const productIds = payload.items.map((item) => item.productId)
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id, name, price, sale_price, status, in_stock")
    .in("id", productIds)

  if (productError || !products || products.length !== productIds.length) {
    throw new Error("One or more products could not be found")
  }

  const productById = new Map(products.map((p) => [p.id, p]))

  const variantIds = payload.items
    .map((item) => item.variantId)
    .filter((id): id is string => !!id)
  const { data: variants } =
    variantIds.length > 0
      ? await supabase
          .from("product_variants")
          .select("id, product_id, label, price, sale_price, in_stock")
          .in("id", variantIds)
      : { data: [] }
  const variantById = new Map((variants ?? []).map((v) => [v.id, v]))

  let subtotal = 0
  const orderItemRows = payload.items.map((item) => {
    const product = productById.get(item.productId)
    if (!product) {
      throw new Error("Product not found")
    }

    const variant = item.variantId ? variantById.get(item.variantId) : null
    if (item.variantId && (!variant || variant.product_id !== product.id)) {
      throw new Error(`${product.name}: selected option is no longer available`)
    }

    if (variant) {
      if (!variant.in_stock) {
        throw new Error(`${product.name} (${variant.label}) is no longer available`)
      }
    } else if (product.status !== "ACTIVE" || !product.in_stock) {
      throw new Error(`${product.name} is no longer available`)
    }

    const unitPrice = variant
      ? variant.sale_price !== null
        ? Number(variant.sale_price)
        : Number(variant.price)
      : product.sale_price !== null
        ? Number(product.sale_price)
        : Number(product.price)

    subtotal += unitPrice * item.quantity
    return {
      product_id: product.id,
      product_name: variant ? `${product.name} (${variant.label})` : product.name,
      quantity: item.quantity,
      price: unitPrice,
    }
  })

  const deliveryCharge = DELIVERY_CHARGES[payload.deliveryZone]
  const total = subtotal + deliveryCharge

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

  const { error: itemError } = await supabase.from("order_items").insert(
    orderItemRows.map((row) => ({ ...row, order_id: order.id }))
  )

  if (itemError) {
    throw new Error("Failed to save order items")
  }

  return { orderId: order.id as string }
}
