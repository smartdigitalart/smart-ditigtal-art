"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdminProfile } from "@/lib/supabase/require-admin"
import type { Order, OrderStatus } from "@/lib/types/order"

function mapOrder(
  row: Record<string, unknown>,
  customerName: string,
  customerEmail: string,
  items: Order["items"]
): Order {
  return {
    id: row.id as string,
    customerId: (row.customer_id as string | null) ?? null,
    customerName,
    customerEmail,
    paymentMethod: "N/A",
    status: row.status as OrderStatus,
    total: Number(row.total),
    items,
    createdAt: row.created_at as string,
  }
}

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
    .select("order_id, product_name, quantity, price")

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]))
  const itemsByOrder = new Map<string, Order["items"]>()
  for (const item of items ?? []) {
    const list = itemsByOrder.get(item.order_id) ?? []
    list.push({
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
      profile?.name ?? "Guest",
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
    .select("product_name, quantity, price")
    .eq("order_id", id)

  return mapOrder(
    order,
    profile?.name ?? "Guest",
    profile?.email ?? "",
    (items ?? []).map((item) => ({
      productName: item.product_name,
      quantity: item.quantity,
      price: Number(item.price),
    }))
  )
}

export async function updateOrderStatusAction(
  id: string,
  status: OrderStatus
): Promise<void> {
  await requireAdminProfile()
  const supabase = createAdminClient()
  const { error } = await supabase.from("orders").update({ status }).eq("id", id)
  if (error) throw error
}
