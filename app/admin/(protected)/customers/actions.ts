"use server"

import { createClient } from "@/lib/supabase/server"
import type { Customer, CustomerUpdatePayload } from "@/lib/types/customer"

function mapCustomer(
  row: Record<string, unknown>,
  ordersCount: number,
  totalSpent: number
): Customer {
  return {
    id: row.id as string,
    name: (row.name as string) ?? "",
    email: (row.email as string) ?? "",
    phone: (row.phone as string) ?? "",
    avatar: (row.avatar_url as string | null) ?? null,
    status: row.status as Customer["status"],
    role: (row.role as Customer["role"]) ?? "customer",
    ordersCount,
    totalSpent,
    createdAt: row.created_at as string,
  }
}

export async function listCustomersAction(): Promise<Customer[]> {
  const supabase = await createClient()
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error

  const { data: orders } = await supabase
    .from("orders")
    .select("customer_id, total")

  const stats = new Map<string, { count: number; total: number }>()
  for (const order of orders ?? []) {
    if (!order.customer_id) continue
    const current = stats.get(order.customer_id) ?? { count: 0, total: 0 }
    current.count += 1
    current.total += Number(order.total)
    stats.set(order.customer_id, current)
  }

  return (profiles ?? []).map((p) => {
    const s = stats.get(p.id) ?? { count: 0, total: 0 }
    return mapCustomer(p, s.count, s.total)
  })
}

export async function getCustomerByIdAction(id: string): Promise<Customer | null> {
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error || !profile) return null

  const { data: orders } = await supabase
    .from("orders")
    .select("total")
    .eq("customer_id", id)

  const ordersCount = orders?.length ?? 0
  const totalSpent = (orders ?? []).reduce((sum, o) => sum + Number(o.total), 0)

  return mapCustomer(profile, ordersCount, totalSpent)
}

export async function updateCustomerAction(
  id: string,
  payload: CustomerUpdatePayload
): Promise<Customer> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .update({
      name: payload.name,
      phone: payload.phone,
      status: payload.status,
    })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error

  const { data: orders } = await supabase
    .from("orders")
    .select("total")
    .eq("customer_id", id)

  const ordersCount = orders?.length ?? 0
  const totalSpent = (orders ?? []).reduce((sum, o) => sum + Number(o.total), 0)

  return mapCustomer(data, ordersCount, totalSpent)
}

export async function updateCustomerRoleAction(
  id: string,
  role: Customer["role"]
): Promise<Customer> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error

  const { data: orders } = await supabase
    .from("orders")
    .select("total")
    .eq("customer_id", id)

  const ordersCount = orders?.length ?? 0
  const totalSpent = (orders ?? []).reduce((sum, o) => sum + Number(o.total), 0)

  return mapCustomer(data, ordersCount, totalSpent)
}
