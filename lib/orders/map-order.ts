import type { Order, OrderStatus } from "@/lib/types/order"

export function mapOrder(
  row: Record<string, unknown>,
  customerName: string,
  customerEmail: string,
  items: Order["items"]
): Order {
  return {
    id: row.id as string,
    orderNumber: Number(row.order_number),
    customerId: (row.customer_id as string | null) ?? null,
    customerName,
    customerEmail,
    customerPhone: (row.customer_phone as string | null) ?? "",
    paymentMethod: "N/A",
    status: row.status as OrderStatus,
    total: Number(row.total),
    shippingAddress: (row.shipping_address as string | null) ?? null,
    deliveryZone: (row.delivery_zone as Order["deliveryZone"]) ?? null,
    deliveryCharge: Number(row.delivery_charge ?? 0),
    items,
    createdAt: row.created_at as string,
  }
}
