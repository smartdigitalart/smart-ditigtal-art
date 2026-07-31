"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Order } from "@/lib/types/order"
import { mapOrder } from "@/lib/orders/map-order"

async function requireCustomer() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  return user
}

export async function listMyOrdersAction(): Promise<Order[]> {
  const user = await requireCustomer()
  const admin = createAdminClient()

  const { data: orders, error } = await admin
    .from("orders")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
  if (error) throw error

  const orderIds = (orders ?? []).map((order) => order.id)
  const { data: items } = await admin
    .from("order_items")
    .select("order_id, product_name, quantity, price")
    .in("order_id", orderIds.length > 0 ? orderIds : [""])

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

  return (orders ?? []).map((order) =>
    mapOrder(
      order,
      user.user_metadata?.name ?? user.email ?? "",
      user.email ?? "",
      itemsByOrder.get(order.id) ?? []
    )
  )
}

export async function getMyOrderByIdAction(id: string): Promise<Order | null> {
  const user = await requireCustomer()
  const admin = createAdminClient()

  const { data: order, error } = await admin
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("customer_id", user.id)
    .maybeSingle()
  if (error || !order) return null

  const { data: items } = await admin
    .from("order_items")
    .select("product_name, quantity, price")
    .eq("order_id", id)

  return mapOrder(
    order,
    user.user_metadata?.name ?? user.email ?? "",
    user.email ?? "",
    (items ?? []).map((item) => ({
      productName: item.product_name,
      quantity: item.quantity,
      price: Number(item.price),
    }))
  )
}
