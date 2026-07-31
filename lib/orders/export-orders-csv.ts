import type { Order } from "@/lib/types/order"
import { formatOrderId } from "@/lib/orders/format-order-id"

const HEADERS = [
  "Order",
  "Customer",
  "Email",
  "Phone",
  "Status",
  "Items",
  "Total",
  "Delivery zone",
  "Date",
]

function escapeCsvValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

export function exportOrdersToCsv(orders: Order[]) {
  const rows = orders.map((order) => [
    formatOrderId(order.orderNumber),
    order.customerName,
    order.customerEmail,
    order.customerPhone,
    order.status,
    String(order.items.length),
    order.total.toFixed(2),
    order.deliveryZone ?? "",
    new Date(order.createdAt).toLocaleDateString(),
  ])

  const csv = [HEADERS, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
