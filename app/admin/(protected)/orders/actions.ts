"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdminProfile } from "@/lib/supabase/require-admin"
import type { Order, OrderStatus, OrderStatusHistoryEntry } from "@/lib/types/order"
import { mapOrder } from "@/lib/orders/map-order"

export async function listOrdersAction(): Promise<Order[]> {
  await requireAdminProfile()
  const supabase = createAdminClient()
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error

  const { data: profiles } = await supabase.from("profiles").select("id, name, email")
  const { data: items } = await supabase
    .from("order_items")
    .select("order_id, product_id, product_name, quantity, price")
  const { data: products } = await supabase.from("products").select("id, slug, images")

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]))
  const productById = new Map(
    (products ?? []).map((p) => [
      p.id as string,
      {
        slug: p.slug as string,
        image: (p.images as { id: string; url: string }[] | null)?.[0]?.url ?? null,
      },
    ])
  )
  const itemsByOrder = new Map<string, Order["items"]>()
  for (const item of items ?? []) {
    const product = item.product_id ? productById.get(item.product_id) : undefined
    const list = itemsByOrder.get(item.order_id) ?? []
    list.push({
      productId: item.product_id,
      productSlug: product?.slug ?? null,
      image: product?.image ?? null,
      productName: item.product_name,
      quantity: item.quantity,
      price: Number(item.price),
    })
    itemsByOrder.set(item.order_id, list)
  }

  return (orders ?? []).map((order) => {
    const profile = order.customer_id ? profileById.get(order.customer_id) : null
    return mapOrder(
      order,
      profile?.name ?? (order.customer_name as string | null) ?? "Guest",
      profile?.email ?? "",
      itemsByOrder.get(order.id) ?? []
    )
  })
}

export async function getOrderByIdAction(id: string): Promise<Order | null> {
  await requireAdminProfile()
  const supabase = createAdminClient()
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error || !order) return null

  let profile: { name: string | null; email: string | null } | null = null
  if (order.customer_id) {
    const { data } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", order.customer_id)
      .maybeSingle()
    profile = data
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, product_name, quantity, price")
    .eq("order_id", id)

  const productIds = (items ?? [])
    .map((item) => item.product_id)
    .filter((productId): productId is string => !!productId)
  const { data: products } =
    productIds.length > 0
      ? await supabase.from("products").select("id, slug, images").in("id", productIds)
      : { data: [] }
  const productById = new Map(
    (products ?? []).map((p) => [
      p.id as string,
      {
        slug: p.slug as string,
        image: (p.images as { id: string; url: string }[] | null)?.[0]?.url ?? null,
      },
    ])
  )

  return mapOrder(
    order,
    profile?.name ?? (order.customer_name as string | null) ?? "Guest",
    profile?.email ?? "",
    (items ?? []).map((item) => {
      const product = item.product_id ? productById.get(item.product_id) : undefined
      return {
        productId: item.product_id,
        productSlug: product?.slug ?? null,
        image: product?.image ?? null,
        productName: item.product_name,
        quantity: item.quantity,
        price: Number(item.price),
      }
    })
  )
}

export async function updateOrderStatusAction(
  id: string,
  status: OrderStatus
): Promise<void> {
  const admin = await requireAdminProfile()
  const supabase = createAdminClient()
  const { error } = await supabase.from("orders").update({ status }).eq("id", id)
  if (error) throw error

  await supabase
    .from("order_status_history")
    .insert({ order_id: id, status, changed_by: admin.id })
}

export async function getOrderStatusHistoryAction(
  id: string
): Promise<OrderStatusHistoryEntry[]> {
  await requireAdminProfile()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("order_status_history")
    .select("id, status, changed_by, created_at")
    .eq("order_id", id)
    .order("created_at", { ascending: false })
  if (error) throw error

  const changerIds = [
    ...new Set((data ?? []).map((row) => row.changed_by).filter((id): id is string => !!id)),
  ]
  const { data: profiles } =
    changerIds.length > 0
      ? await supabase.from("profiles").select("id, name, email").in("id", changerIds)
      : { data: [] }
  const nameById = new Map(
    (profiles ?? []).map((p) => [p.id, p.name ?? p.email ?? "Admin"])
  )

  return (data ?? []).map((row) => ({
    id: row.id as string,
    status: row.status as OrderStatus,
    changedBy: (row.changed_by as string | null) ?? null,
    changedByName: row.changed_by ? (nameById.get(row.changed_by) ?? null) : null,
    createdAt: row.created_at as string,
  }))
}

export async function updateOrderNotesAction(
  id: string,
  adminNotes: string
): Promise<void> {
  await requireAdminProfile()
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("orders")
    .update({ admin_notes: adminNotes || null })
    .eq("id", id)
  if (error) throw error
}

export async function updateOrderShippingAddressAction(
  id: string,
  shippingAddress: string
): Promise<void> {
  await requireAdminProfile()
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("orders")
    .update({ shipping_address: shippingAddress || null })
    .eq("id", id)
  if (error) throw error
}

export async function deleteOrderAction(id: string): Promise<void> {
  await requireAdminProfile()
  const supabase = createAdminClient()
  const { error } = await supabase.from("orders").delete().eq("id", id)
  if (error) throw error
}

export async function deleteOrdersAction(ids: string[]): Promise<void> {
  await requireAdminProfile()
  const supabase = createAdminClient()
  const { error } = await supabase.from("orders").delete().in("id", ids)
  if (error) throw error
}
